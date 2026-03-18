'use client'

import autoTable from 'jspdf-autotable'

import { ReportCardExportDropdown } from '@/features/reports/components/report-card-export-dropdown'
import { GetCoursesWithoutLecturerResponse } from '@/features/reports/types'
import {
  downloadCSV,
  downloadJSON,
  generatePDF,
} from '@/features/reports/utils'
import { Badge } from '@/features/shared/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'

export function ReportCardCoursesWithoutLecturers({
  courses,
}: {
  courses: GetCoursesWithoutLecturerResponse
}) {
  const handleExportAsPDF = async () => {
    const { doc, contentStartY } = await generatePDF(
      'Vorlesungen ohne Dozenten',
      'Alle Vorlesungen, denen noch kein Dozent zugewiesen ist'
    )

    autoTable(doc, {
      startY: contentStartY,
      head: [['Vorlesung']],
      body: courses.map((c) => [c]),
    })

    doc.save('vorlesungen-ohne-dozenten.pdf')
  }
  const handleExportAsJSON = () => {
    downloadJSON(
      { vorlesungenOhneDozenten: courses },
      'vorlesungen-ohne-dozenten'
    )
  }
  const handleExportAsCSV = () => {
    downloadCSV(
      ['Vorlesung'],
      courses.map((c) => [c]),
      'vorlesungen-ohne-dozenten'
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Vorlesungen ohne Dozenten
          <Badge variant="destructive">{courses.length}</Badge>
        </CardTitle>
        <CardDescription>
          Alle Vorlesungen, denen noch kein Dozent zugewiesen ist
        </CardDescription>
        <CardAction>
          <ReportCardExportDropdown
            onExportPDF={handleExportAsPDF}
            onExportJSON={handleExportAsJSON}
            onExportCSV={handleExportAsCSV}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vorlesung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course}>
                <TableCell>{course}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="text-muted-foreground text-xs">
        {courses.length} Vorlesungen ohne Zuordnung
      </CardFooter>
    </Card>
  )
}
