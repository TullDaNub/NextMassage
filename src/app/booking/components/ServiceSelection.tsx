"use client"

import { useEffect, useState } from "react"
import { useBookingStore } from "@/store/booking"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"

type Service = Database['public']['Tables']['services']['Row']

export function ServiceSelection() {
  const { selectedService, setSelectedService } = useBookingStore()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })
      
      if (!error && data) {
        setServices(data)
      }
      setLoading(false)
    }
    loadServices()
  }, [])

  if (loading) {
    return <div className="flex h-64 items-center justify-center animate-pulse text-primary font-prompt">กำลังโหลดข้อมูลบริการ...</div>
  }
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text heading-thai mb-2">1. เลือกบริการนวด</h2>
        <p className="text-text-light font-prompt text-sm">เลือกระยะเวลาและประเภทการนวดที่คุณต้องการ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service)}
            className={`relative flex flex-col p-5 rounded-2xl border-2 text-left transition-all duration-200 group
              ${selectedService?.id === service.id 
                ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                : 'border-transparent bg-white shadow-sm hover:border-primary/30 hover:shadow-md'
              }`}
          >
            <div className="flex justify-between items-start mb-2 w-full">
              <span className="font-semibold text-text text-lg heading-thai group-hover:text-primary transition-colors">
                {service.name}
              </span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {service.duration_minutes} นาที
              </span>
            </div>
            
            <div className="mt-auto flex justify-between items-end w-full">
              {service.description ? (
                <p className="text-sm text-text-light font-prompt max-w-[70%]">{service.description}</p>
              ) : <div/>}
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">฿{service.price}</span>
              </div>
            </div>
            
            {/* Selected Indicator */}
            {selectedService?.id === service.id && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg animate-bounce-in">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
