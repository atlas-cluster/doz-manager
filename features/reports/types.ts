export interface CardData {
  coursesAtProvadis: GetCoursesAtProvadisResponse
  coursesWithoutProvadisExperience: GetCoursesWithoutProvadisExperienceResponse
  coursesWithoutLecturer: GetCoursesWithoutLecturerResponse
}

export interface GetCoursesAtProvadisResponse {
  [lecturer: string]: string[]
}

export type GetCoursesWithoutProvadisExperienceResponse = string[]
export type GetCoursesWithoutLecturerResponse = string[]
