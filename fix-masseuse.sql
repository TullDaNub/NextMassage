-- สคริปต์นี้จะจัดการให้ "พนักงานทุกคน" สามารถรับงาน "บริการทุกประเภท" ได้
-- เพื่อป้องกันปัญหาลูกค้ากดเลือกบริการแล้วไม่พบพนักงาน

insert into public.masseuse_services (masseuse_id, service_id)
select m.id, s.id
from public.masseuses m
cross join public.services s
on conflict (masseuse_id, service_id) do nothing;
