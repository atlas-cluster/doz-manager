'use client'

import { BracesIcon, DownloadIcon, FileTextIcon, SheetIcon } from 'lucide-react'

import { Button } from '@/features/shared/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'

export function ReportCard() {
  const courses = ['Mathe', 'Programmieren']

  const exportAsPDF = () => {
    console.log('Report wird als PDF exportiert')
  }
  const exportAsJSON = () => {
    console.log('Report wird als JSON exportiert')
  }
  const exportAsCSV = () => {
    console.log('Report wird als CSV exportiert')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vorlesungen ohne Dozenten</CardTitle>
        <CardDescription>
          Hier sehen Sie alle Vorlesungen ohne Dozenten
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={'outline'} size={'icon'}>
                <DownloadIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Export als...</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => exportAsPDF()}>
                  <FileTextIcon />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => exportAsJSON()}>
                  <BracesIcon />
                  JSON
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => exportAsCSV()}>
                  <SheetIcon />
                  CSV
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vorlesungen</TableHead>
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
    </Card>
  )
}
