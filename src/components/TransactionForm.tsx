'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import MedicineSearch from '@/components/MedicineSearch'
import ScheduleHModal from '@/components/ScheduleHModal'

const transactionSchema = z.object({
  medicineId: z.string().min(1, 'Please select a medicine'),
  medicineName: z.string().min(1, 'Medicine name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  batch: z.string().optional(),
  supplier: z.string().optional(),
  expiryDate: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  type: 'sell' | 'purchase'
}

export default function TransactionForm({ type }: TransactionFormProps) {
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [showScheduleHModal, setShowScheduleHModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      medicineId: '',
      medicineName: '',
      quantity: 1,
      price: 0,
      batch: '',
      supplier: '',
      expiryDate: '',
    },
  })

  const onMedicineSelect = (medicine: any) => {
    setSelectedMedicine(medicine)
    form.setValue('medicineId', medicine.id)
    form.setValue('medicineName', medicine.name)
    form.setValue('price', medicine.price || 0)
    
    if (type === 'purchase') {
      form.setValue('batch', medicine.batch || '')
      form.setValue('supplier', medicine.supplier || '')
      form.setValue('expiryDate', medicine.expiryDate || '')
    }
  }

  const onSubmit = async (data: TransactionFormData) => {
    // Check if medicine is Schedule H and we're selling
    if (type === 'sell' && selectedMedicine?.schedule === 'H') {
      setShowScheduleHModal(true)
      return
    }

    await processTransaction(data)
  }

  const processTransaction = async (data: TransactionFormData, prescriptionSkipped = false) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          type,
          prescriptionSkipped,
          scheduleH: selectedMedicine?.schedule === 'H',
        }),
      })

      if (!response.ok) {
        throw new Error('Transaction failed')
      }

      const result = await response.json()
      
      toast.success(`${type === 'sell' ? 'Sale' : 'Purchase'} completed successfully!`)
      form.reset()
      setSelectedMedicine(null)
      setShowScheduleHModal(false)
      
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

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="medicineName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicine</FormLabel>
                <FormControl>
                  <MedicineSearch
                    onSelect={onMedicineSelect}
                    placeholder="Search for medicine..."
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per unit (₹)</FormLabel>
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
          </div>

          {type === 'purchase' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter batch number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter supplier name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {selectedMedicine && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Selected Medicine Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Name: {selectedMedicine.name}</div>
                <div>Current Stock: {selectedMedicine.stock}</div>
                {selectedMedicine.schedule === 'H' && (
                  <div className="col-span-2 text-orange-600 font-medium">
                    ⚠️ Schedule H Drug - Prescription required
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total Amount: ₹{(form.watch('quantity') * form.watch('price')).toFixed(2)}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : `Complete ${type === 'sell' ? 'Sale' : 'Purchase'}`}
            </Button>
          </div>
        </form>
      </Form>

      <ScheduleHModal
        isOpen={showScheduleHModal}
        onClose={() => setShowScheduleHModal(false)}
        onComplete={handleScheduleHComplete}
        medicineName={selectedMedicine?.name || ''}
      />
    </>
  )
}
