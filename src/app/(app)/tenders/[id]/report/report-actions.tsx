"use client"

import { Button } from "@/components/ui/button"
import { FileDown, Printer } from "lucide-react"

export function ReportActions() {
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // In a full implementation this might generate a PDF on the server.
    // For MVP, we can just trigger the browser's print dialog which allows "Save as PDF".
    window.print();
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" className="print:hidden" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print Report
      </Button>
      <Button className="print:hidden" onClick={handleExport}>
        <FileDown className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
    </div>
  )
}
