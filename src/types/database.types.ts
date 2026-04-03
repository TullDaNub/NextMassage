export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          created_at?: string
        }
      }
      masseuses: {
        Row: {
          id: string
          name: string
          nickname: string | null
          photo_url: string | null
          status: 'available' | 'queued' | 'in_session' | 'break' | 'off_duty'
          session_started_at: string | null
          current_service_duration_min: number | null
          working_schedule: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          nickname?: string | null
          photo_url?: string | null
          status?: 'available' | 'queued' | 'in_session' | 'break' | 'off_duty'
          session_started_at?: string | null
          current_service_duration_min?: number | null
          working_schedule?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          photo_url?: string | null
          status?: 'available' | 'queued' | 'in_session' | 'break' | 'off_duty'
          session_started_at?: string | null
          current_service_duration_min?: number | null
          working_schedule?: Json | null
          is_active?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          duration_minutes: number
          price: number
          category: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration_minutes: number
          price: number
          category?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          price?: number
          category?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          type: 'air_con' | 'non_air_con'
          capacity: number
          status: 'active' | 'maintenance'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: 'air_con' | 'non_air_con'
          capacity?: number
          status?: 'active' | 'maintenance'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'air_con' | 'non_air_con'
          capacity?: number
          status?: 'active' | 'maintenance'
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          booking_code: string
          customer_id: string | null
          masseuse_id: string | null
          service_id: string | null
          room_id: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          total_price: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_code: string
          customer_id?: string | null
          masseuse_id?: string | null
          service_id?: string | null
          room_id?: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status?: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          total_price: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_code?: string
          customer_id?: string | null
          masseuse_id?: string | null
          service_id?: string | null
          room_id?: string | null
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          total_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
