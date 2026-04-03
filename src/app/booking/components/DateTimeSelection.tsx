"use client"

import { useState, useEffect } from "react"
import { useBookingStore } from "@/store/booking"
import { supabase } from "@/lib/supabase/client"
import { addDays, format, isBefore, startOfToday, parse, isAfter } from "date-fns"
import { th } from "date-fns/locale"
import { BUSINESS_HOURS } from "@/config/businessHours"

export function DateTimeSelection() {
  const { selectedDate, selectedTime, selectedRoom, selectedService, setSelectedDateTime, prevStep } = useBookingStore()
  
  const [date, setDate] = useState<Date>(selectedDate || startOfToday())
  const [time, setTime] = useState<string | null>(selectedTime)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Generate next 14 days for selection
  const days = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i))

  useEffect(() => {
    async function fetchAvailability() {
      if (!date || !selectedRoom || !selectedService) return
      setLoading(true)

      // Store opening hours from config
      const openingHour = BUSINESS_HOURS.OPENING_HOUR
      const closingHour = BUSINESS_HOURS.CLOSING_HOUR
      const slotDuration = BUSINESS_HOURS.SLOT_INTERVAL_MINUTES

      // Generate all possible slots
      const allSlots: string[] = []
      let currentTime = new Date(date)
      currentTime.setHours(openingHour, 0, 0, 0)
      
      const endTime = new Date(date)
      endTime.setHours(closingHour, 0, 0, 0)

      while (isBefore(currentTime, endTime)) {
        // Only allow booking if the service ends before closing time
        const serviceEndTime = new Date(currentTime.getTime() + selectedService.duration_minutes * 60000)
        if (!isAfter(serviceEndTime, endTime)) {
          allSlots.push(format(currentTime, 'HH:mm'))
        }
        currentTime = new Date(currentTime.getTime() + slotDuration * 60000)
      }

      // Fetch existing appointments for this room on this date
      const dateStr = format(date, 'yyyy-MM-dd')
      const { data: bookings, error } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('room_id', selectedRoom.id)
        .eq('appointment_date', dateStr)
        .not('status', 'in', '("cancelled","no_show")')

      if (error) {
        console.error('Error fetching bookings:', error)
        setAvailableSlots(allSlots) // fallback
        setLoading(false)
        return
      }

      // Filter out booked slots
      const available = allSlots.filter(slotText => {
        const slotStart = parse(`${dateStr} ${slotText}`, 'yyyy-MM-dd HH:mm', new Date())
        const slotEnd = new Date(slotStart.getTime() + selectedService.duration_minutes * 60000)

        // Check against all existing bookings
        const isConflict = bookings.some(b => {
          const bStart = parse(`${dateStr} ${b.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date())
          const bEnd = parse(`${dateStr} ${b.end_time}`, 'yyyy-MM-dd HH:mm:ss', new Date())

          // Condition for overlap: (StartA < EndB) and (EndA > StartB)
          return isBefore(slotStart, bEnd) && isAfter(slotEnd, bStart)
        })

        // Also prevent booking in the past for today
        const isPast = isBefore(slotStart, new Date())

        return !isConflict && !isPast
      })

      setAvailableSlots(available)
      
      // Auto-deselect time if it's no longer available on the new date
      if (time && !available.includes(time)) {
        setTime(null)
      }
      
      setLoading(false)
    }

    fetchAvailability()
  }, [date, selectedRoom, selectedService])

  const handleNext = () => {
    if (date && time) {
      setSelectedDateTime(date, time)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text heading-thai mb-2">3. เลือกวันและเวลา</h2>
        <p className="text-text-light font-prompt text-sm">
          กำลังเลือกเวลาสำหรับ: <span className="font-semibold text-primary">{selectedService?.name} ({selectedService?.duration_minutes} นาที)</span>
        </p>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-text heading-thai border-b border-gray-100 pb-2">วันรับบริการ</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory pt-1 px-1 custom-scrollbar">
          {days.map((d) => {
            const isSelected = date && format(date, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')
            return (
              <button
                key={d.toISOString()}
                onClick={() => setDate(d)}
                className={`snap-start shrink-0 flex flex-col items-center justify-center min-w-[80px] h-[90px] rounded-2xl border transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5'
                  }`}
              >
                <span className={`text-xs font-prompt mb-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  {format(d, 'EEE', { locale: th })}
                </span>
                <span className="text-2xl font-bold">{format(d, 'dd')}</span>
                <span className={`text-[10px] font-prompt mt-1 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {format(d, 'MMM', { locale: th })}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-lg font-medium text-text heading-thai">เวลารับบริการ</h3>
          {loading && <span className="text-xs text-primary animate-pulse font-prompt">กำลังตรวจสอบคิวว่าง...</span>}
        </div>
        
        <div className="min-h-[200px]">
          {loading ? (
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
               {[1,2,3,4,5,6,7,8,9,10].map(i => (
                 <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl"></div>
               ))}
             </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all border
                    ${time === slot 
                      ? 'border-primary bg-primary/10 text-primary shadow-sm scale-[1.03] ring-1 ring-primary' 
                      : 'border-gray-200 bg-white text-text-light hover:border-primary/50 hover:bg-gray-50'
                    }`}
                >
                  {slot} น.
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <span className="text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              </span>
              <p className="text-text-light font-prompt text-sm">ขออภัย คิวเต็มสำหรับวันนี้</p>
              <p className="text-gray-400 font-prompt text-xs mt-1">กรุณาเลือกวันอื่น</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-100 mt-8">
        <button onClick={prevStep} className="btn-outline font-prompt text-sm px-6 py-2 h-auto text-gray-500 border-gray-300 hover:bg-gray-50">
          ย้อนกลับ
        </button>
        <button 
          onClick={handleNext} 
          disabled={!time}
          className="btn-primary font-prompt text-sm px-8 py-2 h-auto"
        >
          ถัดไป
        </button>
      </div>

      {/* Global styles for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
