'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

interface InventoryTableProps {
  medicines: Medicine[]
  onRefresh: () => void
  showAlerts?: boolean
  showExpiry?: boolean
  showSchedule?: boolean
}

export default function InventoryTable({ 
  medicines, 
  onRefresh, 
  showAlerts = false, 
  showExpiry = false, 
  showSchedule = false 
}: InventoryTableProps) {
  const [sortField, setSortField] = useState<keyof Medicine>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: keyof Medicine) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedMedicines = [...medicines].sort((a, b) => {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStockBadge = (medicine: Medicine) => {
    if (medicine.isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (medicine.isLowStock) {
      return <Badge variant="destructive">Low Stock</Badge>
    }
    if (medicine.isExpiringSoon) {
      return <Badge variant="outline" className="border-orange-600 text-orange-600">Expiring Soon</Badge>
    }
    return <Badge variant="secondary">In Stock</Badge>
  }

  const getExpiryStatus = (medicine: Medicine) => {
    if (medicine.isExpired) {
      return <span className="text-red-600 font-medium">Expired</span>
    }
    if (medicine.isExpiringSoon) {
      return <span className="text-orange-600 font-medium">{medicine.daysUntilExpiry} days left</span>
    }
    return <span className="text-green-600">{medicine.daysUntilExpiry} days</span>
  }

  if (medicines.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No medicines found matching your criteria.</p>
        <Button onClick={onRefresh} variant="outline" className="mt-4">
          Refresh Inventory
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showAlerts && medicines.some(m => m.isLowStock) && (
        <Alert>
          <AlertDescription>
            <strong>Attention:</strong> {medicines.filter(m => m.isLowStock).length} medicine(s) have low stock levels. 
            Consider restocking immediately to avoid stockouts.
          </AlertDescription>
        </Alert>
      )}

      {showExpiry && medicines.some(m => m.isExpiringSoon) && (
        <Alert>
          <AlertDescription>
            <strong>Expiry Alert:</strong> {medicines.filter(m => m.isExpiringSoon).length} medicine(s) are expiring soon. 
            Plan for clearance sales or return to suppliers.
          </AlertDescription>
        </Alert>
      )}

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
                onClick={() => handleSort('stock')}
              >
                Stock
                {sortField === 'stock' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('price')}
              >
                Price (₹)
                {sortField === 'price' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Batch</TableHead>
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
                onClick={() => handleSort('expiryDate')}
              >
                Expiry Date
                {sortField === 'expiryDate' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Status</TableHead>
              {showSchedule && <TableHead>Schedule</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMedicines.map((medicine) => (
              <TableRow 
                key={medicine.id}
                className={`
                  ${medicine.isExpired ? 'bg-red-50 dark:bg-red-950/20' : ''}
                  ${medicine.isLowStock && !medicine.isExpired ? 'bg-orange-50 dark:bg-orange-950/20' : ''}
                  ${medicine.isExpiringSoon && !medicine.isLowStock && !medicine.isExpired ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}
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
                    <span className={medicine.isLowStock ? 'text-red-600 font-medium' : ''}>
                      {medicine.stock} units
                    </span>
                    {medicine.isLowStock && (
                      <span className="text-xs text-red-600">Below threshold</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>₹{medicine.price.toFixed(2)}</TableCell>
                <TableCell className="font-mono text-sm">{medicine.batch || 'N/A'}</TableCell>
                <TableCell>{medicine.supplier || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatDate(medicine.expiryDate)}</span>
                    <span className="text-xs">
                      {getExpiryStatus(medicine)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStockBadge(medicine)}
                </TableCell>
                {showSchedule && (
                  <TableCell>
                    {medicine.schedule === 'H' ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Schedule H
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Regular</Badge>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Showing {medicines.length} medicine(s)</span>
        <div className="flex gap-4">
          <span>Low Stock: {medicines.filter(m => m.isLowStock).length}</span>
          <span>Expiring Soon: {medicines.filter(m => m.isExpiringSoon).length}</span>
          <span>Schedule H: {medicines.filter(m => m.schedule === 'H').length}</span>
        </div>
      </div>
    </div>
  )
}
