"use client"

import { useEffect, useState } from "react"
import { useBookingStore } from "@/store/booking"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { format, parse, isBefore, isAfter, addMinutes } from "date-fns"
import { Heart } from "lucide-react"
import { useFavoritesStore } from "@/store/favorites"

type Masseuse = Database['public']['Tables']['masseuses']['Row']

export function MasseuseSelection() {
  const { 
    selectedDate, 
    selectedTime, 
    selectedService, 
    selectedMasseuse, 
    isAutoAssignMasseuse,
    setSelectedMasseuse, 
    prevStep,
    nextStep
  } = useBookingStore()

  const [masseuses, setMasseuses] = useState<Masseuse[]>([])
  const [unavailableMasseuses, setUnavailableMasseuses] = useState<Record<string, string>>({}) // id -> nextAvailableTime
  const [loading, setLoading] = useState(true)

  const { isFavorite, toggleFavorite, favoriteMasseuseIds } = useFavoritesStore()

  useEffect(() => {
    async function loadMasseuses() {
      if (!selectedDate || !selectedTime || !selectedService) return
      setLoading(true)

      // 1. Get all active masseuses who can perform the selected service
      let { data: eligibleMasseuses, error: mError } = await supabase
        .from('masseuses')
        .select(`
          *,
          masseuse_services!inner(service_id)
        `)
        .eq('is_active', true)
        .eq('masseuse_services.service_id', selectedService.id)

      if (mError) {
        console.error('Error fetching masseuses:', mError)
      }

      // Fallback: If no masseuses are mapped to this service, load ALL active masseuses
      if (!eligibleMasseuses || eligibleMasseuses.length === 0) {
        console.log("No specific masseuses found for this service. Falling back to all active masseuses.");
        const { data: allActiveMasseuses, error: fallbackError } = await supabase
          .from('masseuses')
          .select('*')
          .eq('is_active', true)
          
        if (fallbackError) {
          console.error('Error fetching fallback masseuses:', fallbackError)
          setLoading(false)
          return
        }
        eligibleMasseuses = allActiveMasseuses || []
      }

      if (!eligibleMasseuses || eligibleMasseuses.length === 0) {
        setLoading(false)
        return
      }

      // 2. Determine who is busy at the selected DateTime
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const reqStart = parse(`${dateStr} ${selectedTime}`, 'yyyy-MM-dd HH:mm', new Date())
      const reqEnd = addMinutes(reqStart, selectedService.duration_minutes)

      const { data: bookings, error: bError } = await supabase
        .from('appointments')
        .select('masseuse_id, start_time, end_time')
        .eq('appointment_date', dateStr)
        .in('masseuse_id', eligibleMasseuses.map(m => m.id))
        .not('status', 'in', '("cancelled","no_show")')

      if (bError) {
        console.error('Error fetching bookings:', bError)
        setLoading(false)
        return
      }

      const available: Masseuse[] = []
      const unavailable: Record<string, string> = {}

      eligibleMasseuses.forEach(m => {
        // Off_duty check
        if (m.status === 'off_duty') {
           unavailable[m.id] = 'วันนี้ไม่เข้าเวร'
           return
        }

        const mBookings = bookings.filter(b => b.masseuse_id === m.id)
        
        let isBusy = false
        let nextAvailable: Date | null = null

        mBookings.forEach(b => {
          const bStart = parse(`${dateStr} ${b.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date())
          const bEnd = parse(`${dateStr} ${b.end_time}`, 'yyyy-MM-dd HH:mm:ss', new Date())

          // Condition for overlap
          if (isBefore(reqStart, bEnd) && isAfter(reqEnd, bStart)) {
            isBusy = true
            // Find the closest available time after this booking
            if (!nextAvailable || isAfter(bEnd, nextAvailable)) {
              nextAvailable = bEnd
            }
          }
        })

        if (isBusy) {
          unavailable[m.id] = `ว่างอีกทีเวลา ${nextAvailable ? format(nextAvailable, 'HH:mm') : 'ไม่ระบุ'}`
        } else {
          available.push(m)
        }
      })

      // Sort favorites first
      available.sort((a, b) => {
        const aFav = favoriteMasseuseIds.includes(a.id) ? 1 : 0
        const bFav = favoriteMasseuseIds.includes(b.id) ? 1 : 0
        return bFav - aFav
      })
      const unavailableArr = eligibleMasseuses.filter(m => !!unavailable[m.id]).sort((a, b) => {
        const aFav = favoriteMasseuseIds.includes(a.id) ? 1 : 0
        const bFav = favoriteMasseuseIds.includes(b.id) ? 1 : 0
        return bFav - aFav
      })

      // Combine them, putting available first
      setMasseuses([...available, ...unavailableArr])
      setUnavailableMasseuses(unavailable)
      setLoading(false)
    }

    loadMasseuses()
  }, [selectedDate, selectedTime, selectedService])

  const handleNext = () => {
    if (isAutoAssignMasseuse || selectedMasseuse) {
      nextStep()
    }
  }

  const handleAutoAssign = () => {
    // Just find the first available one for simplicity in the UI context
    const firstAvailable = masseuses.find(m => !unavailableMasseuses[m.id])
    if (firstAvailable) {
      setSelectedMasseuse(firstAvailable, true)
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center animate-pulse text-primary font-prompt">กำลังตรวจสอบคิวพนักงาน...</div>
  }

  const availableCount = masseuses.filter(m => !unavailableMasseuses[m.id]).length

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text heading-thai mb-2">4. เลือกพนักงานนวด</h2>
        <p className="text-text-light font-prompt text-sm">
          เลือกระบุตัวพนักงาน หรือให้ระบบสุ่มเลือกพนักงานที่ว่างให้
        </p>
      </div>

      <div className="space-y-6">
        {/* Auto Assign Card */}
        <button
          onClick={handleAutoAssign}
          disabled={availableCount === 0}
          className={`w-full relative flex flex-col md:flex-row items-center border-2 p-6 rounded-2xl transition-all duration-200 group
            ${isAutoAssignMasseuse 
              ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' 
              : availableCount === 0
                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                : 'border-transparent bg-white shadow-sm hover:border-primary/30 hover:shadow-md'
            }`}
        >
          <div className={`w-14 h-14 md:mr-6 mb-4 md:mb-0 rounded-full flex items-center justify-center transition-colors shrink-0
            ${isAutoAssignMasseuse ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/20'}
          `}>
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-text text-lg heading-thai mb-1">สุ่มพนักงานอัตโนมัติ (แนะนำ)</h3>
            <p className="text-sm font-prompt text-text-light">
              {availableCount > 0 
                ? `ระบบจะเลือกพนักงานที่ว่างในเวลานี้ให้ (ว่าง ${availableCount} คน)` 
                : 'ขออภัย ไม่มีพนักงานว่างในเวลานี้'}
            </p>
          </div>
          {isAutoAssignMasseuse && (
            <div className="absolute top-4 right-4 text-primary animate-bounce-in">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          )}
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-sm font-medium text-gray-400 heading-thai">หรือ ระบุพนักงาน</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Specific Masseuse List */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {masseuses.map((m) => {
            const isUnavailable = !!unavailableMasseuses[m.id]
            const isSelected = !isAutoAssignMasseuse && selectedMasseuse?.id === m.id

            return (
              <button
                key={m.id}
                onClick={() => !isUnavailable && setSelectedMasseuse(m, false)}
                disabled={isUnavailable}
                className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 text-center transition-all duration-200
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-md scale-[1.03]' 
                    : isUnavailable
                      ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed grayscale'
                      : 'border-transparent bg-white shadow-sm hover:border-primary/30 hover:shadow-md hover:-translate-y-1'
                  }`}
              >
                {/* Avatar Placeholder */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 text-2xl heading-thai
                  ${isSelected ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {m.nickname?.[0] || m.name[0]}
                </div>
                
                <h3 className="font-semibold text-text text-base heading-thai flex items-center gap-1">
                  {m.name} 
                  {isFavorite(m.id) && <Heart className="w-3 h-3 fill-pink-500 text-pink-500 inline-block"/>}
                </h3>
                {m.nickname && <span className="text-xs text-gray-400 mb-2">({m.nickname})</span>}

                {/* Status Badges */}
                {isUnavailable ? (
                   <div className="mt-auto bg-red-50 text-red-500 text-[10px] font-prompt px-2 py-1 rounded-md w-full leading-tight">
                     {unavailableMasseuses[m.id]}
                   </div>
                ) : (
                  <div className="mt-auto bg-green-50 text-green-600 text-xs font-prompt px-2 py-1 rounded-full border border-green-100">
                    เลือกได้
                  </div>
                )}
                
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-sm animate-bounce-in">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                )}

                {/* Favorite Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(m.id)
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                  <Heart className={`w-4 h-4 transition-colors ${isFavorite(m.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-300'}`} />
                </button>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100 mt-8">
        <button onClick={prevStep} className="btn-outline font-prompt text-sm px-6 py-2 h-auto text-gray-500 border-gray-300 hover:bg-gray-50">
          ย้อนกลับ
        </button>
        <button 
          onClick={handleNext} 
          disabled={!isAutoAssignMasseuse && !selectedMasseuse}
          className="btn-primary font-prompt text-sm px-8 py-2 h-auto"
        >
          ถัดไป
        </button>
      </div>
    </div>
  )
}
