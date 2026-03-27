'use client'

import autoTable from 'jspdf-autotable'

import { ReportCardExportDropdown } from '@/features/reports/components/report-card-export-dropdown'
import { GetCoursesAtProvadisResponse } from '@/features/reports/types'
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
import { ScrollArea } from '@/features/shared/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'

export function ReportCardCoursesAtProvadis({
  qualifications,
}: {
  qualifications: GetCoursesAtProvadisResponse
}) {
  const lecturerCount = Object.keys(qualifications).length
  const courseCount = new Set(Object.values(qualifications).flat()).size

  const handleExportAsPDF = async () => {
    const { doc, contentStartY } = await generatePDF(
      'Vorlesungen an der Provadis',
      'Alle Dozenten mit ihren an der Provadis gehaltenen Vorlesungen'
    )

    autoTable(doc, {
      startY: contentStartY,
      head: [['Dozent', 'Vorlesungen']],
      body: Object.entries(qualifications).map(([lecturer, courses]) => [
        lecturer,
        courses.join(', '),
      ]),
      columnStyles: {
        0: { minCellWidth: 40 },
      },
    })

    doc.save('vorlesungen-an-der-provadis.pdf')
  }
  const handleExportAsJSON = () => {
    downloadJSON(qualifications, 'vorlesungen-an-der-provadis')
  }
  const handleExportAsCSV = () => {
    downloadCSV(
      ['Dozent', 'Vorlesungen'],
      Object.entries(qualifications).map(([lecturer, courses]) => [
        lecturer,
        courses.join(', '),
      ]),
      'vorlesungen-an-der-provadis'
    )
  }

  return (
    <Card className="flex min-h-0 flex-col">
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
      <CardContent className="min-h-0 flex-1">
        <ScrollArea className="h-full **:data-[slot=scroll-area-viewport]:max-h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Dozent</TableHead>
                <TableHead>Vorlesungen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lecturerCount === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-muted-foreground h-24 text-center">
                    Keine Daten vorhanden.
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(qualifications).map(([lecturer, courses]) => (
                  <TableRow key={lecturer}>
                    <TableCell className="font-medium">{lecturer}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {courses.map((course) => (
                          <Badge key={course} variant="default">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-muted-foreground text-xs">
        {lecturerCount} Dozenten &middot; {courseCount} Vorlesungen
      </CardFooter>
    </Card>
  )
}
