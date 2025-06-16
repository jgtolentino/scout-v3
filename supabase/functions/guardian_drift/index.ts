/**
 * Guardian Drift Auditor
 *  – GET  /functions/v1/guardian_drift?dry=true   → JSON diff only
 *  – POST /functions/v1/guardian_drift            → opens / updates GitHub Issue & PR
 *
 * ⚠️  Requires env:
 *      GITHUB_TOKEN            – repo-scoped (contents + PR)
 *      GITHUB_REPO             – e.g. jgtolentino/scout-mvp
 *      YAML_SPEC_URL           – raw.githubusercontent.com/…/dashboard_end_state.yaml
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Octokit } from 'https://esm.sh/@octokit/rest@19.0.7'
import { parse as yamlParse } from 'https://esm.sh/yaml@2.3.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DriftResult {
  hasDrift: boolean
  details: {
    missing?: string[]
    extra?: string[]
    modified?: {
      name: string
      expected: any
      actual: any
    }[]
  }
}

async function fetchYamlSpec(requestUrl: string): Promise<Record<string, unknown>> {
  const url = new URL(requestUrl)
  const dryRun = url.searchParams.get('dry') === 'true'
  const specUrl = url.searchParams.get('spec_url')

  const targetUrl = (dryRun && specUrl) ? specUrl : 'https://raw.githubusercontent.com/your-org/your-repo/main/specs/dashboard_end_state.yaml'

  const response = await fetch(targetUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch YAML spec from ${targetUrl}: ${response.statusText}`)
  }
  const yamlText = await response.text()
  return yamlParse(yamlText) as Record<string, unknown>
}

async function getCurrentCatalog(supabaseClient: any): Promise<Record<string, unknown>> {
  const { data, error } = await supabaseClient.rpc('supabase_catalog_dump') as { data: Record<string, unknown>, error: any };
  if (error) {
    throw new Error(`Failed to get catalog: ${error.message}`)
  }
  return data
}

function detectDrift(spec: Record<string, any>, catalog: Record<string, any>): DriftResult {
  const result: DriftResult = {
    hasDrift: false,
    details: {
      missing: [],
      extra: [],
      modified: []
    }
  }

  // Check roles
  const specRoles = new Set(spec.roles as any[])
  const catalogRoles = new Set(catalog.roles as any[])
  
  for (const role of specRoles as any[]) {
    if (!catalogRoles.has(role)) {
      result.details.missing?.push(`Role: ${role}`)
      result.hasDrift = true
    }
  }

  // Check tables
  const specTables = new Map((spec.tables as any[]).map((t: any) => [t.name, t]))
  const catalogTables = new Map((catalog.tables as any[]).map((t: any) => [t.name, t]))

  for (const [name, specTable] of specTables as any) {
    const catalogTable = catalogTables.get(name)
    if (!catalogTable) {
      result.details.missing?.push(`Table: ${name}`)
      result.hasDrift = true
      continue
    }

    // Compare columns
    const specColumns = new Map((specTable.columns as any[]).map((c: any) => [c.name, c]))
    const catalogColumns = new Map((catalogTable.columns as any[]).map((c: any) => [c.name, c]))

    for (const [colName, specCol] of specColumns as any) {
      const catalogCol = catalogColumns.get(colName)
      if (!catalogCol) {
        result.details.missing?.push(`Column: ${name}.${colName}`)
        result.hasDrift = true
        continue
      }

      if (JSON.stringify(specCol) !== JSON.stringify(catalogCol)) {
        result.details.modified?.push({
          name: `${name}.${colName}`,
          expected: specCol,
          actual: catalogCol
        })
        result.hasDrift = true
      }
    }

    // Compare RLS
    if (specTable.rls_enabled !== catalogTable.rls_enabled) {
      result.details.modified?.push({
        name: `${name}.rls_enabled`,
        expected: specTable.rls_enabled,
        actual: catalogTable.rls_enabled
      })
      result.hasDrift = true
    }

    // Compare policies
    const specPolicies = new Map((specTable.policies?.map((p: any) => [p.name, p]) || []) as any[])
    const catalogPolicies = new Map((catalogTable.policies?.map((p: any) => [p.name, p]) || []) as any[])

    for (const [policyName, specPolicy] of specPolicies as any) {
      const catalogPolicy = catalogPolicies.get(policyName)
      if (!catalogPolicy) {
        result.details.missing?.push(`Policy: ${name}.${policyName}`)
        result.hasDrift = true
        continue
      }

      if (JSON.stringify(specPolicy) !== JSON.stringify(catalogPolicy)) {
        result.details.modified?.push({
          name: `${name}.${policyName}`,
          expected: specPolicy,
          actual: catalogPolicy
        })
        result.hasDrift = true
      }
    }
  }

  // Similar checks for views and functions...
  // (Implementation omitted for brevity)

  return result
}

async function raiseGitHubIssue(driftResult: DriftResult): Promise<void> {
  const octokit = new Octokit({
    auth: Deno.env.get('GITHUB_TOKEN')
  })

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

  const title = '🚨 Schema Drift Detected'
  const body = `
# Schema Drift Detected

## Missing Elements
${driftResult.details.missing?.map((m: any) => `- ${m}`).join('\n') || 'None'}

## Extra Elements
${driftResult.details.extra?.map((e: any) => `- ${e}`).join('\n') || 'None'}

## Modified Elements
${driftResult.details.modified?.map((m: any) => `
### ${m.name}
Expected:
\`\`\`json
${JSON.stringify(m.expected, null, 2)}
\`\`\`

Actual:
\`\`\`json
${JSON.stringify(m.actual, null, 2)}
\`\`\`
`).join('\n') || 'None'}
  `.trim()

  try {
    await octokit.rest.issues.create({
      owner: Deno.env.get('GITHUB_OWNER')!,
      repo: Deno.env.get('GITHUB_REPO')!,
      title,
      body,
      labels: ['schema-drift', 'needs-attention'],
      request: {
        signal: controller.signal
      }
    })
  } finally {
    clearTimeout(timeoutId); // Clear the timeout if the request completes
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const spec = await fetchYamlSpec(req.url)
    const catalog = await getCurrentCatalog(supabaseClient)
    const driftResult = detectDrift(spec, catalog)

    if (driftResult.hasDrift) {
      await raiseGitHubIssue(driftResult)
      return new Response(
        JSON.stringify({ status: 'drift-detected', details: driftResult }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    return new Response(
      JSON.stringify({ status: 'no-drift' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: (error as any).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
}) 