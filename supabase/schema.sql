-- Association Massar : à coller dans Supabase > SQL Editor > Run
create table levels(id serial primary key, slug text unique not null, name text not null, cycle text not null, position int default 0);
create table subjects(id serial primary key, name text unique not null, icon text default '📘');
create table level_subjects(level_id int references levels on delete cascade, subject_id int references subjects on delete cascade, primary key(level_id,subject_id));
create table chapters(id serial primary key, level_id int references levels on delete cascade, subject_id int references subjects on delete cascade, title text not null, position int default 0);
create table resources(id serial primary key, level_id int references levels on delete cascade, subject_id int references subjects on delete cascade, chapter_id int references chapters on delete set null, type text not null, title text not null, description text, file_url text, is_premium boolean default false, created_at timestamptz default now());
create table ads(slot text primary key, label text, enabled boolean default false, code text default '');
create table admins(user_id uuid primary key references auth.users on delete cascade);
alter table admins enable row level security;
create function is_admin() returns boolean language sql security definer stable as $$ select exists(select 1 from public.admins where user_id=auth.uid()) $$;
create policy "voir son statut" on admins for select using (user_id=auth.uid());
do $$ declare t text; begin foreach t in array array['levels','subjects','level_subjects','chapters','resources','ads'] loop
  execute format('alter table %I enable row level security',t);
  execute format('create policy "lecture publique" on %I for select using (true)',t);
  execute format('create policy "admin seulement" on %I for all using (is_admin()) with check (is_admin())',t);
end loop; end $$;
insert into storage.buckets(id,name,public) values('files','files',true) on conflict do nothing;
create policy "fichiers lecture" on storage.objects for select using (bucket_id='files');
create policy "fichiers admin" on storage.objects for all using (bucket_id='files' and is_admin()) with check (bucket_id='files' and is_admin());
insert into levels(slug,name,cycle,position) values
('cp','CP','Primaire',1),('ce1','CE1','Primaire',2),('ce2','CE2','Primaire',3),('ce3','CE3','Primaire',4),('ce4','CE4','Primaire',5),('ce5','CE5','Primaire',6),('ce6','CE6','Primaire',7),
('1ac','1AC','Collège',8),('2ac','2AC','Collège',9),('3ac','3AC','Collège',10),
('tronc-commun','Tronc Commun','Lycée',11),('1ere-bac','1ère Bac','Lycée',12),('2eme-bac','2ème Bac','Lycée',13);
insert into subjects(name,icon) values ('Mathématiques','➗'),('Français','📖'),('Arabe','✍️'),('Éducation Islamique','🕌'),('Activités scientifiques','🔬'),('Histoire-Géographie','🌍'),('Anglais','🇬🇧'),('SVT','🌱'),('Physique-Chimie','⚗️'),('Informatique','💻'),('Philosophie','💭');
insert into level_subjects select l.id,s.id from levels l join subjects s on
 (l.cycle='Primaire' and s.name in ('Mathématiques','Français','Arabe','Éducation Islamique','Activités scientifiques'))
 or (l.cycle='Collège' and s.name in ('Mathématiques','Français','Arabe','Éducation Islamique','Histoire-Géographie','Anglais','SVT','Physique-Chimie','Informatique'))
 or (l.cycle='Lycée' and s.name in ('Mathématiques','Français','Arabe','Éducation Islamique','Histoire-Géographie','Anglais','SVT','Physique-Chimie','Informatique','Philosophie'));
insert into ads(slot,label) values ('accueil','Bannière page d’accueil'),('sidebar','Publicité dans la sidebar'),('entre','Publicité entre les ressources');
-- ÉTAPE ADMIN (après avoir créé votre utilisateur dans Authentication > Users), remplacez l'email puis lancez :
-- insert into admins(user_id) select id from auth.users where email='VOTRE-EMAIL';
