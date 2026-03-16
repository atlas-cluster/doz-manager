import {
  ReportCardCoursesAtProvadis,
  ReportCardCoursesWithoutLecturers,
  ReportCardCoursesWithoutProvadisExperience,
} from '@/features/reports'

export default function ReportsPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ReportCardCoursesAtProvadis />
      <ReportCardCoursesWithoutLecturers />
      <ReportCardCoursesWithoutProvadisExperience />
    </div>
  )
}
