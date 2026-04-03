"use client"

import { useEffect, useState } from "react"
import { useBookingStore } from "@/store/booking"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"

type Room = Database['public']['Tables']['rooms']['Row']

export function RoomSelection() {
  const { selectedRoom, setSelectedRoom, prevStep } = useBookingStore()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRooms() {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true })
      
      if (!error && data) {
        setRooms(data)
      }
      setLoading(false)
    }
    loadRooms()
  }, [])

  if (loading) {
    return <div className="flex h-64 items-center justify-center animate-pulse text-primary font-prompt">กำลังโหลดข้อมูลห้อง...</div>
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text heading-thai mb-2">2. เลือกห้องนวด</h2>
        <p className="text-text-light font-prompt text-sm">เลือกประเภทห้องที่ตรงกับความต้องการของคุณ</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center transition-all duration-200 group
              ${selectedRoom?.id === room.id 
                ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                : 'border-transparent bg-white shadow-sm hover:border-primary/30 hover:shadow-md'
              }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors
              ${selectedRoom?.id === room.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/20'}
            `}>
              {room.type === 'air_con' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 16a4 4 0 0 1-8 0v-1a10 10 0 0 1 20 0v1a4 4 0 0 1-8 0"/><path d="M4 12v-1a8 8 0 0 1 16 0v1"/><path d="M12 4v4"/><path d="M12 16v4"/><path d="M8 4l2 4"/><path d="M16 4l-2 4"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z"/><path d="M2.5 9h19"/><path d="M2.5 15h19"/></svg>
              )}
            </div>
            
            <h3 className="font-semibold text-text text-lg heading-thai mb-1">{room.name}</h3>
            <p className="text-sm font-prompt text-text-light mb-3">
              {room.type === 'air_con' ? 'ห้องแอร์เย็นสบาย' : 'ห้องพัดลม อากาศถ่ายเท'}
            </p>
            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-md text-gray-600">
              สำหรับ {room.capacity} ท่าน
            </span>
            
            {/* Selected Indicator */}
            {selectedRoom?.id === room.id && (
              <div className="absolute top-4 right-4 text-primary animate-bounce-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-start pt-6 border-t border-gray-100">
        <button onClick={prevStep} className="btn-outline font-prompt text-sm px-6 py-2 h-auto text-gray-500 border-gray-300 hover:bg-gray-50">
          ย้อนกลับ
        </button>
      </div>
    </div>
  )
}
