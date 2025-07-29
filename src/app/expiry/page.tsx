'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import ExpiryList from '@/components/ExpiryList'
import { toast } from 'sonner'

interface Medicine {
  id: string
  name: string
  stock: number
  price: number
  batch: string
  supplier: string
  expiryDate: string
  schedule: string | null
  daysUntilExpiry: number
  isLowStock: boolean
  isExpiringSoon: boolean
  isExpired: boolean
}

export default function ExpiryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [expiryDays, setExpiryDays] = useState('30')
  const [stats, setStats] = useState({
    expiring15Days: 0,
    expiring30Days: 0,
    expired: 0,
    totalValue: 0
  })

  useEffect(() => {
    fetchExpiringMedicines()
  }, [expiryDays])

  const fetchExpiringMedicines = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/medicines?expiring=true&days=${expiryDays}`)
      if (!response.ok) throw new Error('Failed to fetch expiring medicines')
      
      const data = await response.json()
      setMedicines(data.medicines)
      
      // Calculate stats
      const currentDate = new Date()
      const expiring15Days = data.medicines.filter((m: Medicine) => {
        const expiryDate = new Date(m.expiryDate)
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 15 && daysUntilExpiry > 0
      }).length

      const expiring30Days = data.medicines.filter((m: Medicine) => {
        const expiryDate = new Date(m.expiryDate)
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
      }).length

      const expired = data.medicines.filter((m: Medicine) => m.isExpired).length

      const totalValue = data.medicines.reduce((sum: number, m: Medicine) => sum + (m.stock * m.price), 0)

      setStats({
        expiring15Days,
        expiring30Days,
        expired,
        totalValue
      })

    } catch (error) {
      toast.error('Failed to load expiry data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchExpiringMedicines()
    toast.success('Expiry data refreshed')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Expiry Management</h1>
          <p className="text-muted-foreground">Loading expiry data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Expiry Management</h1>
        <p className="text-muted-foreground">
          Monitor medicines nearing expiry dates and manage inventory accordingly
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring in 15 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiring15Days}</div>
            <p className="text-xs text-muted-foreground">Immediate attention required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring in 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiring30Days}</div>
            <p className="text-xs text-muted-foreground">Plan for clearance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Already Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Remove from inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value at Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Stock value expiring</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Show medicines expiring within:</label>
          <Select value={expiryDays} onValueChange={setExpiryDays}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Expiry List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Medicines Expiring Within {expiryDays} Days</CardTitle>
              <CardDescription>
                Complete list with batch numbers, suppliers, and export functionality
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {medicines.length} items
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ExpiryList medicines={medicines} expiryDays={parseInt(expiryDays)} />
        </CardContent>
      </Card>

      {/* Recommendations */}
      {medicines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Suggested actions based on expiry analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.expiring15Days > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Urgent Action Required
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {stats.expiring15Days} medicine(s) expiring within 15 days. Consider immediate clearance sales, 
                    return to suppliers, or donation to avoid total loss.
                  </p>
                </div>
              )}

              {stats.expiring30Days > 0 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                    Plan Clearance Strategy
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {stats.expiring30Days} medicine(s) expiring within 30 days. Start planning discount sales 
                    or negotiate returns with suppliers.
                  </p>
                </div>
              )}

              {stats.expired > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Inventory Cleanup
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {stats.expired} medicine(s) have already expired. Remove from active inventory 
                    and follow proper disposal procedures.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
