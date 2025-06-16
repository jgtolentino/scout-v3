const puppeteer = require('puppeteer');

async function verifyDeployment() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 Verifying Scout Analytics deployment...\n');
  
  try {
    // Check main page
    await page.goto('https://scout-mvp.vercel.app', { waitUntil: 'networkidle2' });
    const title = await page.title();
    console.log('✅ Page title:', title);
    
    // Check for KPI data
    await page.waitForSelector('.text-2xl', { timeout: 5000 });
    const revenue = await page.$eval('.text-2xl', el => el.textContent);
    console.log('✅ Revenue displayed:', revenue);
    
    // Navigate to Learn page
    await page.goto('https://scout-mvp.vercel.app/learn', { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1', { timeout: 5000 });
    const learnTitle = await page.$eval('h1', el => el.textContent);
    console.log('✅ Learn page title:', learnTitle);
    
    // Check for LearnBot content
    const learnBotContent = await page.$$eval('p', elements => 
      elements.find(el => el.textContent.includes('5,000-transaction FMCG dataset'))
    );
    console.log('✅ LearnBot content:', learnBotContent ? 'Found' : 'Not found');
    
    console.log('\n🎉 Deployment verification complete!');
    console.log('📊 Dashboard URL: https://scout-mvp.vercel.app');
    console.log('🎓 Learn URL: https://scout-mvp.vercel.app/learn');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  verifyDeployment();
}

module.exports = { verifyDeployment };