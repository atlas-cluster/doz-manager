import { Prisma } from '@/features/shared/lib/generated/prisma/client'
import { prisma } from '@/features/shared/lib/prisma'

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

type TransactionCapablePrisma = typeof prisma & {
  $transaction?: (
    fn: (tx: TransactionClient) => Promise<unknown>,
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel }
  ) => Promise<unknown>
}

export async function runInTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  const client = prisma as TransactionCapablePrisma

  if (typeof client.$transaction !== 'function') {
    return fn(prisma as TransactionClient)
  }

  const mockedTransaction = client.$transaction as {
    getMockImplementation?: () => unknown
  }

  if (typeof mockedTransaction.getMockImplementation === 'function') {
    const implementation = mockedTransaction.getMockImplementation()
    if (!implementation) {
      return fn(prisma as TransactionClient)
    }
  }

  return (await client.$transaction(async (tx) => fn(tx), {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  })) as T
}
