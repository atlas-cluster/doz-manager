'use server'

import { symmetricDecrypt } from 'better-auth/crypto'
import { unstable_cache } from 'next/cache'

import {
  AccessControlUser,
  GetUsersParams,
  GetUsersResponse,
} from '@/features/access-control/types'
import { Prisma } from '@/features/shared/lib/generated/prisma/client'
import { prisma } from '@/features/shared/lib/prisma'

function getAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('Missing BETTER_AUTH_SECRET or AUTH_SECRET')
  }
  return secret
}

async function decryptBackupCodeCount(
  encryptedBackupCodes: string
): Promise<number> {
  try {
    const decrypted = await symmetricDecrypt({
      key: getAuthSecret(),
      data: encryptedBackupCodes,
    })
    const codes = JSON.parse(decrypted)
    return Array.isArray(codes) ? codes.length : 0
  } catch {
    return 0
  }
}

async function getUsersInternal({
  pageIndex = 0,
  pageSize = 10,
  sorting = [],
  columnFilters = [],
  globalFilter = '',
}: GetUsersParams): Promise<GetUsersResponse> {
  const globalConditions: Prisma.UserWhereInput[] = []
  const adminConditions: Prisma.UserWhereInput[] = []

  if (globalFilter) {
    globalConditions.push({
      OR: [
        { name: { contains: globalFilter } },
        { email: { contains: globalFilter } },
      ],
    })
  }

  for (const filter of columnFilters) {
    if (filter.id === 'isAdmin' && Array.isArray(filter.value)) {
      const boolValues = (filter.value as string[]).map((v) => v === 'true')
      if (boolValues.length === 1) {
        adminConditions.push({ isAdmin: { equals: boolValues[0] } })
      }
      // If both true and false are selected, no filter needed (shows all)
    }
  }

  const whereMain: Prisma.UserWhereInput =
    [...globalConditions, ...adminConditions].length > 0
      ? { AND: [...globalConditions, ...adminConditions] }
      : {}

  // For facets: exclude admin filter from the facet query so counts stay correct
  const whereAdminFacet: Prisma.UserWhereInput =
    [...globalConditions].length > 0 ? { AND: [...globalConditions] } : {}

  const orderBy: Prisma.UserOrderByWithRelationInput[] =
    sorting.length > 0
      ? sorting
          .filter(
            (sort) => sort.id !== 'lastLogin' && sort.id !== 'backupCodeCount'
          )
          .map((sort) => {
            if (sort.id === 'name') {
              return { name: sort.desc ? 'desc' : 'asc' }
            }
            return { [sort.id]: sort.desc ? 'desc' : 'asc' }
          })
      : [{ name: 'asc' }]

  const [count, users, adminFacets] = await prisma.$transaction([
    prisma.user.count({ where: whereMain }),
    prisma.user.findMany({
      where: whereMain,
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy,
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
        twofactors: {
          select: { backupCodes: true },
        },
        accounts: {
          select: { providerId: true },
        },
      },
    }),
    prisma.user.groupBy({
      by: ['isAdmin'],
      where: whereAdminFacet,
      orderBy: { isAdmin: 'asc' },
      _count: { isAdmin: true },
    }),
  ])

  let data: AccessControlUser[] = await Promise.all(
    users.map(async (user) => {
      const lastSession = user.sessions[0]
      const twoFactor = user.twofactors[0]

      const backupCodeCount = twoFactor?.backupCodes
        ? await decryptBackupCodeCount(twoFactor.backupCodes)
        : 0

      const authProviders = [...new Set(user.accounts.map((a) => a.providerId))]

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        isAdmin: user.isAdmin,
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
        createdAt: user.createdAt,
        lastLogin: lastSession?.createdAt ?? null,
        backupCodeCount,
        authProviders,
      }
    })
  )

  // Client-side sorting for lastLogin and backupCodeCount (cannot be done in Prisma)
  const lastLoginSort = sorting.find((s) => s.id === 'lastLogin')
  if (lastLoginSort) {
    data = data.sort((a, b) => {
      const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0
      const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0
      return lastLoginSort.desc ? bTime - aTime : aTime - bTime
    })
  }

  const backupSort = sorting.find((s) => s.id === 'backupCodeCount')
  if (backupSort) {
    data = data.sort((a, b) => {
      return backupSort.desc
        ? b.backupCodeCount - a.backupCodeCount
        : a.backupCodeCount - b.backupCodeCount
    })
  }

  return {
    data,
    pageCount: Math.ceil(count / pageSize),
    rowCount: count,
    facets: {
      isAdmin: Object.fromEntries(
        adminFacets.map((f) => [
          String(f.isAdmin),
          (f._count as { isAdmin: number }).isAdmin ?? 0,
        ])
      ),
    },
  }
}

export async function getUsers(
  params: GetUsersParams = {
    pageIndex: 0,
    pageSize: 10,
  }
) {
  return unstable_cache(
    async () => getUsersInternal(params),
    ['users-get', JSON.stringify(params)],
    {
      tags: ['users'],
      revalidate: 3600,
    }
  )()
}
