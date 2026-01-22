import 'dotenv/config'
import { Pool } from 'pg'

import { PrismaClient } from '@/features/shared/lib/generated/prisma/client'
import {
  CourseLevelPreference,
  LecturerType,
} from '@/features/shared/lib/generated/prisma/enums'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const lecturers = [
  {
    title: 'Prof.',
    firstName: 'Thomas',
    secondName: null,
    lastName: 'Schneider',
    email: 'thomas.schneider@provadis-hochschule.de',
    phone: '+49 6152 872341',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: 'Dr.',
    firstName: 'Julia',
    secondName: 'Marie',
    lastName: 'Köhler',
    email: 'julia.koehler@provadis-hochschule.de',
    phone: '+49 6108 945672',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: null,
    firstName: 'Markus',
    secondName: null,
    lastName: 'Weber',
    email: 'markus.weber@dozent-mail.de',
    phone: '+49 176 43892154',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.bachelor,
  },
  {
    title: 'Prof.',
    firstName: 'Andreas',
    secondName: null,
    lastName: 'Hoffmann',
    email: 'andreas.hoffmann@uni-mail.net',
    phone: '+49 221 7843921',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: 'Dr.',
    firstName: 'Sabine',
    secondName: null,
    lastName: 'Neumann',
    email: 'sabine.neumann@provadis-hochschule.de',
    phone: '+49 6152 879834',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: null,
    firstName: 'Laura',
    secondName: 'Sophie',
    lastName: 'Bauer',
    email: 'laura.bauer@lehrbeauftragte.de',
    phone: '+49 151 67239841',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.bachelor,
  },
  {
    title: 'Prof.',
    firstName: 'Michael',
    secondName: null,
    lastName: 'Krüger',
    email: 'michael.krueger@provadis-hochschule.de',
    phone: '+49 6152 870112',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: 'Dr.',
    firstName: 'Daniel',
    secondName: null,
    lastName: 'Richter',
    email: 'daniel.richter@hochschule-mail.org',
    phone: '+49 341 5678392',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: null,
    firstName: 'Stefan',
    secondName: null,
    lastName: 'Müller',
    email: 'stefan.mueller@provadis-hochschule.de',
    phone: '+49 6152 873509',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.bachelor,
  },
  {
    title: 'Dr.',
    firstName: 'Katharina',
    secondName: null,
    lastName: 'Fischer',
    email: 'katharina.fischer@dozentenpool.de',
    phone: '+49 711 4582391',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: 'Prof.',
    firstName: 'Alexander',
    secondName: null,
    lastName: 'Becker',
    email: 'alexander.becker@provadis-hochschule.de',
    phone: '+49 6152 874618',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: null,
    firstName: 'Nina',
    secondName: 'Elisabeth',
    lastName: 'Wagner',
    email: 'nina.wagner@lehrauftrag.net',
    phone: '+49 160 98234751',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.bachelor,
  },
  {
    title: 'Dr.',
    firstName: 'Patrick',
    secondName: null,
    lastName: 'Lorenz',
    email: 'patrick.lorenz@provadis-hochschule.de',
    phone: '+49 6152 878204',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: null,
    firstName: 'Christian',
    secondName: null,
    lastName: 'Seidel',
    email: 'christian.seidel@fachdozent.org',
    phone: '+49 351 6789452',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: 'Prof.',
    firstName: 'Bernd',
    secondName: null,
    lastName: 'Hartmann',
    email: 'bernd.hartmann@business-school.edu',
    phone: '+49 89 56238741',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: 'Dr.',
    firstName: 'Franziska',
    secondName: null,
    lastName: 'Otto',
    email: 'franziska.otto@provadis-hochschule.de',
    phone: '+49 6152 876993',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.bachelor,
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const lecturer of lecturers) {
    const user = await prisma.lecturer.upsert({
      where: { email: lecturer.email },
      update: {},
      create: lecturer,
    })
    console.log(`Created lecturer with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
