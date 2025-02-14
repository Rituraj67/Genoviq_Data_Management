import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@tremor/react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import html2canvas from "html2canvas"

const ChartPopup = ({ isOpen, onClose, data, selectedYear, phase }) => {
  const handleDownload = async () => {
    const chartElement = document.getElementById("chart-container")
    if (!chartElement) return

    const canvas = await html2canvas(chartElement, { backgroundColor: "#fff" })
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `${phase === "overall" ? "Overall_Analysis" : `Analysis_${selectedYear}_${selectedYear + 1}`}.png`
    link.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {phase === "overall" ? "Overall Analysis" : `Analysis for ${selectedYear} - ${selectedYear + 1}`}
          </DialogTitle>
          <DialogDescription>
            This chart shows Revenue, Expenditures, and Profits over time.
          </DialogDescription>
        </DialogHeader>
        <Card className="mt-4 relative">
          <div id="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_sale" stroke="#1500ff" strokeWidth={2} />
                <Line type="monotone" dataKey="totalExpenditure" stroke="#ff0015" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke={`#00cc00`} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <button
          onClick={handleDownload}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download Chart
        </button>
      </DialogContent>
    </Dialog>
  )
}

export default ChartPopup
