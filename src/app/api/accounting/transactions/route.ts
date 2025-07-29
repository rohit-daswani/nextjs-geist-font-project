import { NextRequest, NextResponse } from 'next/server'

// Mock accounting data - in a real app, this would be a database
let accountingTransactions = [
  {
    id: '1',
    date: '2024-04-15',
    type: 'sell',
    items: [
      {
        medicineName: 'Paracetamol 500mg',
        quantity: 10,
        price: 12,
        discount: 0,
        taxRate: 12,
        taxableAmount: 120,
        taxAmount: 14.4,
        totalAmount: 134.4
      }
    ],
    invoiceNumber: 'INV-2024-001',
    customerName: 'ABC Medical Store',
    gstNumber: '27AABCU9603R1ZX',
    totalAmount: 134.4,
    taxAmount: 14.4,
    discountAmount: 0,
    netAmount: 134.4,
    paymentMethod: 'Cash',
    financialYear: '2024-2025',
    notes: 'Regular sale'
  },
  {
    id: '2',
    date: '2024-04-16',
    type: 'purchase',
    items: [
      {
        medicineName: 'Amoxicillin 250mg',
        quantity: 50,
        price: 45,
        discount: 5,
        taxRate: 12,
        taxableAmount: 2250,
        taxAmount: 270,
        totalAmount: 2520
      }
    ],
    invoiceNumber: 'PUR-2024-001',
    supplierName: 'PharmaCorp Ltd',
    gstNumber: '27AABCU9603R1ZY',
    totalAmount: 2520,
    taxAmount: 270,
    discountAmount: 112.5,
    netAmount: 2677.5,
    paymentMethod: 'Bank Transfer',
    financialYear: '2024-2025',
    notes: 'Bulk purchase'
  },
  {
    id: '3',
    date: '2024-04-17',
    type: 'sell',
    items: [
      {
        medicineName: 'Ibuprofen 400mg',
        quantity: 20,
        price: 18,
        discount: 10,
        taxRate: 12,
        taxableAmount: 360,
        taxAmount: 43.2,
        totalAmount: 403.2
      }
    ],
    invoiceNumber: 'INV-2024-002',
    customerName: 'XYZ Pharmacy',
    gstNumber: '27AABCU9603R1ZZ',
    totalAmount: 403.2,
    taxAmount: 43.2,
    discountAmount: 36,
    netAmount: 410.4,
    paymentMethod: 'Credit Card',
    financialYear: '2024-2025',
    notes: 'Discount applied'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const financialYear = searchParams.get('financialYear') || '2024-2025'
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let filteredTransactions = accountingTransactions.filter(
      transaction => transaction.financialYear === financialYear
    )

    // Filter by date range if provided
    if (from && to) {
      const fromDate = new Date(from)
      const toDate = new Date(to)
      
      filteredTransactions = filteredTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= fromDate && transactionDate <= toDate
      })
    }

    // Calculate tax summary
    const sales = filteredTransactions.filter(t => t.type === 'sell')
    const purchases = filteredTransactions.filter(t => t.type === 'purchase')

    const taxSummary = {
      totalSales: sales.reduce((sum, t) => sum + t.netAmount, 0),
      totalPurchases: purchases.reduce((sum, t) => sum + t.netAmount, 0),
      totalTaxCollected: sales.reduce((sum, t) => sum + t.taxAmount, 0),
      totalTaxPaid: purchases.reduce((sum, t) => sum + t.taxAmount, 0),
      totalDiscounts: filteredTransactions.reduce((sum, t) => sum + t.discountAmount, 0),
      netTaxLiability: sales.reduce((sum, t) => sum + t.taxAmount, 0) - 
                       purchases.reduce((sum, t) => sum + t.taxAmount, 0)
    }

    return NextResponse.json({
      transactions: filteredTransactions,
      taxSummary,
      total: filteredTransactions.length
    })

  } catch (error) {
    console.error('Accounting API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { date, type, items, invoiceNumber, totalAmount, taxAmount, netAmount } = body
    
    if (!date || !type || !items || !invoiceNumber || !totalAmount || !taxAmount || !netAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new accounting transaction
    const transaction = {
      id: Date.now().toString(),
      ...body,
      financialYear: body.financialYear || '2024-2025',
      timestamp: new Date().toISOString(),
    }

    accountingTransactions.push(transaction)

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaction recorded successfully'
    })

  } catch (error) {
    console.error('Accounting POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
