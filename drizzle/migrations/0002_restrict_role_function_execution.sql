REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.assign_socvet_owner() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_socvet_owner() TO service_role;