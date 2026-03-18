'use client'

import autoTable from 'jspdf-autotable'

import { ReportCardExportDropdown } from '@/features/reports/components/report-card-export-dropdown'
import { GetCoursesWithoutProvadisExperienceResponse } from '@/features/reports/types'
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

export function ReportCardCoursesWithoutProvadisExperience({
  courses,
}: {
  courses: GetCoursesWithoutProvadisExperienceResponse
}) {
  const handleExportAsPDF = async () => {
    const { doc, contentStartY } = await generatePDF(
      'Vorlesungen ohne Provadis-Erfahrung',
      'Alle Vorlesungen, für die kein Dozent mit Provadis-Erfahrung verfügbar ist'
    )

    autoTable(doc, {
      startY: contentStartY,
      head: [['Vorlesung']],
      body: courses.map((c) => [c]),
    })

    doc.save('vorlesungen-ohne-provadis-erfahrung.pdf')
  }
  const handleExportAsJSON = () => {
    downloadJSON(
      { vorlesungenOhneProvadisErfahrung: courses },
      'vorlesungen-ohne-provadis-erfahrung'
    )
  }
  const handleExportAsCSV = () => {
    downloadCSV(
      ['Vorlesung'],
      courses.map((c) => [c]),
      'vorlesungen-ohne-provadis-erfahrung'
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Vorlesungen ohne Provadis-Erfahrung
          <Badge variant="outline">{courses.length}</Badge>
        </CardTitle>
        <CardDescription>
          Alle Vorlesungen, für die kein Dozent mit Provadis-Erfahrung verfügbar
          ist
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
        {courses.length} Vorlesungen ohne Erfahrung
      </CardFooter>
    </Card>
  )
}
