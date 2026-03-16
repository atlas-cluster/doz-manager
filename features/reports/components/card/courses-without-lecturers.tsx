'use client'

import { ReportCardExportDropdown } from '@/features/reports/components/report-card-export-dropdown'
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

export function ReportCardCoursesWithoutLecturers() {
  const courses = ['Mathe', 'Programmieren']

  const handleExportAsPDF = () => {
    console.log('Report wird als PDF exportiert')
  }
  const handleExportAsJSON = () => {
    console.log('Report wird als JSON exportiert')
  }
  const handleExportAsCSV = () => {
    console.log('Report wird als CSV exportiert')
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
                <TableCell className="font-medium">{course}</TableCell>
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
