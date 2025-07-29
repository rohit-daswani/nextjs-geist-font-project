'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Mock medicine data - in a real app, this would come from an API
const mockMedicines = [
  { id: '1', name: 'Paracetamol 500mg', stock: 150, price: 12, schedule: null },
  { id: '2', name: 'Amoxicillin 250mg', stock: 80, price: 45, schedule: 'H' },
  { id: '3', name: 'Crocin Tablets', stock: 8, price: 15, schedule: null },
  { id: '4', name: 'Azithromycin 500mg', stock: 25, price: 120, schedule: 'H' },
  { id: '5', name: 'Ibuprofen 400mg', stock: 200, price: 18, schedule: null },
  { id: '6', name: 'Cetirizine 10mg', stock: 90, price: 8, schedule: null },
  { id: '7', name: 'Omeprazole 20mg', stock: 60, price: 35, schedule: null },
  { id: '8', name: 'Metformin 500mg', stock: 120, price: 22, schedule: null },
  { id: '9', name: 'Ciprofloxacin 500mg', stock: 40, price: 85, schedule: 'H' },
  { id: '10', name: 'Aspirin 75mg', stock: 180, price: 6, schedule: null },
]

interface MedicineSearchProps {
  onSelect: (medicine: any) => void
  placeholder?: string
  value?: string
}

export default function MedicineSearch({ onSelect, placeholder = "Search medicines...", value = "" }: MedicineSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(value)
  const [filteredMedicines, setFilteredMedicines] = useState(mockMedicines)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSearchValue(value)
  }, [value])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchValue.trim() === '') {
        setFilteredMedicines(mockMedicines)
      } else {
        const filtered = mockMedicines.filter(medicine =>
          medicine.name.toLowerCase().includes(searchValue.toLowerCase())
        )
        setFilteredMedicines(filtered)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchValue])

  const handleSelect = (medicine: any) => {
    setSearchValue(medicine.name)
    setOpen(false)
    onSelect(medicine)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    if (newValue.trim() !== '') {
      setOpen(true)
    }
  }

  const handleInputClick = () => {
    setOpen(true)
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={searchValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        placeholder={placeholder}
        className="w-full cursor-pointer"
      />
      
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <Command>
            <CommandList className="max-h-60 overflow-auto">
              {filteredMedicines.length === 0 ? (
                <CommandEmpty className="p-4 text-center text-sm">
                  No medicines found.
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredMedicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      onClick={() => handleSelect(medicine)}
                      className="cursor-pointer p-3 hover:bg-gray-100 border-b last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-sm text-muted-foreground">₹{medicine.price}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                        <span>Stock: {medicine.stock}</span>
                        {medicine.schedule === 'H' && (
                          <span className="text-orange-600 font-medium">Schedule H</span>
                        )}
                        {medicine.stock < 10 && (
                          <span className="text-red-600 font-medium">Low Stock</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
