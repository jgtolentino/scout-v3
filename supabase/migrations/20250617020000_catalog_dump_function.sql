-- Function to dump the current database catalog state
CREATE OR REPLACE FUNCTION supabase_catalog_dump()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH roles AS (
        SELECT array_agg(rolname) as roles
        FROM pg_roles
        WHERE rolname NOT LIKE 'pg_%'
    ),
    tables AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'name', t.table_name,
                'columns', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'name', c.column_name,
                            'type', c.data_type,
                            'is_nullable', c.is_nullable = 'YES',
                            'default', c.column_default,
                            'is_primary_key', EXISTS (
                                SELECT 1
                                FROM information_schema.table_constraints tc
                                JOIN information_schema.constraint_column_usage ccu
                                    ON tc.constraint_name = ccu.constraint_name
                                WHERE tc.constraint_type = 'PRIMARY KEY'
                                    AND tc.table_name = t.table_name
                                    AND ccu.column_name = c.column_name
                            )
                        )
                    )
                    FROM information_schema.columns c
                    WHERE c.table_name = t.table_name
                    AND c.table_schema = 'public'
                ),
                'rls_enabled', EXISTS (
                    SELECT 1
                    FROM pg_tables
                    WHERE tablename = t.table_name
                    AND rowsecurity = true
                ),
                'policies', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'name', p.policyname,
                            'operation', p.cmd,
                            'using', p.qual,
                            'with_check', p.with_check
                        )
                    )
                    FROM pg_policies p
                    WHERE p.tablename = t.table_name
                    AND p.schemaname = 'public'
                )
            )
        ) as tables
        FROM information_schema.tables t
        WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
    ),
    views AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'name', v.viewname,
                'definition', v.definition,
                'rls_enabled', EXISTS (
                    SELECT 1
                    FROM pg_views
                    WHERE viewname = v.viewname
                    AND schemaname = 'public'
                ),
                'policies', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'name', p.policyname,
                            'operation', p.cmd,
                            'using', p.qual,
                            'with_check', p.with_check
                        )
                    )
                    FROM pg_policies p
                    WHERE p.tablename = v.viewname
                    AND p.schemaname = 'public'
                )
            )
        ) as views
        FROM pg_views v
        WHERE v.schemaname = 'public'
    ),
    functions AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'name', p.proname,
                'parameters', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'name', pa.parameter_name,
                            'type', pa.data_type,
                            'default', pa.parameter_default
                        )
                    )
                    FROM information_schema.parameters pa
                    WHERE pa.specific_name = p.proname
                ),
                'returns', pg_get_function_result(p.oid),
                'language', p.prolang::regproc::text,
                'security', CASE WHEN p.prosecdef THEN 'definer' ELSE 'invoker' END
            )
        ) as functions
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    )
    SELECT jsonb_build_object(
        'roles', (SELECT roles FROM roles),
        'tables', (SELECT tables FROM tables),
        'views', (SELECT views FROM views),
        'functions', (SELECT functions FROM functions)
    ) INTO result;

    RETURN result;
END;
$$; 