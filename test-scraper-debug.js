const { scrapeJobData } = require('./app/lib/scraper.ts');

async function testScraper() {
  console.log('🚀 Starting scraper test...\n');
  
  const url = 'https://tanmia.ma/category/offres-demploi/';
  console.log(`Testing URL: ${url}\n`);
  
  try {
    const result = await scrapeJobData(url);
    
    console.log('\n📊 FINAL RESULT:');
    console.log('================');
    
    if (result) {
      if ('jobs' in result) {
        console.log(`✅ Found ${result.jobs.length} jobs`);
        console.log(`📋 Summary:`, result.summary);
        console.log('\n🔍 Jobs found:');
        result.jobs.forEach((job, index) => {
          console.log(`${index + 1}. ${job.title} - ${job.company}`);
        });
      } else {
        console.log('✅ Single job found:', result.title);
      }
    } else {
      console.log('❌ No results returned');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testScraper(); 