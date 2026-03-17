export interface CardData {
  coursesAtProvadis: GetCoursesAtProvadisResponse
}

export interface GetCoursesAtProvadisResponse {
  [lecturer: string]: string[]
}
