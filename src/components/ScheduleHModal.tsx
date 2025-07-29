'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface ScheduleHModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (prescriptionUploaded: boolean) => void
  medicineName: string
}

export default function ScheduleHModal({ isOpen, onClose, onComplete, medicineName }: ScheduleHModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG) or PDF file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a prescription file')
      return
    }

    setIsUploading(true)
    
    try {
      // In a real app, you would upload the file to your server/cloud storage
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Prescription uploaded successfully')
      onComplete(true)
      resetModal()
    } catch (error) {
      toast.error('Failed to upload prescription')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSkip = () => {
    toast.warning('Transaction completed without prescription upload')
    onComplete(false)
    resetModal()
  }

  const resetModal = () => {
    setSelectedFile(null)
    setIsUploading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule H Drug - Prescription Required</DialogTitle>
          <DialogDescription>
            <strong>{medicineName}</strong> is a Schedule H drug and requires a valid prescription as per Indian medical regulations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              According to the Drugs and Cosmetics Act, Schedule H drugs can only be sold with a valid prescription from a registered medical practitioner.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="prescription">Upload Prescription</Label>
            <Input
              id="prescription"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPG, PNG, PDF (Max size: 5MB)
            </p>
          </div>

          {selectedFile && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected file:</p>
              <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isUploading}
            className="w-full sm:w-auto"
          >
            Skip Upload & Continue
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? 'Uploading...' : 'Upload & Continue'}
          </Button>
        </DialogFooter>

        <div className="text-xs text-muted-foreground mt-2">
          <p>
            <strong>Note:</strong> Skipping prescription upload may not comply with regulatory requirements. 
            Please ensure you maintain proper records for audit purposes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
