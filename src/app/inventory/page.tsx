'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InventoryTable from '@/components/InventoryTable'
import AddStockModal from '@/components/AddStockModal'
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

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockCount: 0,
    expiringSoonCount: 0
  })

  useEffect(() => {
    fetchMedicines()
  }, [])

  useEffect(() => {
    filterMedicines()
  }, [medicines, searchTerm, activeTab])

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/medicines')
      if (!response.ok) throw new Error('Failed to fetch medicines')
      
      const data = await response.json()
      setMedicines(data.medicines)
      setStats(data.stats)
    } catch (error) {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const filterMedicines = () => {
    let filtered = medicines

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.batch.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by tab
    switch (activeTab) {
      case 'lowStock':
        filtered = filtered.filter(medicine => medicine.isLowStock)
        break
      case 'expiring':
        filtered = filtered.filter(medicine => medicine.isExpiringSoon)
        break
      case 'scheduleH':
        filtered = filtered.filter(medicine => medicine.schedule === 'H')
        break
      default:
        // 'all' - no additional filtering
        break
    }

    setFilteredMedicines(filtered)
  }

  const handleRefresh = () => {
    fetchMedicines()
    toast.success('Inventory refreshed')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Loading inventory data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
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
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Monitor stock levels, track expiry dates, and manage your medicine inventory
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedicines}</div>
            <p className="text-xs text-muted-foreground">Different medicine types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items below 10 units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoonCount}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search medicines, suppliers, or batch numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            Refresh Inventory
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            Add New Medicine
          </Button>
        </div>
      </div>

      {/* Inventory Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All Medicines
            <Badge variant="secondary" className="ml-2">
              {medicines.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="lowStock">
            Low Stock
            <Badge variant="destructive" className="ml-2">
              {stats.lowStockCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="expiring">
            Expiring Soon
            <Badge variant="outline" className="ml-2 border-orange-600 text-orange-600">
              {stats.expiringSoonCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="scheduleH">
            Schedule H
            <Badge variant="outline" className="ml-2">
              {medicines.filter(m => m.schedule === 'H').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Medicines</CardTitle>
              <CardDescription>
                Complete inventory with stock levels and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable medicines={filteredMedicines} onRefresh={fetchMedicines} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lowStock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>
                Medicines with stock levels below 10 units - immediate attention required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable medicines={filteredMedicines} onRefresh={fetchMedicines} showAlerts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>
                Medicines expiring within 30 days - plan for clearance or return
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable medicines={filteredMedicines} onRefresh={fetchMedicines} showExpiry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduleH" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule H Medicines</CardTitle>
              <CardDescription>
                Prescription-only medicines requiring special handling and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable medicines={filteredMedicines} onRefresh={fetchMedicines} showSchedule />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddStockModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchMedicines}
      />
    </div>
  )
}
