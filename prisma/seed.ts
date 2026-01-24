import 'dotenv/config'

import { PrismaClient } from '@/features/shared/lib/generated/prisma/client'
import {
  CourseLevelPreference,
  LecturerType,
} from '@/features/shared/lib/generated/prisma/enums'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

const lecturers = [
  {
    title: 'Prof.',
    firstName: 'Thomas',
    secondName: null,
    lastName: 'Schneider',
    email: 'thomas.schneider@provadis-hochschule.de',
    phone: '+496152872341',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: 'Dr.',
    firstName: 'Julia',
    secondName: 'Marie',
    lastName: 'Köhler',
    email: 'julia.koehler@provadis-hochschule.de',
    phone: '+496108945672',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: null,
    firstName: 'Markus',
    secondName: null,
    lastName: 'Weber',
    email: 'markus.weber@dozent-mail.de',
    phone: '+4917643892154',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.bachelor,
  },
  {
    title: 'Prof.',
    firstName: 'Andreas',
    secondName: null,
    lastName: 'Hoffmann',
    email: 'andreas.hoffmann@uni-mail.net',
    phone: '+492217843921',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: 'Dr.',
    firstName: 'Sabine',
    secondName: null,
    lastName: 'Neumann',
    email: 'sabine.neumann@provadis-hochschule.de',
    phone: '+496152879834',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: null,
    firstName: 'Laura',
    secondName: 'Sophie',
    lastName: 'Bauer',
    email: 'laura.bauer@lehrbeauftragte.de',
    phone: '+4915167239841',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.bachelor,
  },
  {
    title: 'Prof.',
    firstName: 'Michael',
    secondName: null,
    lastName: 'Krüger',
    email: 'michael.krueger@provadis-hochschule.de',
    phone: '+496152870112',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: 'Dr.',
    firstName: 'Daniel',
    secondName: null,
    lastName: 'Richter',
    email: 'daniel.richter@hochschule-mail.org',
    phone: '+493415678392',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: null,
    firstName: 'Stefan',
    secondName: null,
    lastName: 'Müller',
    email: 'stefan.mueller@provadis-hochschule.de',
    phone: '+496152873509',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.bachelor,
  },
  {
    title: 'Dr.',
    firstName: 'Katharina',
    secondName: null,
    lastName: 'Fischer',
    email: 'katharina.fischer@dozentenpool.de',
    phone: '+497114582391',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: 'Prof.',
    firstName: 'Alexander',
    secondName: null,
    lastName: 'Becker',
    email: 'alexander.becker@provadis-hochschule.de',
    phone: '+496152874618',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: null,
    firstName: 'Nina',
    secondName: 'Elisabeth',
    lastName: 'Wagner',
    email: 'nina.wagner@lehrauftrag.net',
    phone: '+4916098234751',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.bachelor,
  },
  {
    title: 'Dr.',
    firstName: 'Patrick',
    secondName: null,
    lastName: 'Lorenz',
    email: 'patrick.lorenz@provadis-hochschule.de',
    phone: '+496152878204',
    type: LecturerType.internal,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: null,
    firstName: 'Christian',
    secondName: null,
    lastName: 'Seidel',
    email: 'christian.seidel@fachdozent.org',
    phone: '+493516789452',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.master,
  },
  {
    title: 'Prof.',
    firstName: 'Bernd',
    secondName: null,
    lastName: 'Hartmann',
    email: 'bernd.hartmann@business-school.edu',
    phone: '+498956238741',
    type: LecturerType.external,
    courseLevelPreference: CourseLevelPreference.both,
  },
  {
    title: 'Dr.',
    firstName: 'Franziska',
    secondName: null,
    lastName: 'Otto',
    email: 'franziska.otto@provadis-hochschule.de',
    phone: '+496152876993',
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
