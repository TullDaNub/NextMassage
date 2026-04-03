import { create } from 'zustand'
import { Database } from '@/types/database.types'

type Service = Database['public']['Tables']['services']['Row']
type Room = Database['public']['Tables']['rooms']['Row']
type Masseuse = Database['public']['Tables']['masseuses']['Row']

interface BookingState {
  step: number
  
  // Selections
  selectedService: Service | null
  selectedRoom: Room | null
  selectedDate: Date | null
  selectedTime: string | null // e.g., '14:30'
  selectedMasseuse: Masseuse | null
  isAutoAssignMasseuse: boolean
  
  // Customer Details
  customerName: string
  customerPhone: string
  
  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  
  setSelectedService: (service: Service | null) => void
  setSelectedRoom: (room: Room | null) => void
  setSelectedDateTime: (date: Date | null, time: string | null) => void
  setSelectedMasseuse: (masseuse: Masseuse | null, isAuto: boolean) => void
  setCustomerDetails: (name: string, phone: string) => void
  
  resetBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  
  selectedService: null,
  selectedRoom: null,
  selectedDate: null,
  selectedTime: null,
  selectedMasseuse: null,
  isAutoAssignMasseuse: false,
  
  customerName: '',
  customerPhone: '',
  
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  
  setSelectedService: (service) => set({ selectedService: service, step: 2 }),
  setSelectedRoom: (room) => set({ selectedRoom: room, step: 3 }),
  setSelectedDateTime: (date, time) => set({ selectedDate: date, selectedTime: time, step: 4 }),
  setSelectedMasseuse: (masseuse, isAuto) => set({ selectedMasseuse: masseuse, isAutoAssignMasseuse: isAuto, step: 5 }),
  setCustomerDetails: (name, phone) => set({ customerName: name, customerPhone: phone }),
  
  resetBooking: () => set({
    step: 1,
    selectedService: null,
    selectedRoom: null,
    selectedDate: null,
    selectedTime: null,
    selectedMasseuse: null,
    isAutoAssignMasseuse: false,
    customerName: '',
    customerPhone: '',
  }),
}))
