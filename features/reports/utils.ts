import jsPDF from 'jspdf'

/**
 * Triggers a browser file download with the given content.
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Downloads data as a JSON file.
 * @param data - Any JSON-serializable data
 * @param filename - Filename without extension
 */
export function downloadJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `${filename}.json`, 'application/json')
}

/**
 * Downloads tabular data as a CSV file.
 * @param headers - Column headers
 * @param rows - Array of row arrays (each row is string[])
 * @param filename - Filename without extension
 */
export function downloadCSV(
  headers: string[],
  rows: string[][],
  filename: string
) {
  const escapeCsvValue = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const lines = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ]

  // BOM for Excel UTF-8 compatibility
  const csv = '\uFEFF' + lines.join('\n')
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8')
}

export async function generatePDF(title: string, description: string) {
  const response = await fetch('/provadis-hochschule.svg')
  const svgText = await response.text()
  const logoDataUrl = await svgToDataUrl(svgText)

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Logo oben rechts (Breite 50, Höhe proportional zum SVG-Seitenverhältnis 1024:392)
  const logoWidth = 50
  const logoHeight = logoWidth * (392 / 1024)
  const logoX = pageWidth - logoWidth - 14
  const logoY = 10

  doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight)

  // Titel
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, logoY + 10)

  // Beschreibung
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(description, 14, logoY + 18)
  doc.setTextColor(0)

  const contentStartY = logoY + logoHeight + 16

  return { doc, contentStartY }
}

function svgToDataUrl(svgText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = url
  })
}
