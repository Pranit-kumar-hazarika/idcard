-- Create the students table
create table public.students (
  id serial primary key,
  roll varchar(50) unique not null,
  name varchar(100),
  fathername varchar(100),
  course varchar(100),
  blood_group varchar(20),
  contact_number varchar(20),
  issue_date varchar(20),
  session varchar(50),
  photo_url text,
  signature_url text
);

-- Enable Row Level Security
alter table public.students enable row level security;

-- Allow anyone to insert (correct for Supabase/Postgres)
create policy "Allow insert for all" on public.students
for insert
with check (true);

-- Allow anyone to select
create policy "Allow select for all" on public.students
for select
using (true);

-- Allow anyone to update
create policy "Allow update for all" on public.students
for update
using (true);

-- Allow anyone to delete
create policy "Allow delete for all" on public.students
for delete
using (true);
