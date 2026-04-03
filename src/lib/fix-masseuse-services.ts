import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fix() {
  console.log('Fetching masseuses and services...')
  const { data: masseuses } = await supabase.from('masseuses').select('id')
  const { data: services } = await supabase.from('services').select('id')
  
  if (!masseuses || !services) {
    console.error('Failed to fetch data')
    return
  }
  
  const mappings = []
  for (const m of masseuses) {
    for (const s of services) {
      mappings.push({ masseuse_id: m.id, service_id: s.id })
    }
  }
  
  console.log(`Inserting ${mappings.length} mappings... (ignoring duplicates)`)
  const { error } = await supabase
    .from('masseuse_services')
    .upsert(mappings, { onConflict: 'masseuse_id,service_id' })
    
  if (error) {
    console.error('Error inserting mappings:', error)
  } else {
    console.log('✅ Successfully mapped ALL masseuses to ALL services!')
  }
}

fix()
