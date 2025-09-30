import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { BarChart3, Download, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/format'
import { billingService } from '../services/api'
import toast from 'react-hot-toast'

interface BillingSummary {
  currentMonth: {
    totalAmount: number
    totalOrders: number
    uniqueUsers: number
    averageOrderValue: number
  }
  previousMonth: {
    totalAmount: number
    totalOrders: number
  }
  growth: {
    amount: number
    percentage: number
  }
  period: {
    current: {
      year: number
      month: number
      monthName: string
    }
    previous: {
      year: number
      month: number
      monthName: string
    }
  }
}

export default function ReportsPage() {
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchBillingSummary()
  }, [])

  const fetchBillingSummary = async () => {
    try {
      const data = await billingService.getBillingSummary()
      setBillingSummary(data)
    } catch (error) {
      toast.error('Failed to load billing summary')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportReport = async (type: 'weekly' | 'monthly', format: 'pdf' | 'excel') => {
    setExportLoading(true)
    try {
      let blob
      if (type === 'weekly') {
        const startDate = new Date().toISOString().split('T')[0]
        blob = await billingService.exportWeeklyReport(startDate, undefined, format)
      } else {
        const now = new Date()
        blob = await billingService.exportMonthlyReport(now.getFullYear(), now.getMonth() + 1, format)
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Report exported successfully')
    } catch (error) {
      toast.error('Failed to export report')
    } finally {
      setExportLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!billingSummary) {
    return <div>Failed to load billing data</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">View billing summaries and export reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(billingSummary.currentMonth.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {billingSummary.period.current.monthName} {billingSummary.period.current.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingSummary.currentMonth.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(billingSummary.currentMonth.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billingSummary.growth.percentage > 0 ? '+' : ''}
              {billingSummary.growth.percentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs {billingSummary.period.previous.monthName}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Weekly Report</CardTitle>
            <CardDescription>Generate and download weekly billing reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="date"
                label="Start Date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleExportReport('weekly', 'pdf')}
                disabled={exportLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => handleExportReport('weekly', 'excel')}
                disabled={exportLoading}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Monthly Report</CardTitle>
            <CardDescription>Generate and download monthly billing reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Current month: {billingSummary.period.current.monthName} {billingSummary.period.current.year}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleExportReport('monthly', 'pdf')}
                disabled={exportLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => handleExportReport('monthly', 'excel')}
                disabled={exportLoading}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Month-over-Month Comparison</CardTitle>
          <CardDescription>Compare current month with previous month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {billingSummary.period.current.monthName} {billingSummary.period.current.year}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(billingSummary.currentMonth.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders:</span>
                  <span className="font-medium">{billingSummary.currentMonth.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unique Users:</span>
                  <span className="font-medium">{billingSummary.currentMonth.uniqueUsers}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {billingSummary.period.previous.monthName} {billingSummary.period.previous.year}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(billingSummary.previousMonth.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders:</span>
                  <span className="font-medium">{billingSummary.previousMonth.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth:</span>
                  <span className={`font-medium ${
                    billingSummary.growth.percentage > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {billingSummary.growth.percentage > 0 ? '+' : ''}
                    {billingSummary.growth.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
