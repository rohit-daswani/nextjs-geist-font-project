import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  // Mock data - in a real app, this would come from an API
  const stats = {
    todayTransactions: 24,
    lowStockAlerts: 8,
    expiringMedicines: 12,
    totalInventory: 450
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to MedStore Pro - Your complete medical store management solution
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTransactions}</div>
            <p className="text-xs text-muted-foreground">Sales and purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStockAlerts}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringMedicines}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInventory}</div>
            <p className="text-xs text-muted-foreground">Medicine types</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Sale</CardTitle>
            <CardDescription>
              Process a medicine sale transaction quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/transactions">
              <Button className="w-full">Start Sale</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Check</CardTitle>
            <CardDescription>
              View current stock levels and manage inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/inventory">
              <Button variant="outline" className="w-full">View Inventory</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expiry Management</CardTitle>
            <CardDescription>
              Check medicines nearing expiry and export reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/expiry">
              <Button variant="outline" className="w-full">Check Expiry</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest transactions and system updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">Paracetamol 500mg - Sale</p>
                <p className="text-sm text-muted-foreground">Qty: 2, Amount: ₹24</p>
              </div>
              <p className="text-sm text-muted-foreground">2 min ago</p>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">Amoxicillin 250mg - Purchase</p>
                <p className="text-sm text-muted-foreground">Qty: 100, Amount: ₹1,200</p>
              </div>
              <p className="text-sm text-muted-foreground">1 hour ago</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground">Crocin tablets below 10 units</p>
              </div>
              <p className="text-sm text-muted-foreground">3 hours ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
