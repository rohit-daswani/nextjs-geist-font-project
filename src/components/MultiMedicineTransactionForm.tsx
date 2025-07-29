'use client'

import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import MedicineSearch from '@/components/MedicineSearch'
import ScheduleHModal from '@/components/ScheduleHModal'

const transactionItemSchema = z.object({
  medicineId: z.string().min(1, 'Please select a medicine'),
  medicineName: z.string().min(1, 'Medicine name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discount: z.number().min(0).max(100, 'Discount must be between 0-100%'),
})

const multiTransactionSchema = z.object({
  items: z.array(transactionItemSchema).min(1, 'At least one medicine is required'),
  totalDiscount: z.number().min(0).max(100, 'Total discount must be between 0-100%'),
  customerName: z.string().optional(),
  notes: z.string().optional(),
})

type MultiTransactionFormData = z.infer<typeof multiTransactionSchema>

interface MultiMedicineTransactionFormProps {
  type: 'sell' | 'purchase'
}

export default function MultiMedicineTransactionForm({ type }: MultiMedicineTransactionFormProps) {
  const [showScheduleHModal, setShowScheduleHModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scheduleHItems, setScheduleHItems] = useState<any[]>([])

  const form = useForm<MultiTransactionFormData>({
    resolver: zodResolver(multiTransactionSchema),
    defaultValues: {
      items: [{ medicineId: '', medicineName: '', quantity: 1, price: 0, discount: 0 }],
      totalDiscount: 0,
      customerName: '',
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const onMedicineSelect = (index: number, medicine: any) => {
    form.setValue(`items.${index}.medicineId`, medicine.id)
    form.setValue(`items.${index}.medicineName`, medicine.name)
    form.setValue(`items.${index}.price`, medicine.price || 0)
  }

  const calculateTotals = () => {
    const items = form.watch('items')
    const totalDiscount = form.watch('totalDiscount')
    
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price
      const itemDiscount = itemTotal * (item.discount / 100)
      return sum + (itemTotal - itemDiscount)
    }, 0)

    const totalDiscountAmount = subtotal * (totalDiscount / 100)
    const grandTotal = subtotal - totalDiscountAmount

    return { subtotal, totalDiscountAmount, grandTotal }
  }

  const onSubmit = async (data: MultiTransactionFormData) => {
    // Check for Schedule H drugs
    const scheduleHItems = data.items.filter(item => {
      const medicine = mockMedicines.find(m => m.id === item.medicineId)
      return medicine?.schedule === 'H'
    })

    if (type === 'sell' && scheduleHItems.length > 0) {
      setScheduleHItems(scheduleHItems)
      setShowScheduleHModal(true)
      return
    }

    await processTransaction(data)
  }

  const processTransaction = async (data: MultiTransactionFormData, prescriptionSkipped = false) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/transactions/multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          type,
          prescriptionSkipped,
          scheduleHCount: data.items.filter(item => {
            const medicine = mockMedicines.find(m => m.id === item.medicineId)
            return medicine?.schedule === 'H'
          }).length,
        }),
      })

      if (!response.ok) {
        throw new Error('Transaction failed')
      }

      const result = await response.json()
      
      toast.success(`${type === 'sell' ? 'Sale' : 'Purchase'} completed successfully!`)
      form.reset()
      
    } catch (error) {
      toast.error('Transaction failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleScheduleHComplete = (prescriptionUploaded: boolean) => {
    const formData = form.getValues()
    processTransaction(formData, !prescriptionUploaded)
  }

  const { subtotal, totalDiscountAmount, grandTotal } = calculateTotals()

  // Mock data for demonstration
  const mockMedicines = [
    { id: '1', name: 'Paracetamol 500mg', stock: 150, price: 12, schedule: null },
    { id: '2', name: 'Amoxicillin 250mg', stock: 80, price: 45, schedule: 'H' },
    { id: '3', name: 'Crocin Tablets', stock: 8, price: 15, schedule: null },
    { id: '4', name: 'Azithromycin 500mg', stock: 25, price: 120, schedule: 'H' },
  ]

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter customer name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Additional notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Medicine Items */}
          <Card>
            <CardHeader>
              <CardTitle>Medicines</CardTitle>
              <CardDescription>Add multiple medicines to this transaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardContent className="pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.medicineName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medicine</FormLabel>
                              <FormControl>
                                <MedicineSearch
                                  onSelect={(medicine) => onMedicineSelect(index, medicine)}
                                  placeholder="Search medicine..."
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {(() => {
                      const medicine = mockMedicines.find(m => m.id === form.watch(`items.${index}.medicineName`))
                      return medicine?.schedule === 'H' ? (
                        <Badge variant="outline" className="mt-2 text-orange-600">
                          Schedule H - Prescription Required
                        </Badge>
                      ) : null
                    })()}
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ medicineId: '', medicineName: '', quantity: 1, price: 0, discount: 0 })}
              >
                Add Another Medicine
              </Button>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Discount:</span>
                <span className="font-medium text-red-600">-₹{totalDiscountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Processing...' : `Complete ${type === 'sell' ? 'Sale' : 'Purchase'}`}
          </Button>
        </form>
      </Form>

      <ScheduleHModal
        isOpen={showScheduleHModal}
        onClose={() => setShowScheduleHModal(false)}
        onComplete={handleScheduleHComplete}
        medicineName={`${scheduleHItems.length} Schedule H medicine(s)`}
      />
    </>
  )
}
