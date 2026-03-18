import {
  ReportCardCoursesAtProvadis,
  ReportCardCoursesWithoutLecturers,
  ReportCardCoursesWithoutProvadisExperience,
  getCardData,
} from '@/features/reports'

export default async function ReportsPage() {
  const reports = await getCardData()
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ReportCardCoursesAtProvadis qualifications={reports.coursesAtProvadis} />
      <ReportCardCoursesWithoutLecturers
        courses={reports.coursesWithoutLecturer}
      />
      <ReportCardCoursesWithoutProvadisExperience
        courses={reports.coursesWithoutProvadisExperience}
      />
    </div>
  )
}
