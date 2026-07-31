-- One-time migration for a real, race-free Education Hub article view counter.
-- Run this once in the Supabase project's SQL Editor (Dashboard -> SQL Editor -> New
-- query -> paste this -> Run). No app deploy or restart needed afterwards — the
-- next article view will automatically start using this instead of the old
-- read-then-write JSON counter (see lib/educationArticles.ts).

create table if not exists article_view_counts (
  slug text primary key,
  views integer not null default 0
);

create or replace function increment_article_view(p_slug text)
returns integer
language plpgsql
security definer
as $$
declare
  new_count integer;
begin
  insert into article_view_counts (slug, views)
  values (p_slug, 1)
  on conflict (slug) do update set views = article_view_counts.views + 1
  returning views into new_count;
  return new_count;
end;
$$;

-- Lets the app's server-side service-role key call this function.
grant execute on function increment_article_view(text) to service_role;
grant select on article_view_counts to service_role;
