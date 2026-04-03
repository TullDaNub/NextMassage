-- Run this to allow anon insert for the initial seed.
create policy "Allow anon insert to services" on public.services for insert with check (true);
create policy "Allow anon insert to rooms" on public.rooms for insert with check (true);
create policy "Allow anon insert to masseuses" on public.masseuses for insert with check (true);
create policy "Allow anon insert to masseuse_services" on public.masseuse_services for insert with check (true);
create policy "Allow public read to masseuse_services" on public.masseuse_services for select using (true);
