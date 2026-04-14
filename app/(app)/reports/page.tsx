import {
  ReportCardCoursesAtOtherUni,
  ReportCardCoursesAtProvadis,
  ReportCardCoursesWithoutLecturers,
  ReportCardCoursesWithoutProvadisExperience,
  ReportsLiveRefresh,
  getCardData,
} from '@/features/reports'

export default async function ReportsPage() {
  const reports = await getCardData()
  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col gap-6">
      <ReportsLiveRefresh />
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <ReportCardCoursesWithoutLecturers
          courses={reports.coursesWithoutLecturer}
        />
        <ReportCardCoursesWithoutProvadisExperience
          courses={reports.coursesWithoutProvadisExperience}
        />
        <ReportCardCoursesAtProvadis
          qualifications={reports.coursesAtProvadis}
        />
        <ReportCardCoursesAtOtherUni
          qualifications={reports.coursesAtOtherUni}
        />
      </div>
    </div>
  )
}
