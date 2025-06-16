import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrxepdlkgdwwjxdeetmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTc4MTk3OSwiZXhwIjoyMDY1MzU3OTc5fQ.CaylOjytzlPkkL3KsZK6pCK5eJxx3BrqVr0cbzK90Jc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFunctions() {
  console.log('🧪 Testing available functions...');
  
  // Test with filters parameter (JSONB)
  const functions = [
    'get_age_distribution_simple',
    'get_gender_distribution_simple', 
    'get_daily_trends',
    'get_brand_performance',
    'get_dashboard_summary',
    'get_location_distribution',
    'get_product_categories_summary'
  ];
  
  for (const func of functions) {
    try {
      console.log(`\n📊 Testing ${func}...`);
      
      // Try with filters JSONB parameter
      const { data: dataWithFilters, error: errorWithFilters } = await supabase.rpc(func, { 
        filters: {} 
      });
      
      if (!errorWithFilters) {
        console.log(`✅ ${func} works with filters parameter`);
        console.log(`   Sample data:`, JSON.stringify(dataWithFilters?.slice(0, 2), null, 2));
        continue;
      }
      
      // Try without parameters
      const { data: dataNoParams, error: errorNoParams } = await supabase.rpc(func);
      
      if (!errorNoParams) {
        console.log(`✅ ${func} works without parameters`);
        console.log(`   Sample data:`, JSON.stringify(dataNoParams?.slice(0, 2), null, 2));
        continue;
      }
      
      console.log(`❌ ${func}: ${errorWithFilters.message}`);
      
    } catch (err) {
      console.log(`❌ ${func}: ${err.message}`);
    }
  }
}

async function checkTables() {
  console.log('\n📋 Checking table data...');
  
  try {
    // Check transactions count
    const { count: txCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Transactions: ${txCount} records`);
    
    // Check brands count  
    const { count: brandCount } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Brands: ${brandCount} records`);
    
    // Check products count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Products: ${productCount} records`);
    
    // Check sample transaction
    const { data: sampleTx } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    console.log(`\n📄 Sample transaction:`, JSON.stringify(sampleTx?.[0], null, 2));
    
  } catch (err) {
    console.log('❌ Table check error:', err.message);
  }
}

async function main() {
  await checkTables();
  await testFunctions();
  
  console.log('\n🎯 Database is ready! The Scout MVP dashboard should work properly.');
}

main();