'use client'

import { ReportCardExportDropdown } from '@/features/reports/components/report-card-export-dropdown'
import { downloadCSV, downloadJSON } from '@/features/reports/utils'
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

export function ReportCardCoursesWithoutProvadisExperience() {
  const courses = ['Mathe', 'Programmieren']

  const handleExportAsPDF = () => {
    console.log('Report wird als PDF exportiert')
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
                <TableCell className="font-medium">{course}</TableCell>
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
