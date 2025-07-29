import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Export data to CSV file and trigger download
 */
export function exportToCSV(data: any[], headers: string[], filename?: string): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Create CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || ''
        // Escape commas and quotes in values
        const escapedValue = String(value).replace(/"/g, '""')
        return `"${escapedValue}"`
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename || `export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Calculate days until expiry from a date string
 */
export function calculateDaysUntilExpiry(expiryDate: string): number {
  if (!expiryDate) return 0
  
  const expiry = new Date(expiryDate)
  const today = new Date()
  
  // Reset time to start of day for accurate day calculation
  expiry.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date in Indian format
 */
export function formatDate(date: string | Date): string {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Check if a medicine is low stock
 */
export function isLowStock(stock: number, threshold: number = 10): boolean {
  return stock < threshold
}

/**
 * Get stock status badge variant
 */
export function getStockStatus(stock: number, threshold: number = 10): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (stock === 0) return 'destructive'
  if (stock < threshold) return 'outline'
  return 'secondary'
}
