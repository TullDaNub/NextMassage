import { createClient } from '@supabase/supabase-js'

// You must run this using ts-node or run it via an API route
// This is a one-time setup script to populate the initial data

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seed() {
  console.log('Seeding data...')

  // 1. SERVICES
  const services = [
    { name: 'นวดเท้า', duration_minutes: 60, price: 300, category: 'FOOT' },
    { name: 'นวดเท้า', duration_minutes: 120, price: 500, category: 'FOOT' },
    { name: 'นวดไทย', duration_minutes: 60, price: 300, category: 'THAI' },
    { name: 'นวดไทย', duration_minutes: 120, price: 500, category: 'THAI' },
    { name: 'นวดคอ / บ่า / ไหล่', duration_minutes: 60, price: 400, category: 'THAI' },
    { name: 'นวดคอ / บ่า / ไหล่', duration_minutes: 120, price: 700, category: 'THAI' },
    { name: 'นวดไทย / รีดเส้น', duration_minutes: 60, price: 450, category: 'THAI_ADVANCED' },
    { name: 'นวดไทย / รีดเส้น', duration_minutes: 120, price: 800, category: 'THAI_ADVANCED' },
    { name: 'นวดประคบสมุนไพร + ออย', duration_minutes: 60, price: 500, category: 'OIL' },
    { name: 'นวดอโรม่า', duration_minutes: 60, price: 500, category: 'OIL' },
    { name: 'นวดอโรม่า', duration_minutes: 120, price: 900, category: 'OIL' },
    { name: 'นวดฮอตออยล์', duration_minutes: 60, price: 600, category: 'OIL' },
    { name: 'สครับผิว + บำรุง (ครีมอโรม่า)', duration_minutes: 60, price: 600, category: 'SPA' },
    { name: 'สครับผิว + บำรุง (ครีมอโรม่า)', duration_minutes: 120, price: 1000, category: 'SPA' },
    { name: 'อบสมุนไพร', duration_minutes: 30, price: 180, category: 'SPA' },
  ]

  const { data: insertedServices, error: serviceError } = await supabase
    .from('services')
    .insert(services)
    .select()

  if (serviceError) {
    console.error('Error inserting services:', serviceError)
    return
  }
  console.log(`Inserted ${insertedServices.length} services`)

  // 2. ROOMS
  const rooms = [
    { name: 'ห้อง 101', type: 'air_con', capacity: 1 },
    { name: 'ห้อง 102', type: 'air_con', capacity: 1 },
    { name: 'ห้อง 103', type: 'air_con', capacity: 2 },
    { name: 'ห้อง 201', type: 'non_air_con', capacity: 1 },
    { name: 'ห้อง 202', type: 'non_air_con', capacity: 1 },
  ]

  const { data: insertedRooms, error: roomError } = await supabase
    .from('rooms')
    .insert(rooms)
    .select()

  if (roomError) {
    console.error('Error inserting rooms:', roomError)
    return
  }
  console.log(`Inserted ${insertedRooms.length} rooms`)

  // 3. MASSEUSES
  const masseuses = [
    { name: 'หมอเอ', nickname: 'A', status: 'available', is_active: true },
    { name: 'หมอบี', nickname: 'B', status: 'available', is_active: true },
    { name: 'หมอซี', nickname: 'C', status: 'available', is_active: true },
    { name: 'หมอดี', nickname: 'D', status: 'off_duty', is_active: true },
  ]

  const { data: insertedMasseuses, error: masseuseError } = await supabase
    .from('masseuses')
    .insert(masseuses)
    .select()

  if (masseuseError) {
    console.error('Error inserting masseuses:', masseuseError)
    return
  }
  console.log(`Inserted ${insertedMasseuses.length} masseuses`)

  // 4. MAP MASSEUSES TO SERVICES (Randomly assign for seed)
  const masseuseServices = []
  for (const m of insertedMasseuses) {
    // Every masseuse can do first 4 services (basic)
    masseuseServices.push({ masseuse_id: m.id, service_id: insertedServices[0].id })
    masseuseServices.push({ masseuse_id: m.id, service_id: insertedServices[1].id })
    masseuseServices.push({ masseuse_id: m.id, service_id: insertedServices[2].id })
    masseuseServices.push({ masseuse_id: m.id, service_id: insertedServices[3].id })
    
    // Randomly assign some advanced ones
    if (Math.random() > 0.5) {
      masseuseServices.push({ masseuse_id: m.id, service_id: insertedServices[4].id }) // คอ บ่า ไหล่
    }
  }

  const { error: mappingError } = await supabase
    .from('masseuse_services')
    .insert(masseuseServices)

  if (mappingError) {
    console.error('Error mapping masseuses to services:', mappingError)
    return
  }
  console.log('Mapped masseuses to services')

  console.log('Seeding completed successfully!')
}

seed()
