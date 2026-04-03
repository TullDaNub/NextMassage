-- Script to grant full access to admin tables for anon
-- Run this in Supabase SQL Editor if you encounter RLS errors

-- Allow all operations for anon (for MVP purposes)
create policy "Allow anon ALL to services" on public.services for all using (true) with check (true);
create policy "Allow anon ALL to masseuses" on public.masseuses for all using (true) with check (true);
create policy "Allow anon ALL to rooms" on public.rooms for all using (true) with check (true);
