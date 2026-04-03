-- 1. In Supabase SQL Editor, run this to enable realtime for 'masseuses' table
alter publication supabase_realtime add table masseuses;

-- 2. Create policy to allow updating masseuses status (Receptionist action)
create policy "Allow anon update to masseuses" on public.masseuses for update using (true);
