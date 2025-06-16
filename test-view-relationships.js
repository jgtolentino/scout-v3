// Test if view relationships are working in production
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jrxepdlkgdwwjxdeetmb.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzNTkzNTQsImV4cCI6MjAzMzkzNTM1NH0.h0_z4a6jvWLe7KbWKXWj4-2-xTTfUDGYKRMOhPXKBvA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testViewRelationships() {
  console.log('🔍 Testing view relationships...')
  
  try {
    // Test 1: Simple transactions_fmcg view
    console.log('\n1. Testing transactions_fmcg view:')
    const { data: transactions, error: txError } = await supabase
      .from('transactions_fmcg')
      .select('id, total_amount')
      .limit(5)
    
    if (txError) {
      console.error('❌ transactions_fmcg error:', txError.message)
    } else {
      console.log('✅ transactions_fmcg works:', transactions?.length, 'records')
    }

    // Test 2: Simple transaction_items_fmcg view
    console.log('\n2. Testing transaction_items_fmcg view:')
    const { data: items, error: itemError } = await supabase
      .from('transaction_items_fmcg')
      .select('id, transaction_id, quantity')
      .limit(5)
    
    if (itemError) {
      console.error('❌ transaction_items_fmcg error:', itemError.message)
    } else {
      console.log('✅ transaction_items_fmcg works:', items?.length, 'records')
    }

    // Test 3: Nested relationship query (the critical test)
    console.log('\n3. Testing nested relationship query:')
    const { data: nested, error: nestedError } = await supabase
      .from('transactions_fmcg')
      .select(`
        id, 
        total_amount,
        transaction_items_fmcg(
          id,
          quantity,
          unit_price
        )
      `)
      .limit(3)
    
    if (nestedError) {
      console.error('❌ Nested query error:', nestedError.message)
      console.error('   This means the FK relationships are not properly set up')
    } else {
      console.log('✅ Nested relationship query works!')
      console.log('   Sample data:', JSON.stringify(nested?.[0], null, 2))
    }

    // Test 4: KPI-style aggregation query
    console.log('\n4. Testing KPI aggregation:')
    const { data: kpi, error: kpiError } = await supabase
      .from('transactions_fmcg')
      .select('total_amount')
    
    if (kpiError) {
      console.error('❌ KPI query error:', kpiError.message)
    } else {
      const totalRevenue = kpi?.reduce((sum, tx) => sum + tx.total_amount, 0) || 0
      const transactionCount = kpi?.length || 0
      console.log('✅ KPI calculation works:')
      console.log(`   Total Revenue: ₱${totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`)
      console.log(`   Transaction Count: ${transactionCount.toLocaleString()}`)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testViewRelationships()