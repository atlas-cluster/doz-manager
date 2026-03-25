import { revalidateTag } from 'next/cache'

import { courseSchema } from '@/features/courses/schemas/course'
import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { qualificationSchema } from '@/features/lecturers/schemas/qualification'
import { prisma } from '@/features/shared/lib/prisma'

type ToolFunctionDefinition = {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

export type ChatToolDefinition = {
  type: 'function'
  function: ToolFunctionDefinition
}

type ChatToolCall = {
  name: string
  arguments: Record<string, unknown>
}

type ResolvedEntity<T> =
  | {
      ok: true
      value: T
      matches: Array<{ id: string; label: string; score: number }>
    }
  | {
      ok: false
      reason: 'not_found' | 'ambiguous'
      entity: 'lecturer' | 'course'
      query: string
      matches: Array<{ id: string; label: string; score: number }>
    }

type UserFeature = {
  key: string
  title: string
  path: string
  description: string
  adminOnly: boolean
}

const ALL_FEATURES: UserFeature[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    description: 'Überblick über die wichtigsten Kennzahlen.',
    adminOnly: false,
  },
  {
    key: 'lecturers',
    title: 'Dozenten',
    path: '/lecturers',
    description: 'Dozenten verwalten und durchsuchen.',
    adminOnly: false,
  },
  {
    key: 'courses',
    title: 'Vorlesungen',
    path: '/courses',
    description: 'Vorlesungen verwalten und zuordnen.',
    adminOnly: false,
  },
  {
    key: 'reports',
    title: 'Berichte',
    path: '/reports',
    description: 'Auswertungen und Exporte.',
    adminOnly: false,
  },
  {
    key: 'settings',
    title: 'Einstellungen',
    path: '/settings',
    description: 'Persönliche und System-Einstellungen.',
    adminOnly: false,
  },
  {
    key: 'access-control',
    title: 'Zugriffsverwaltung',
    path: '/access-control',
    description: 'Benutzer und Rollen verwalten.',
    adminOnly: true,
  },
]

export function getVisibleFeatures(isAdmin: boolean) {
  return ALL_FEATURES.filter((feature) => isAdmin || !feature.adminOnly)
}

function normalizeForSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function splitSearchTokens(value: string) {
  return normalizeForSearch(value).split(/\s+/).filter(Boolean)
}

function uniq(values: string[]) {
  return Array.from(new Set(values))
}

function normalizeLimit(value: unknown, fallback: number, max = 50) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.max(1, Math.min(max, Math.floor(value)))
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asNullableString(value: unknown) {
  if (value === null) return null
  return typeof value === 'string' ? value.trim() : undefined
}

function asOptionalBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

function asNullableInt(value: unknown) {
  if (value === null) return null
  if (typeof value !== 'number' || !Number.isInteger(value)) return undefined
  return value
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

function isCourseLevel(value: unknown): value is 'bachelor' | 'master' {
  return value === 'bachelor' || value === 'master'
}

function isLecturerType(value: unknown): value is 'internal' | 'external' {
  return value === 'internal' || value === 'external'
}

function isCourseLevelPreference(
  value: unknown
): value is 'bachelor' | 'master' | 'both' {
  return value === 'bachelor' || value === 'master' || value === 'both'
}

function isLeadTimeOption(
  value: unknown
): value is 'short' | 'four_weeks' | 'more_weeks' {
  return value === 'short' || value === 'four_weeks' || value === 'more_weeks'
}

function isExperienceOption(
  value: unknown
): value is 'none' | 'other_uni' | 'provadis' {
  return value === 'none' || value === 'other_uni' || value === 'provadis'
}

function buildLecturerLabel(lecturer: {
  title: string | null
  firstName: string
  secondName: string | null
  lastName: string
  email: string
}) {
  return [
    lecturer.title,
    lecturer.firstName,
    lecturer.secondName,
    lecturer.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

function scoreTextAgainstQuery(texts: string[], query: string) {
  const normalizedQuery = normalizeForSearch(query)
  const tokens = splitSearchTokens(query)
  if (!normalizedQuery || tokens.length === 0) return 0

  let score = 0

  for (const text of texts) {
    const normalizedText = normalizeForSearch(text)
    const compactText = normalizedText.replace(/\s+/g, '')
    const compactQuery = normalizedQuery.replace(/\s+/g, '')

    if (normalizedText === normalizedQuery) score = Math.max(score, 300)
    if (compactText === compactQuery) score = Math.max(score, 290)
    if (normalizedText.includes(normalizedQuery)) score = Math.max(score, 220)

    const tokenHits = tokens.filter((token) => normalizedText.includes(token))
    if (tokenHits.length > 0) {
      score = Math.max(score, tokenHits.length * 40)
    }

    if (tokens.every((token) => normalizedText.includes(token))) {
      score = Math.max(score, 240 + tokens.length * 5)
    }
  }

  return score
}

async function resolveLecturerByQuery(query: string): Promise<
  ResolvedEntity<{
    id: string
    title: string | null
    firstName: string
    secondName: string | null
    lastName: string
    email: string
    phone: string
    type: 'internal' | 'external'
    courseLevelPreference: 'bachelor' | 'master' | 'both'
  }>
> {
  const tokens = uniq(splitSearchTokens(query))

  if (tokens.length === 0) {
    return {
      ok: false,
      reason: 'not_found',
      entity: 'lecturer',
      query,
      matches: [],
    }
  }

  const lecturers = await prisma.lecturer.findMany({
    where: {
      OR: tokens.flatMap((token) => [
        { firstName: { contains: token } },
        { secondName: { contains: token } },
        { lastName: { contains: token } },
        { email: { contains: token } },
      ]),
    },
    take: 25,
    select: {
      id: true,
      title: true,
      firstName: true,
      secondName: true,
      lastName: true,
      email: true,
      phone: true,
      type: true,
      courseLevelPreference: true,
    },
  })

  const ranked = lecturers
    .map((lecturer) => {
      const label = buildLecturerLabel(lecturer)
      const score = scoreTextAgainstQuery(
        [
          label,
          `${lecturer.firstName} ${lecturer.lastName}`,
          lecturer.email,
          lecturer.lastName,
          lecturer.firstName,
          lecturer.secondName ?? '',
        ],
        query
      )

      return {
        lecturer,
        label,
        score,
      }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))

  if (ranked.length === 0) {
    return {
      ok: false,
      reason: 'not_found',
      entity: 'lecturer',
      query,
      matches: [],
    }
  }

  const top = ranked[0]
  const closeMatches = ranked.filter((entry) => top.score - entry.score <= 15)

  if (closeMatches.length > 1) {
    return {
      ok: false,
      reason: 'ambiguous',
      entity: 'lecturer',
      query,
      matches: closeMatches.slice(0, 5).map((entry) => ({
        id: entry.lecturer.id,
        label: entry.label,
        score: entry.score,
      })),
    }
  }

  return {
    ok: true,
    value: top.lecturer,
    matches: ranked.slice(0, 5).map((entry) => ({
      id: entry.lecturer.id,
      label: entry.label,
      score: entry.score,
    })),
  }
}

async function resolveCourseByQuery(query: string): Promise<
  ResolvedEntity<{
    id: string
    name: string
    courseLevel: 'bachelor' | 'master'
    isOpen: boolean
    semester: number | null
  }>
> {
  const tokens = uniq(splitSearchTokens(query))

  if (tokens.length === 0) {
    return {
      ok: false,
      reason: 'not_found',
      entity: 'course',
      query,
      matches: [],
    }
  }

  const courses = await prisma.course.findMany({
    where: {
      OR: tokens.map((token) => ({
        name: { contains: token },
      })),
    },
    take: 25,
    select: {
      id: true,
      name: true,
      courseLevel: true,
      isOpen: true,
      semester: true,
    },
  })

  const ranked = courses
    .map((course) => ({
      course,
      label: course.name,
      score: scoreTextAgainstQuery([course.name], query),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))

  if (ranked.length === 0) {
    return {
      ok: false,
      reason: 'not_found',
      entity: 'course',
      query,
      matches: [],
    }
  }

  const top = ranked[0]
  const closeMatches = ranked.filter((entry) => top.score - entry.score <= 15)

  if (closeMatches.length > 1) {
    return {
      ok: false,
      reason: 'ambiguous',
      entity: 'course',
      query,
      matches: closeMatches.slice(0, 5).map((entry) => ({
        id: entry.course.id,
        label: entry.label,
        score: entry.score,
      })),
    }
  }

  return {
    ok: true,
    value: top.course,
    matches: ranked.slice(0, 5).map((entry) => ({
      id: entry.course.id,
      label: entry.label,
      score: entry.score,
    })),
  }
}

function toResolutionError(
  result: Extract<ResolvedEntity<unknown>, { ok: false }>
) {
  return {
    error:
      result.reason === 'ambiguous'
        ? `Mehrdeutige ${result.entity === 'lecturer' ? 'Dozenten' : 'Vorlesungs'}-Suche.`
        : `${result.entity === 'lecturer' ? 'Dozent' : 'Vorlesung'} nicht gefunden.`,
    query: result.query,
    candidates: result.matches,
  }
}

function toValidationError(result: {
  error: { issues: Array<{ path: PropertyKey[]; message: string }> }
}) {
  return {
    error: 'Validierung fehlgeschlagen.',
    issues: result.error.issues.map((issue) => ({
      field: issue.path.map((part) => String(part)).join('.'),
      message: issue.message,
    })),
  }
}

export function getChatToolDefinitions(): ChatToolDefinition[] {
  return [
    {
      type: 'function',
      function: {
        name: 'find_lecturer',
        description:
          'Sucht einen Dozenten tolerant nach Name oder E-Mail. Funktioniert auch, wenn der zweite Vorname fehlt.',
        parameters: {
          type: 'object',
          properties: {
            lecturerName: {
              type: 'string',
              description: 'Name oder E-Mail des Dozenten.',
            },
          },
          required: ['lecturerName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'find_course',
        description:
          'Sucht eine Vorlesung tolerant nach Namen und liefert passende Kandidaten.',
        parameters: {
          type: 'object',
          properties: {
            courseName: {
              type: 'string',
              description: 'Name der Vorlesung.',
            },
          },
          required: ['courseName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_user_features',
        description:
          'Zeigt die im UI sichtbaren Features für den aktuellen Benutzer inkl. Admin-Einschränkungen.',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_courses',
        description:
          'Liest Vorlesungen mit optionaler Suche, Level-Filter und Open-Filter.',
        parameters: {
          type: 'object',
          properties: {
            search: {
              type: 'string',
              description: 'Freitextsuche auf Vorlesungsnamen.',
            },
            level: {
              type: 'string',
              enum: ['bachelor', 'master'],
              description: 'Kurslevel.',
            },
            onlyOpen: {
              type: 'boolean',
              description: 'Nur offene Vorlesungen.',
            },
            limit: {
              type: 'number',
              description: 'Maximale Anzahl der Ergebnisse (1-50).',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_lecturers',
        description:
          'Liest Dozenten mit optionaler Suche und Typ-Filter (intern/extern).',
        parameters: {
          type: 'object',
          properties: {
            search: {
              type: 'string',
              description: 'Freitextsuche über Name oder E-Mail.',
            },
            type: {
              type: 'string',
              enum: ['internal', 'external'],
              description: 'Dozententyp.',
            },
            limit: {
              type: 'number',
              description: 'Maximale Anzahl der Ergebnisse (1-50).',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_lecturer_details',
        description:
          'Lädt das Detailprofil eines Dozenten inkl. Qualifikationen und Einsätzen.',
        parameters: {
          type: 'object',
          properties: {
            lecturerId: {
              type: 'string',
              description: 'ID des Dozenten.',
            },
          },
          required: ['lecturerId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_report_snapshot',
        description:
          'Lädt eine kompakte Kennzahlen-Übersicht für Dozenten und Vorlesungen.',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_courses_taught_by_lecturer',
        description:
          'Liefert alle Vorlesungen, die ein bestimmter Dozent aktuell unterrichtet.',
        parameters: {
          type: 'object',
          properties: {
            lecturerName: {
              type: 'string',
              description: 'Name oder E-Mail des Dozenten.',
            },
          },
          required: ['lecturerName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'count_courses_taught_by_lecturer',
        description:
          'Zählt, wie viele Vorlesungen ein bestimmter Dozent aktuell unterrichtet.',
        parameters: {
          type: 'object',
          properties: {
            lecturerName: {
              type: 'string',
              description: 'Name oder E-Mail des Dozenten.',
            },
          },
          required: ['lecturerName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_lecturers_teaching_course',
        description:
          'Liefert alle Dozenten, die eine bestimmte Vorlesung aktuell unterrichten.',
        parameters: {
          type: 'object',
          properties: {
            courseName: {
              type: 'string',
              description: 'Name der Vorlesung.',
            },
          },
          required: ['courseName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'count_lecturers_teaching_course',
        description:
          'Zählt, wie viele Dozenten eine bestimmte Vorlesung aktuell unterrichten.',
        parameters: {
          type: 'object',
          properties: {
            courseName: {
              type: 'string',
              description: 'Name der Vorlesung.',
            },
          },
          required: ['courseName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_qualified_lecturers_for_course',
        description:
          'Liefert Dozenten, die eine Vorlesung laut Qualifikation unterrichten könnten, auch wenn sie ihr noch nicht zugewiesen sind.',
        parameters: {
          type: 'object',
          properties: {
            courseName: {
              type: 'string',
              description: 'Name der Vorlesung.',
            },
          },
          required: ['courseName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'assign_lecturer_to_course',
        description:
          'Weist einen Dozenten einer Vorlesung zu. Vorher Namen tolerant auflösen.',
        parameters: {
          type: 'object',
          properties: {
            lecturerName: {
              type: 'string',
              description: 'Name oder E-Mail des Dozenten.',
            },
            courseName: {
              type: 'string',
              description: 'Name der Vorlesung.',
            },
          },
          required: ['lecturerName', 'courseName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'remove_lecturer_from_course',
        description:
          'Entfernt die Zuordnung eines Dozenten zu einer Vorlesung.',
        parameters: {
          type: 'object',
          properties: {
            lecturerName: {
              type: 'string',
              description: 'Name oder E-Mail des Dozenten.',
            },
            courseName: {
              type: 'string',
              description: 'Name der Vorlesung.',
            },
          },
          required: ['lecturerName', 'courseName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'update_lecturer',
        description:
          'Bearbeitet Stammdaten eines Dozenten. Der Dozent wird tolerant per Namen aufgelöst.',
        parameters: {
          type: 'object',
          properties: {
            lecturerName: {
              type: 'string',
              description: 'Aktueller Name oder E-Mail des Dozenten.',
            },
            title: {
              type: ['string', 'null'],
              description: 'Titel des Dozenten oder null zum Leeren.',
            },
            firstName: { type: 'string', description: 'Vorname.' },
            secondName: {
              type: ['string', 'null'],
              description: 'Zweiter Vorname oder null zum Leeren.',
            },
            lastName: { type: 'string', description: 'Nachname.' },
            email: { type: 'string', description: 'E-Mail-Adresse.' },
            phone: { type: 'string', description: 'Telefonnummer.' },
            type: {
              type: 'string',
              enum: ['internal', 'external'],
              description: 'Dozententyp.',
            },
            courseLevelPreference: {
              type: 'string',
              enum: ['bachelor', 'master', 'both'],
              description: 'Präferenz für Vorlesungsstufen.',
            },
          },
          required: ['lecturerName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'update_course',
        description:
          'Bearbeitet Stammdaten einer Vorlesung. Die Vorlesung wird tolerant per Namen aufgelöst.',
        parameters: {
          type: 'object',
          properties: {
            courseName: {
              type: 'string',
              description: 'Aktueller Name der Vorlesung.',
            },
            newName: {
              type: 'string',
              description: 'Neuer Name der Vorlesung.',
            },
            isOpen: {
              type: 'boolean',
              description: 'Ob die Vorlesung offen ist.',
            },
            courseLevel: {
              type: 'string',
              enum: ['bachelor', 'master'],
              description: 'Vorlesungsstufe.',
            },
            semester: {
              type: ['number', 'null'],
              description: 'Semester oder null.',
            },
          },
          required: ['courseName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'update_qualification',
        description:
          'Bearbeitet die Qualifikation eines Dozenten für eine Vorlesung. Wenn noch keine Qualifikation existiert, wird sie angelegt.',
        parameters: {
          type: 'object',
          properties: {
            lecturerName: {
              type: 'string',
              description: 'Name oder E-Mail des Dozenten.',
            },
            courseName: { type: 'string', description: 'Name der Vorlesung.' },
            leadTime: {
              type: 'string',
              enum: ['short', 'four_weeks', 'more_weeks'],
              description: 'Vorlaufzeit.',
            },
            experience: {
              type: 'string',
              enum: ['none', 'other_uni', 'provadis'],
              description: 'Erfahrungsstufe.',
            },
          },
          required: ['lecturerName', 'courseName'],
        },
      },
    },
  ]
}

export async function executeChatTool(
  toolCall: ChatToolCall,
  userId: string
): Promise<unknown> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  const isAdmin = dbUser?.isAdmin ?? false

  switch (toolCall.name) {
    case 'find_lecturer': {
      const lecturerName = asString(toolCall.arguments.lecturerName)
      const resolved = await resolveLecturerByQuery(lecturerName)

      if (!resolved.ok) {
        return toResolutionError(resolved)
      }

      return {
        lecturer: {
          ...resolved.value,
          displayName: buildLecturerLabel(resolved.value),
        },
        matches: resolved.matches,
      }
    }

    case 'find_course': {
      const courseName = asString(toolCall.arguments.courseName)
      const resolved = await resolveCourseByQuery(courseName)

      if (!resolved.ok) {
        return toResolutionError(resolved)
      }

      return {
        course: resolved.value,
        matches: resolved.matches,
      }
    }

    case 'get_user_features': {
      return {
        isAdmin,
        features: getVisibleFeatures(isAdmin),
      }
    }

    case 'get_courses': {
      const search = asString(toolCall.arguments.search)
      const levelArg = toolCall.arguments.level
      const onlyOpen = asBoolean(toolCall.arguments.onlyOpen)
      const limit = normalizeLimit(toolCall.arguments.limit, 12)

      const courses = await prisma.course.findMany({
        where: {
          ...(search
            ? {
                name: {
                  contains: search,
                },
              }
            : {}),
          ...(isCourseLevel(levelArg)
            ? {
                courseLevel: levelArg,
              }
            : {}),
          ...(typeof onlyOpen === 'boolean'
            ? {
                isOpen: onlyOpen,
              }
            : {}),
        },
        orderBy: [{ name: 'asc' }],
        take: limit,
        select: {
          id: true,
          name: true,
          courseLevel: true,
          isOpen: true,
          semester: true,
          _count: {
            select: {
              assignments: true,
              qualifications: true,
            },
          },
        },
      })

      return {
        count: courses.length,
        courses,
      }
    }

    case 'get_lecturers': {
      const search = asString(toolCall.arguments.search)
      const lecturerType = toolCall.arguments.type
      const limit = normalizeLimit(toolCall.arguments.limit, 12)
      const tokens = uniq(splitSearchTokens(search))

      const lecturers = await prisma.lecturer.findMany({
        where: {
          ...(search
            ? {
                OR: (tokens.length > 0 ? tokens : [search]).flatMap((token) => [
                  {
                    firstName: {
                      contains: token,
                    },
                  },
                  {
                    secondName: {
                      contains: token,
                    },
                  },
                  {
                    lastName: {
                      contains: token,
                    },
                  },
                  {
                    email: {
                      contains: token,
                    },
                  },
                ]),
              }
            : {}),
          ...(isLecturerType(lecturerType)
            ? {
                type: lecturerType,
              }
            : {}),
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        take: limit,
        select: {
          id: true,
          title: true,
          firstName: true,
          secondName: true,
          lastName: true,
          email: true,
          phone: true,
          type: true,
          courseLevelPreference: true,
          _count: {
            select: {
              assignments: true,
              qualifications: true,
            },
          },
        },
      })

      return {
        count: lecturers.length,
        lecturers,
      }
    }

    case 'get_courses_taught_by_lecturer': {
      const lecturerName = asString(toolCall.arguments.lecturerName)
      const resolved = await resolveLecturerByQuery(lecturerName)

      if (!resolved.ok) {
        return toResolutionError(resolved)
      }

      const assignments = await prisma.courseAssignment.findMany({
        where: { lecturerId: resolved.value.id },
        orderBy: {
          course: {
            name: 'asc',
          },
        },
        select: {
          course: {
            select: {
              id: true,
              name: true,
              courseLevel: true,
              isOpen: true,
              semester: true,
            },
          },
        },
      })

      return {
        lecturer: {
          id: resolved.value.id,
          displayName: buildLecturerLabel(resolved.value),
          email: resolved.value.email,
        },
        count: assignments.length,
        courses: assignments.map((assignment) => assignment.course),
      }
    }

    case 'count_courses_taught_by_lecturer': {
      const lecturerName = asString(toolCall.arguments.lecturerName)
      const resolved = await resolveLecturerByQuery(lecturerName)

      if (!resolved.ok) {
        return toResolutionError(resolved)
      }

      const count = await prisma.courseAssignment.count({
        where: { lecturerId: resolved.value.id },
      })

      return {
        lecturer: {
          id: resolved.value.id,
          displayName: buildLecturerLabel(resolved.value),
        },
        count,
      }
    }

    case 'get_lecturers_teaching_course': {
      const courseName = asString(toolCall.arguments.courseName)
      const resolved = await resolveCourseByQuery(courseName)

      if (!resolved.ok) {
        return toResolutionError(resolved)
      }

      const assignments = await prisma.courseAssignment.findMany({
        where: { courseId: resolved.value.id },
        orderBy: {
          lecturer: {
            lastName: 'asc',
          },
        },
        select: {
          lecturer: {
            select: {
              id: true,
              title: true,
              firstName: true,
              secondName: true,
              lastName: true,
              email: true,
              type: true,
              courseLevelPreference: true,
            },
          },
        },
      })

      return {
        course: resolved.value,
        count: assignments.length,
        lecturers: assignments.map(({ lecturer }) => ({
          ...lecturer,
          displayName: buildLecturerLabel(lecturer),
        })),
      }
    }

    case 'count_lecturers_teaching_course': {
      const courseName = asString(toolCall.arguments.courseName)
      const resolved = await resolveCourseByQuery(courseName)

      if (!resolved.ok) {
        return toResolutionError(resolved)
      }

      const count = await prisma.courseAssignment.count({
        where: { courseId: resolved.value.id },
      })

      return {
        course: resolved.value,
        count,
      }
    }

    case 'get_qualified_lecturers_for_course': {
      const courseName = asString(toolCall.arguments.courseName)
      const resolved = await resolveCourseByQuery(courseName)

      if (!resolved.ok) {
        return toResolutionError(resolved)
      }

      const qualifications = await prisma.courseQualification.findMany({
        where: { courseId: resolved.value.id },
        orderBy: {
          lecturer: {
            lastName: 'asc',
          },
        },
        select: {
          leadTime: true,
          experience: true,
          lecturer: {
            select: {
              id: true,
              title: true,
              firstName: true,
              secondName: true,
              lastName: true,
              email: true,
              type: true,
              courseLevelPreference: true,
              _count: {
                select: {
                  assignments: true,
                },
              },
            },
          },
        },
      })

      return {
        course: resolved.value,
        count: qualifications.length,
        lecturers: qualifications.map(({ lecturer, leadTime, experience }) => ({
          ...lecturer,
          displayName: buildLecturerLabel(lecturer),
          leadTime,
          experience,
        })),
      }
    }

    case 'assign_lecturer_to_course': {
      const lecturerName = asString(toolCall.arguments.lecturerName)
      const courseName = asString(toolCall.arguments.courseName)
      const [resolvedLecturer, resolvedCourse] = await Promise.all([
        resolveLecturerByQuery(lecturerName),
        resolveCourseByQuery(courseName),
      ])

      if (!resolvedLecturer.ok) {
        return toResolutionError(resolvedLecturer)
      }

      if (!resolvedCourse.ok) {
        return toResolutionError(resolvedCourse)
      }

      const existingAssignment = await prisma.courseAssignment.findUnique({
        where: {
          lecturerId_courseId: {
            lecturerId: resolvedLecturer.value.id,
            courseId: resolvedCourse.value.id,
          },
        },
      })

      if (existingAssignment) {
        return {
          success: true,
          alreadyAssigned: true,
          lecturer: {
            id: resolvedLecturer.value.id,
            displayName: buildLecturerLabel(resolvedLecturer.value),
          },
          course: resolvedCourse.value,
        }
      }

      await prisma.courseAssignment.create({
        data: {
          lecturerId: resolvedLecturer.value.id,
          courseId: resolvedCourse.value.id,
        },
      })

      revalidateTag('lecturers', { expire: 0 })
      revalidateTag('courses', { expire: 0 })
      revalidateTag(`lecturer-${resolvedLecturer.value.id}-courses`, {
        expire: 0,
      })
      revalidateTag(`course-${resolvedCourse.value.id}-lecturers`, {
        expire: 0,
      })

      return {
        success: true,
        lecturer: {
          id: resolvedLecturer.value.id,
          displayName: buildLecturerLabel(resolvedLecturer.value),
        },
        course: resolvedCourse.value,
      }
    }

    case 'remove_lecturer_from_course': {
      const lecturerName = asString(toolCall.arguments.lecturerName)
      const courseName = asString(toolCall.arguments.courseName)
      const [resolvedLecturer, resolvedCourse] = await Promise.all([
        resolveLecturerByQuery(lecturerName),
        resolveCourseByQuery(courseName),
      ])

      if (!resolvedLecturer.ok) return toResolutionError(resolvedLecturer)
      if (!resolvedCourse.ok) return toResolutionError(resolvedCourse)

      const existingAssignment = await prisma.courseAssignment.findUnique({
        where: {
          lecturerId_courseId: {
            lecturerId: resolvedLecturer.value.id,
            courseId: resolvedCourse.value.id,
          },
        },
      })

      if (!existingAssignment) {
        return {
          success: true,
          alreadyRemoved: true,
          lecturer: {
            id: resolvedLecturer.value.id,
            displayName: buildLecturerLabel(resolvedLecturer.value),
          },
          course: resolvedCourse.value,
        }
      }

      await prisma.courseAssignment.delete({
        where: {
          lecturerId_courseId: {
            lecturerId: resolvedLecturer.value.id,
            courseId: resolvedCourse.value.id,
          },
        },
      })

      revalidateTag('lecturers', { expire: 0 })
      revalidateTag('courses', { expire: 0 })
      revalidateTag(`lecturer-${resolvedLecturer.value.id}-courses`, {
        expire: 0,
      })
      revalidateTag(`course-${resolvedCourse.value.id}-lecturers`, {
        expire: 0,
      })

      return {
        success: true,
        lecturer: {
          id: resolvedLecturer.value.id,
          displayName: buildLecturerLabel(resolvedLecturer.value),
        },
        course: resolvedCourse.value,
      }
    }

    case 'update_lecturer': {
      const lecturerName = asString(toolCall.arguments.lecturerName)
      const resolved = await resolveLecturerByQuery(lecturerName)
      if (!resolved.ok) return toResolutionError(resolved)

      const mergedData = {
        title:
          asNullableString(toolCall.arguments.title) ?? resolved.value.title,
        firstName:
          asString(toolCall.arguments.firstName) || resolved.value.firstName,
        secondName:
          asNullableString(toolCall.arguments.secondName) ??
          resolved.value.secondName,
        lastName:
          asString(toolCall.arguments.lastName) || resolved.value.lastName,
        email: asString(toolCall.arguments.email) || resolved.value.email,
        phone: asString(toolCall.arguments.phone) || resolved.value.phone,
        type: isLecturerType(toolCall.arguments.type)
          ? toolCall.arguments.type
          : resolved.value.type,
        courseLevelPreference: isCourseLevelPreference(
          toolCall.arguments.courseLevelPreference
        )
          ? toolCall.arguments.courseLevelPreference
          : resolved.value.courseLevelPreference,
      }

      const parsed = lecturerSchema.safeParse(mergedData)
      if (!parsed.success) return toValidationError(parsed)

      await prisma.lecturer.update({
        where: { id: resolved.value.id },
        data: parsed.data,
      })

      revalidateTag('lecturers', { expire: 0 })
      revalidateTag(`lecturer-${resolved.value.id}-courses`, { expire: 0 })

      return {
        success: true,
        lecturerId: resolved.value.id,
        lecturer: parsed.data,
      }
    }

    case 'update_course': {
      const courseName = asString(toolCall.arguments.courseName)
      const resolved = await resolveCourseByQuery(courseName)
      if (!resolved.ok) return toResolutionError(resolved)

      const mergedData = {
        name: asString(toolCall.arguments.newName) || resolved.value.name,
        isOpen:
          asOptionalBoolean(toolCall.arguments.isOpen) ?? resolved.value.isOpen,
        courseLevel: isCourseLevel(toolCall.arguments.courseLevel)
          ? toolCall.arguments.courseLevel
          : resolved.value.courseLevel,
        semester:
          asNullableInt(toolCall.arguments.semester) ?? resolved.value.semester,
      }

      const parsed = courseSchema.safeParse(mergedData)
      if (!parsed.success) return toValidationError(parsed)

      await prisma.course.update({
        where: { id: resolved.value.id },
        data: parsed.data,
      })

      revalidateTag('courses', { expire: 0 })
      revalidateTag(`course-${resolved.value.id}-lecturers`, { expire: 0 })

      return {
        success: true,
        courseId: resolved.value.id,
        course: parsed.data,
      }
    }

    case 'update_qualification': {
      const lecturerName = asString(toolCall.arguments.lecturerName)
      const courseName = asString(toolCall.arguments.courseName)
      const [resolvedLecturer, resolvedCourse] = await Promise.all([
        resolveLecturerByQuery(lecturerName),
        resolveCourseByQuery(courseName),
      ])

      if (!resolvedLecturer.ok) return toResolutionError(resolvedLecturer)
      if (!resolvedCourse.ok) return toResolutionError(resolvedCourse)

      const existingQualification = await prisma.courseQualification.findUnique(
        {
          where: {
            lecturerId_courseId: {
              lecturerId: resolvedLecturer.value.id,
              courseId: resolvedCourse.value.id,
            },
          },
        }
      )

      const mergedData = {
        leadTime: isLeadTimeOption(toolCall.arguments.leadTime)
          ? toolCall.arguments.leadTime
          : (existingQualification?.leadTime ?? 'short'),
        experience: isExperienceOption(toolCall.arguments.experience)
          ? toolCall.arguments.experience
          : (existingQualification?.experience ?? 'none'),
      }

      const parsed = qualificationSchema.safeParse(mergedData)
      if (!parsed.success) return toValidationError(parsed)

      await prisma.courseQualification.upsert({
        where: {
          lecturerId_courseId: {
            lecturerId: resolvedLecturer.value.id,
            courseId: resolvedCourse.value.id,
          },
        },
        update: parsed.data,
        create: {
          lecturerId: resolvedLecturer.value.id,
          courseId: resolvedCourse.value.id,
          ...parsed.data,
        },
      })

      revalidateTag('lecturers', { expire: 0 })
      revalidateTag('courses', { expire: 0 })
      revalidateTag(`lecturer-${resolvedLecturer.value.id}-courses`, {
        expire: 0,
      })
      revalidateTag(`course-${resolvedCourse.value.id}-lecturers`, {
        expire: 0,
      })

      return {
        success: true,
        created: !existingQualification,
        lecturer: {
          id: resolvedLecturer.value.id,
          displayName: buildLecturerLabel(resolvedLecturer.value),
        },
        course: resolvedCourse.value,
        qualification: parsed.data,
      }
    }

    case 'get_lecturer_details': {
      const lecturerId = asString(toolCall.arguments.lecturerId)

      if (!lecturerId) {
        return { error: 'lecturerId ist erforderlich.' }
      }

      const lecturer = await prisma.lecturer.findUnique({
        where: { id: lecturerId },
        select: {
          id: true,
          title: true,
          firstName: true,
          secondName: true,
          lastName: true,
          email: true,
          phone: true,
          type: true,
          courseLevelPreference: true,
          assignments: {
            select: {
              course: {
                select: {
                  id: true,
                  name: true,
                  courseLevel: true,
                  isOpen: true,
                  semester: true,
                },
              },
            },
            orderBy: {
              course: {
                name: 'asc',
              },
            },
          },
          qualifications: {
            select: {
              leadTime: true,
              experience: true,
              course: {
                select: {
                  id: true,
                  name: true,
                  courseLevel: true,
                  isOpen: true,
                  semester: true,
                },
              },
            },
            orderBy: {
              course: {
                name: 'asc',
              },
            },
          },
        },
      })

      if (!lecturer) {
        return { error: 'Dozent nicht gefunden.' }
      }

      return lecturer
    }

    case 'get_report_snapshot': {
      const [
        lecturersTotal,
        lecturersInternal,
        lecturersExternal,
        coursesTotal,
        coursesOpen,
        coursesWithoutLecturers,
      ] = await Promise.all([
        prisma.lecturer.count(),
        prisma.lecturer.count({
          where: { type: 'internal' },
        }),
        prisma.lecturer.count({
          where: { type: 'external' },
        }),
        prisma.course.count(),
        prisma.course.count({
          where: { isOpen: true },
        }),
        prisma.course.count({
          where: {
            assignments: {
              none: {},
            },
          },
        }),
      ])

      return {
        lecturers: {
          total: lecturersTotal,
          internal: lecturersInternal,
          external: lecturersExternal,
        },
        courses: {
          total: coursesTotal,
          open: coursesOpen,
          withoutLecturer: coursesWithoutLecturers,
        },
      }
    }

    default:
      return { error: `Unbekanntes Tool: ${toolCall.name}` }
  }
}
