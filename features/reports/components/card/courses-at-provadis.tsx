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

export function ReportCardCoursesAtProvadis() {
  const qualifications: Record<string, string[]> = {
    Volk: ['GDI', 'Theo'],
    Frenz: ['Datenbanken'],
    Hutter: ['Mathe1', 'Mathe2'],
  }

  const lecturerCount = Object.keys(qualifications).length
  const courseCount = Object.values(qualifications).flat().length

  const handleExportAsPDF = () => {
    console.log('Report wird als PDF exportiert')
  }
  const handleExportAsJSON = () => {
    downloadJSON(
      { vorlesungenAnDerProvadis: qualifications },
      'vorlesungen-an-der-provadis'
    )
  }
  const handleExportAsCSV = () => {
    downloadCSV(
      ['Dozent', 'Vorlesungen'],
      Object.entries(qualifications).map(([lecturer, courses]) => [
        lecturer,
        courses.join('; '),
      ]),
      'vorlesungen-an-der-provadis'
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Vorlesungen an der Provadis</CardTitle>
        <CardDescription>
          Alle Dozenten mit ihren an der Provadis gehaltenen Vorlesungen
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
              <TableHead>Dozent</TableHead>
              <TableHead>Vorlesungen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(qualifications).map(([lecturer, courses]) => (
              <TableRow key={lecturer}>
                <TableCell className="font-medium">{lecturer}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {courses.map((course) => (
                      <Badge key={course} variant="secondary">
                        {course}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="text-muted-foreground text-xs">
        {lecturerCount} Dozenten &middot; {courseCount} Vorlesungen
      </CardFooter>
    </Card>
  )
}
