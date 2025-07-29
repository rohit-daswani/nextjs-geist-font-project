'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/utils'

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

interface ExpiryListProps {
  medicines: Medicine[]
  expiryDays: number
}

export default function ExpiryList({ medicines, expiryDays }: ExpiryListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Medicine>('daysUntilExpiry')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterBy, setFilterBy] = useState<'all' | 'expired' | 'critical' | 'warning'>('all')

  const handleSort = (field: keyof Medicine) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getFilteredMedicines = () => {
    let filtered = medicines

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.batch.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by expiry status
    switch (filterBy) {
      case 'expired':
        filtered = filtered.filter(m => m.isExpired)
        break
      case 'critical':
        filtered = filtered.filter(m => m.daysUntilExpiry <= 15 && m.daysUntilExpiry > 0)
        break
      case 'warning':
        filtered = filtered.filter(m => m.daysUntilExpiry > 15 && m.daysUntilExpiry <= 30)
        break
      default:
        // 'all' - no additional filtering
        break
    }

    // Sort medicines
    return filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })
  }

  const filteredMedicines = getFilteredMedicines()

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getExpiryBadge = (medicine: Medicine) => {
    if (medicine.isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (medicine.daysUntilExpiry <= 15) {
      return <Badge variant="destructive">Critical</Badge>
    }
    if (medicine.daysUntilExpiry <= 30) {
      return <Badge variant="outline" className="border-orange-600 text-orange-600">Warning</Badge>
    }
    return <Badge variant="secondary">Normal</Badge>
  }

  const getExpiryText = (medicine: Medicine) => {
    if (medicine.isExpired) {
      return <span className="text-red-600 font-medium">Expired {Math.abs(medicine.daysUntilExpiry)} days ago</span>
    }
    if (medicine.daysUntilExpiry <= 15) {
      return <span className="text-red-600 font-medium">{medicine.daysUntilExpiry} days left</span>
    }
    if (medicine.daysUntilExpiry <= 30) {
      return <span className="text-orange-600 font-medium">{medicine.daysUntilExpiry} days left</span>
    }
    return <span className="text-green-600">{medicine.daysUntilExpiry} days left</span>
  }

  const handleExportCSV = () => {
    if (filteredMedicines.length === 0) {
      toast.error('No data to export')
      return
    }

    const csvData = filteredMedicines.map(medicine => ({
      'Medicine Name': medicine.name,
      'Batch Number': medicine.batch,
      'Supplier': medicine.supplier,
      'Expiry Date': formatDate(medicine.expiryDate),
      'Days Until Expiry': medicine.daysUntilExpiry,
      'Current Stock': medicine.stock,
      'Price per Unit': `₹${medicine.price}`,
      'Total Value': `₹${(medicine.stock * medicine.price).toFixed(2)}`,
      'Schedule': medicine.schedule || 'Regular',
      'Status': medicine.isExpired ? 'Expired' : medicine.daysUntilExpiry <= 15 ? 'Critical' : medicine.daysUntilExpiry <= 30 ? 'Warning' : 'Normal'
    }))

    const headers = [
      'Medicine Name',
      'Batch Number', 
      'Supplier',
      'Expiry Date',
      'Days Until Expiry',
      'Current Stock',
      'Price per Unit',
      'Total Value',
      'Schedule',
      'Status'
    ]

    const filename = `expiry-report-${expiryDays}days-${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(csvData, headers, filename)
    toast.success('Expiry report exported successfully')
  }

  if (medicines.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No medicines found expiring within {expiryDays} days.
        </p>
        <p className="text-sm text-green-600">Your inventory is in good condition!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Input
            placeholder="Search medicines, suppliers, or batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="critical">Critical (≤15 days)</SelectItem>
              <SelectItem value="warning">Warning (16-30 days)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          Export CSV ({filteredMedicines.length} items)
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                Medicine Name
                {sortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('expiryDate')}
              >
                Expiry Date
                {sortField === 'expiryDate' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('daysUntilExpiry')}
              >
                Days Left
                {sortField === 'daysUntilExpiry' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('supplier')}
              >
                Supplier
                {sortField === 'supplier' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('stock')}
              >
                Stock
                {sortField === 'stock' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Value at Risk</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.map((medicine) => (
              <TableRow 
                key={medicine.id}
                className={`
                  ${medicine.isExpired ? 'bg-red-50 dark:bg-red-950/20' : ''}
                  ${medicine.daysUntilExpiry <= 15 && !medicine.isExpired ? 'bg-orange-50 dark:bg-orange-950/20' : ''}
                  ${medicine.daysUntilExpiry <= 30 && medicine.daysUntilExpiry > 15 ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}
                `}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{medicine.name}</span>
                    {medicine.schedule === 'H' && (
                      <Badge variant="outline" className="w-fit mt-1 text-xs">
                        Schedule H
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{formatDate(medicine.expiryDate)}</span>
                    <span className="text-xs text-muted-foreground">
                      {getExpiryText(medicine)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    medicine.isExpired ? 'text-red-600' :
                    medicine.daysUntilExpiry <= 15 ? 'text-red-600' :
                    medicine.daysUntilExpiry <= 30 ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {medicine.isExpired ? `${Math.abs(medicine.daysUntilExpiry)} days ago` : `${medicine.daysUntilExpiry} days`}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">{medicine.batch || 'N/A'}</TableCell>
                <TableCell>{medicine.supplier || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{medicine.stock} units</span>
                    {medicine.isLowStock && (
                      <span className="text-xs text-red-600">Low stock</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    ₹{(medicine.stock * medicine.price).toLocaleString('en-IN')}
                  </span>
                </TableCell>
                <TableCell>
                  {getExpiryBadge(medicine)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
        <span>Showing {filteredMedicines.length} of {medicines.length} medicine(s)</span>
        <div className="flex gap-4">
          <span>Expired: {filteredMedicines.filter(m => m.isExpired).length}</span>
          <span>Critical: {filteredMedicines.filter(m => m.daysUntilExpiry <= 15 && !m.isExpired).length}</span>
          <span>Warning: {filteredMedicines.filter(m => m.daysUntilExpiry > 15 && m.daysUntilExpiry <= 30).length}</span>
          <span>Total Value: ₹{filteredMedicines.reduce((sum, m) => sum + (m.stock * m.price), 0).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}
