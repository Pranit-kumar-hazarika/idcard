create policy "Allow upload for all" on storage.objects
for insert
with check (bucket_id = 'students');

create policy "Allow read for all" on storage.objects
for select
using (bucket_id = 'students');
