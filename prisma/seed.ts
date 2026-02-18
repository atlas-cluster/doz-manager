import 'dotenv/config'

import {
  CourseLevel,
  PrismaClient,
} from '@/features/shared/lib/generated/prisma/client'
import {
  CourseLevelPreference,
  LecturerType,
} from '@/features/shared/lib/generated/prisma/enums'
import lecturerQualifications from '@/prisma/qualification-data'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_ROOT_USER,
  password: process.env.DB_ROOT_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
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

const courses = [
  {
    name: 'Einführung in die Informatik',
    isOpen: true,
    courseLevel: CourseLevel.bachelor,
    semester: 1,
  },
  {
    name: 'Software Engineering I',
    isOpen: true,
    courseLevel: CourseLevel.bachelor,
    semester: 3,
  },
  {
    name: 'Grundlagen der BWL',
    isOpen: false,
    courseLevel: CourseLevel.bachelor,
    semester: 1,
  },
  {
    name: 'Fortgeschrittene Datenstrukturen',
    isOpen: true,
    courseLevel: CourseLevel.master,
    semester: 1,
  },
  {
    name: 'Cloud Computing Architekturen',
    isOpen: true,
    courseLevel: CourseLevel.master,
    semester: 2,
  },
  {
    name: 'Marketing Management',
    isOpen: true,
    courseLevel: CourseLevel.bachelor,
    semester: 4,
  },
  {
    name: 'Angewandte Künstliche Intelligenz',
    isOpen: true,
    courseLevel: CourseLevel.master,
    semester: 3,
  },
  {
    name: 'Web-Technologien',
    isOpen: true,
    courseLevel: CourseLevel.bachelor,
    semester: 2,
  },
  {
    name: 'Strategische Unternehmensfinanzierung',
    isOpen: false,
    courseLevel: CourseLevel.master,
    semester: 2,
  },
  {
    name: 'Agiles Projektmanagement',
    isOpen: true,
    courseLevel: CourseLevel.bachelor,
    semester: 5,
  },
  {
    name: 'Datenbanksysteme',
    isOpen: true,
    courseLevel: CourseLevel.bachelor,
    semester: 2,
  },
  {
    name: 'IT-Sicherheit & Compliance',
    isOpen: true,
    courseLevel: CourseLevel.master,
    semester: 1,
  },
]

const lecturerAssignments = {
  'thomas.schneider@provadis-hochschule.de': [
    'Einführung in die Informatik',
    'Cloud Computing Architekturen',
  ],
  'julia.koehler@provadis-hochschule.de': [
    'Fortgeschrittene Datenstrukturen',
    'Angewandte Künstliche Intelligenz',
  ],
  'markus.weber@dozent-mail.de': ['Software Engineering I', 'Web-Technologien'],
  'andreas.hoffmann@uni-mail.net': ['Strategische Unternehmensfinanzierung'],
  'sabine.neumann@provadis-hochschule.de': [
    'Grundlagen der BWL',
    'IT-Sicherheit & Compliance',
  ],
  'laura.bauer@lehrbeauftragte.de': [
    'Marketing Management',
    'Datenbanksysteme',
  ],
  'michael.krueger@provadis-hochschule.de': [
    'Agiles Projektmanagement',
    'Angewandte Künstliche Intelligenz',
  ],
}

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

  for (const course of courses) {
    const existingCourse = await prisma.course.findFirst({
      where: {
        name: course.name,
        courseLevel: course.courseLevel,
      },
    })

    if (!existingCourse) {
      const newCourse = await prisma.course.create({
        data: course,
      })
      console.log(`Created course with id: ${newCourse.id}`)
    } else {
      console.log(`Course already exists: ${course.name}`)
    }
  }

  console.log(`Assigning lecturers to courses...`)
  for (const [lecturerEmail, courseNames] of Object.entries(
    lecturerAssignments
  )) {
    const lecturer = await prisma.lecturer.findUnique({
      where: { email: lecturerEmail },
    })
    if (!lecturer) continue

    for (const courseName of courseNames) {
      const course = await prisma.course.findFirst({
        where: { name: courseName },
      })
      if (!course || !lecturer) continue

      const existingAssignment = await prisma.courseAssignment.findFirst({
        where: {
          courseId: course.id,
          lecturerId: lecturer.id,
        },
      })

      if (!existingAssignment) {
        await prisma.courseAssignment.create({
          data: {
            courseId: course.id,
            lecturerId: lecturer.id,
          },
        })
        console.log(`Assigned ${lecturerEmail} to ${courseName}`)
      } else {
        console.log(
          `Assignment already exists: ${lecturerEmail} -> ${courseName}`
        )
      }
    }
  }
  console.log(`Assigning lecturer qualifications...`)
  for (const [lecturerEmail, courseQuals] of Object.entries(
    lecturerQualifications
  )) {
    const lecturer = await prisma.lecturer.findUnique({
      where: { email: lecturerEmail },
    })
    if (!lecturer) continue

    for (const [courseName, qualification] of Object.entries(courseQuals)) {
      const course = await prisma.course.findFirst({
        where: { name: courseName },
      })
      if (!course || !lecturer) continue

      const existingQualification = await prisma.courseQualification.findFirst({
        where: {
          courseId: course.id,
          lecturerId: lecturer.id,
        },
      })

      if (!existingQualification) {
        await prisma.courseQualification.create({
          data: {
            courseId: course.id,
            lecturerId: lecturer.id,
            leadTime: qualification.leadTime,
            experience: qualification.experience,
          },
        })
        console.log(
          `Added qualification for ${lecturerEmail} -> ${courseName}: ${qualification.leadTime}/${qualification.experience}`
        )
      } else {
        console.log(
          `Qualification already exists: ${lecturerEmail} -> ${courseName}`
        )
      }
    }
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
