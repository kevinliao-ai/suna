-- Supabase's automatic-RLS option can install this SECURITY DEFINER helper in
-- the exposed public schema. It is an internal DDL helper and must not be
-- callable through the client API.
--
-- The guard keeps this migration safe for projects where the helper does not
-- exist (including projects that do not enable automatic RLS).

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute
      'revoke execute on function public.rls_auto_enable() '
      'from public, anon, authenticated';
  end if;
end
$$;
