export interface CardData {
  coursesAtProvadis: GetCoursesAtProvadisResponse
  coursesAtOtherUni: GetCoursesAtOtherUniResponse
  coursesWithoutProvadisExperience: GetCoursesWithoutProvadisExperienceResponse
  coursesWithoutLecturer: GetCoursesWithoutLecturerResponse
}

export interface GetCoursesAtProvadisResponse {
  [lecturer: string]: string[]
}

export interface GetCoursesAtOtherUniResponse {
  [lecturer: string]: string[]
}

export type GetCoursesWithoutProvadisExperienceResponse = string[]
export type GetCoursesWithoutLecturerResponse = string[]
