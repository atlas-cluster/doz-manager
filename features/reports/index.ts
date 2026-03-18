import { getCardData } from './actions/get-card-data'
import { ReportCardCoursesAtOtherUni } from './components/card/courses-at-other-uni'
import { ReportCardCoursesAtProvadis } from './components/card/courses-at-provadis'
import { ReportCardCoursesWithoutLecturers } from './components/card/courses-without-lecturers'
import { ReportCardCoursesWithoutProvadisExperience } from './components/card/courses-without-provadis-experience'

export {
  ReportCardCoursesWithoutLecturers,
  ReportCardCoursesAtProvadis,
  ReportCardCoursesAtOtherUni,
  ReportCardCoursesWithoutProvadisExperience,
  getCardData,
}
