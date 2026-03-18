'use server'

import { unstable_cache } from 'next/cache'

import {
  CardData,
  GetCoursesAtProvadisResponse,
  GetCoursesWithoutProvadisExperienceResponse,
} from '@/features/reports/types'
import { prisma } from '@/features/shared/lib/prisma'

async function getCoursesAtProvadis(): Promise<GetCoursesAtProvadisResponse> {
  const response = await prisma.lecturer.findMany({
    select: {
      title: true,
      firstName: true,
      lastName: true,
      qualifications: {
        where: { experience: 'provadis' },
        select: {
          course: {
            select: { name: true },
          },
        },
      },
    },
  })

  return response.reduce((acc, lecturer) => {
    const lecturerName = `${lecturer.title ? lecturer.title + ' ' : ''}${lecturer.firstName} ${lecturer.lastName}`
    const courses = lecturer.qualifications.map((q) => q.course.name)
    acc[lecturerName] = courses
    return acc
  }, {} as GetCoursesAtProvadisResponse)
}

async function getCoursesWithoutProvadisExperience(): Promise<GetCoursesWithoutProvadisExperienceResponse> {
  const courses = await prisma.course.findMany({
    where: {
      qualifications: {
        none: { experience: 'provadis' },
      },
    },
    select: { name: true },
  })
  return courses.map((c) => c.name)
}

async function getCoursesWithoutLecturer(): Promise<GetCoursesWithoutProvadisExperienceResponse> {
  const courses = await prisma.course.findMany({
    where: {
      assignments: {
        none: {},
      },
    },
    select: { name: true },
  })
  return courses.map((c) => c.name)
}

async function getCardDataInternal(): Promise<CardData> {
  return {
    coursesAtProvadis: await getCoursesAtProvadis(),
    coursesWithoutProvadisExperience:
      await getCoursesWithoutProvadisExperience(),
    coursesWithoutLecturer: await getCoursesWithoutLecturer(),
  }
}

export async function getCardData(): Promise<CardData> {
  return unstable_cache(
    async () => getCardDataInternal(),
    ['reports-card-data-get'],
    {
      tags: ['reports', 'lecturers', 'courses'], // Bin mir hier nicht sicher, welche Tags bereits existieren und hier eingefügt werden sollten
      revalidate: 3600,
    }
  )()
}
