'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Transaction {
  id: string
  date: string
  type: 'sell' | 'purchase'
  items: TransactionItem[]
  customerName?: string
  supplierName?: string
  invoiceNumber: string
  gstNumber?: string
  totalAmount: number
  taxAmount: number
  discountAmount: number
  netAmount: number
  paymentMethod: string
  financialYear: string
  notes?: string
}

interface TransactionItem {
  medicineName: string
  quantity: number
  price: number
  discount: number
  taxRate: number
  taxableAmount: number
  taxAmount: number
  totalAmount: number
}

interface TaxSummary {
  totalSales: number
  totalPurchases: number
  totalTaxCollected: number
  totalTaxPaid: number
  netTaxLiability: number
  totalDiscounts: number
}

export default function AccountingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedFinancialYear, setSelectedFinancialYear] = useState('2024-2025')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [taxSummary, setTaxSummary] = useState<TaxSummary>({
    totalSales: 0,
    totalPurchases: 0,
    totalTaxCollected: 0,
    totalTaxPaid: 0,
    netTaxLiability: 0,
    totalDiscounts: 0,
  })

  const financialYears = ['2022-2023', '2023-2024', '2024-2025', '2025-2026']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    fetchTransactions()
  }, [selectedFinancialYear, selectedMonth])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, activeTab])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        financialYear: selectedFinancialYear,
        ...(selectedMonth && { month: selectedMonth }),
      })

      const response = await fetch(`/api/accounting/transactions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      
      const data = await response.json()
      setTransactions(data.transactions)
      setTaxSummary(data.taxSummary)
    } catch (error) {
      toast.error('Failed to load accounting data')
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.items.some(item => 
          item.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filter by transaction type
    if (activeTab !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === activeTab)
    }

    setFilteredTransactions(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  const exportToCSV = () => {
    const csvData = filteredTransactions.map(transaction => ({
      'Date': formatDate(transaction.date),
      'Type': transaction.type.toUpperCase(),
      'Invoice Number': transaction.invoiceNumber,
      'Customer/Supplier': transaction.customerName || transaction.supplierName || 'N/A',
      'GST Number': transaction.gstNumber || 'N/A',
      'Total Amount': transaction.totalAmount,
      'Tax Amount': transaction.taxAmount,
      'Discount Amount': transaction.discountAmount,
      'Net Amount': transaction.netAmount,
      'Payment Method': transaction.paymentMethod,
      'Financial Year': transaction.financialYear,
    }))

    const headers = [
      'Date',
      'Type',
      'Invoice Number',
      'Customer/Supplier',
      'GST Number',
      'Total Amount',
      'Tax Amount',
      'Discount Amount',
      'Net Amount',
      'Payment Method',
      'Financial Year'
    ]

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `accounting-report-${selectedFinancialYear}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('Accounting report exported successfully')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Chartered Accountant Portal</h1>
          <p className="text-muted-foreground">Loading accounting data...</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Chartered Accountant Portal</h1>
        <p className="text-muted-foreground">
          Comprehensive accounting data for ITR filing and tax compliance
        </p>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(taxSummary.totalSales)}</div>
            <p className="text-xs text-muted-foreground">Current financial year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(taxSummary.totalPurchases)}</div>
            <p className="text-xs text-muted-foreground">Current financial year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(taxSummary.totalTaxCollected)}</div>
            <p className="text-xs text-muted-foreground">GST/Tax collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Tax Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(taxSummary.netTaxLiability)}</div>
            <p className="text-xs text-muted-foreground">Payable/Refundable</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Select value={selectedFinancialYear} onValueChange={setSelectedFinancialYear}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Financial Year" />
            </SelectTrigger>
            <SelectContent>
              {financialYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Months</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search invoices, customers, suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={exportToCSV} variant="outline">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Transaction Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="sell">Sales</TabsTrigger>
          <TabsTrigger value="purchase">Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete transaction history for tax filing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountingTable transactions={filteredTransactions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Transactions</CardTitle>
              <CardDescription>
                All sales transactions with tax details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountingTable transactions={filteredTransactions} type="sell" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Transactions</CardTitle>
              <CardDescription>
                All purchase transactions with tax details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountingTable transactions={filteredTransactions} type="purchase" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AccountingTable({ transactions, type }: { transactions: Transaction[], type?: string }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Invoice</th>
            <th className="text-left p-2">Party</th>
            <th className="text-left p-2">GST Number</th>
            <th className="text-right p-2">Total</th>
            <th className="text-right p-2">Tax</th>
            <th className="text-right p-2">Discount</th>
            <th className="text-right p-2">Net</th>
            <th className="text-left p-2">Payment</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b hover:bg-muted/50">
              <td className="p-2">{formatDate(transaction.date)}</td>
              <td className="p-2 font-mono">{transaction.invoiceNumber}</td>
              <td className="p-2">{transaction.customerName || transaction.supplierName || 'N/A'}</td>
              <td className="p-2 font-mono">{transaction.gstNumber || 'N/A'}</td>
              <td className="p-2 text-right">{formatCurrency(transaction.totalAmount)}</td>
              <td className="p-2 text-right">{formatCurrency(transaction.taxAmount)}</td>
              <td className="p-2 text-right">{formatCurrency(transaction.discountAmount)}</td>
              <td className="p-2 text-right font-medium">{formatCurrency(transaction.netAmount)}</td>
              <td className="p-2">
                <Badge variant="outline">{transaction.paymentMethod}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
