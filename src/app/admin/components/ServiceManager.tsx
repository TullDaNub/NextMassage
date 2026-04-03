"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { Plus, Edit2, CheckCircle2, XCircle } from "lucide-react"

type Service = Database['public']['Tables']['services']['Row']

export function ServiceManager() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(60)
  const [price, setPrice] = useState(500)
  const [isActive, setIsActive] = useState(true)

  const fetchServices = async () => {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('name')
    if (data) setServices(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleSave = async () => {
    if (!name || duration <= 0 || price < 0) return alert("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง")
    
    setLoading(true)
    if (isEditing) {
      await supabase.from('services').update({ name, duration_minutes: duration, price, is_active: isActive }).eq('id', isEditing)
    } else {
      await supabase.from('services').insert([{ name, duration_minutes: duration, price, is_active: isActive }])
    }
    
    resetForm()
    await fetchServices()
  }

  const handleEdit = (s: Service) => {
    setIsEditing(s.id)
    setName(s.name)
    setDuration(s.duration_minutes)
    setPrice(s.price)
    setIsActive(s.is_active)
  }

  const resetForm = () => {
    setIsEditing(null)
    setName('')
    setDuration(60)
    setPrice(500)
    setIsActive(true)
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('services').update({ is_active: !currentStatus }).eq('id', id)
    fetchServices()
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
        จัดการบริการนวดและราคา
      </h2>

      {/* Form */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <h3 className="font-semibold mb-3 text-sm">{isEditing ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">ชื่อบริการ</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
          </div>
          <div className="w-24">
            <label className="text-xs text-gray-500 mb-1 block">เวลา (นาที)</label>
            <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
          </div>
          <div className="w-32">
            <label className="text-xs text-gray-500 mb-1 block">ราคา (บาท)</label>
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 py-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> เปิดให้บริการ
          </label>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1">
              <Plus className="w-4 h-4"/> {isEditing ? 'บันทึก' : 'เพิ่ม'}
            </button>
            {isEditing && (
              <button onClick={resetForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
                ยกเลิก
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3">ชื่อบริการ</th>
              <th className="p-3 text-center">ระยะเวลา (นาที)</th>
              <th className="p-3 text-right">ราคา (฿)</th>
              <th className="p-3 text-center">สถานะ</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
            ) : services.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/50">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 text-center text-gray-500">{s.duration_minutes}</td>
                <td className="p-3 text-right font-semibold text-primary">{s.price.toLocaleString()}</td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleStatus(s.id, s.is_active)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors" style={{ backgroundColor: s.is_active ? '#ecfdf5' : '#fef2f2', color: s.is_active ? '#059669' : '#dc2626' }}>
                    {s.is_active ? <><CheckCircle2 className="w-3.5 h-3.5"/> เปิดบริการ</> : <><XCircle className="w-3.5 h-3.5"/> ปิดให้บริการ</>}
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
