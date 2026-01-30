'use server'

import { GetCoursesParams, GetCoursesResponse } from '@/features/courses/types'
import { Prisma } from '@/features/shared/lib/generated/prisma/client'
import { prisma } from '@/features/shared/lib/prisma'

export async function getCourses(
  {
    pageIndex = 0,
    pageSize = 10,
    sorting = [],
    globalFilter = '',
  }: GetCoursesParams = {
    pageIndex: 0,
    pageSize: 10,
  }
): Promise<GetCoursesResponse> {
  const globalConditions: Prisma.CourseWhereInput[] = []

  if (globalFilter) {
    globalConditions.push({
      OR: [{ name: { contains: globalFilter } }],
    })
  }

  const whereMain: Prisma.CourseWhereInput =
    [...globalConditions].length > 0 ? { AND: [...globalConditions] } : {}

  const orderBy: Prisma.CourseOrderByWithRelationInput[] =
    sorting.length > 0
      ? sorting.map((sort) => {
          if (sort.id === 'name') {
            return { name: sort.desc ? 'desc' : 'asc' }
          }
          return { [sort.id]: sort.desc ? 'desc' : 'asc' }
        })
      : [{ name: 'asc' }]

  const [count, data] = await prisma.$transaction([
    prisma.course.count({ where: whereMain }),
    prisma.course.findMany({
      where: whereMain,
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy,
    }),
  ])

  return {
    data,
    pageCount: Math.ceil(count / pageSize),
    rowCount: count,
  }
}
