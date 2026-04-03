"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { Plus, Edit2, CheckCircle2, Wrench, Trash2 } from "lucide-react"

type Room = Database['public']['Tables']['rooms']['Row']

export function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [type, setType] = useState<'air_con' | 'non_air_con'>('air_con')
  const [capacity, setCapacity] = useState(1)
  const [status, setStatus] = useState<'active' | 'maintenance'>('active')

  const fetchRooms = async () => {
    setLoading(true)
    const { data } = await supabase.from('rooms').select('*').order('name')
    if (data) setRooms(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const handleSave = async () => {
    if (!name || capacity <= 0) return alert("กรุณากรอกข้อมูลห้องให้ถูกต้อง")
    
    setLoading(true)
    if (isEditing) {
      await supabase.from('rooms').update({ name, type, capacity, status }).eq('id', isEditing)
    } else {
      await supabase.from('rooms').insert([{ name, type, capacity, status }])
    }
    
    resetForm()
    await fetchRooms()
  }

  const handleEdit = (r: Room) => {
    setIsEditing(r.id)
    setName(r.name)
    setType(r.type)
    setCapacity(r.capacity)
    setStatus(r.status)
  }

  const resetForm = () => {
    setIsEditing(null)
    setName('')
    setType('air_con')
    setCapacity(1)
    setStatus('active')
  }

  const toggleStatus = async (id: string, currentStatus: 'active' | 'maintenance') => {
    const newStatus = currentStatus === 'active' ? 'maintenance' : 'active'
    await supabase.from('rooms').update({ status: newStatus }).eq('id', id)
    fetchRooms()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบห้อง "${name}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) return
    
    setLoading(true)
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) {
      alert("ไม่สามารถลบห้องได้: " + error.message)
      setLoading(false)
    } else {
      await fetchRooms()
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
        จัดการห้องนวด
      </h2>

      {/* Form */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <h3 className="font-semibold mb-3 text-sm">{isEditing ? 'แก้ไขห้องนวด' : 'เพิ่มห้องนวดใหม่'}</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">ชื่อห้อง</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
          </div>
          <div className="w-32">
            <label className="text-xs text-gray-500 mb-1 block">ประเภท</label>
            <select value={type} onChange={e => setType(e.target.value as 'air_con' | 'non_air_con')} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary">
              <option value="air_con">ห้องแอร์</option>
              <option value="non_air_con">ห้องพัดลม</option>
            </select>
          </div>
          <div className="w-24">
            <label className="text-xs text-gray-500 mb-1 block">ความจุ (คน)</label>
            <input type="number" min={1} value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
          </div>
          <div className="w-32">
            <label className="text-xs text-gray-500 mb-1 block">สถานะ</label>
            <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'maintenance')} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary">
              <option value="active">เปิดใช้งาน</option>
              <option value="maintenance">ปิดซ่อมบำรุง</option>
            </select>
          </div>
          
          <div className="flex gap-2 pb-0.5">
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
              <th className="p-3">ชื่อห้อง</th>
              <th className="p-3">ประเภท</th>
              <th className="p-3 text-center">ความจุ</th>
              <th className="p-3 text-center">สถานะ</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
            ) : rooms.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/50">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3 text-gray-500">{r.type === 'air_con' ? 'ห้องแอร์' : 'ห้องพัดลม'}</td>
                <td className="p-3 text-center text-gray-500">{r.capacity} ท่าน</td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleStatus(r.id, r.status)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors" style={{ backgroundColor: r.status === 'active' ? '#ecfdf5' : '#fffbeb', color: r.status === 'active' ? '#059669' : '#d97706' }}>
                    {r.status === 'active' ? <><CheckCircle2 className="w-3.5 h-3.5"/> ใช้งานปกติ</> : <><Wrench className="w-3.5 h-3.5"/> ปิดซ่อมบำรุง</>}
                  </button>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(r.id, r.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
