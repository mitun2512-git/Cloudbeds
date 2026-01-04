const fs = require('fs');
const path = require('path');

// Load both batches
const batch1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/competitor-rates.json'), 'utf8'));
const batch2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/competitor-rates-batch2.json'), 'utf8'));

// Merge results
const allResults = [...batch1.results, ...batch2.results];

// Generate combined summary
const propertyGroups = {};
allResults.forEach(r => {
  if (!propertyGroups[r.propertyId]) propertyGroups[r.propertyId] = [];
  propertyGroups[r.propertyId].push(r);
});

const summary = {};
Object.keys(propertyGroups).forEach(id => {
  const items = propertyGroups[id];
  const avgRate = items.reduce((sum, r) => sum + r.lowestRate, 0) / items.length;
  summary[id] = {
    name: items[0].propertyName,
    totalDataPoints: items.length,
    averageRate: avgRate.toFixed(2),
    minRate: Math.min(...items.map(r => r.lowestRate)),
    maxRate: Math.max(...items.map(r => r.lowestRate)),
    directScraped: items.filter(r => r.source === 'direct').length,
    estimated: items.filter(r => r.source === 'estimated').length,
  };
});

const finalOutput = {
  scrapedAt: new Date().toISOString(),
  totalDataPoints: allResults.length,
  summary,
  results: allResults
};

fs.writeFileSync(
  path.join(__dirname, '../data/competitor-rates-final.json'),
  JSON.stringify(finalOutput, null, 2)
);

console.log('\n=== FINAL SCRAPING SUMMARY ===\n');
console.log(`Total Data Points: ${allResults.length}\n`);
Object.values(summary).forEach(s => {
  console.log(`${s.name}:`);
  console.log(`  Data Points: ${s.totalDataPoints}`);
  console.log(`  Avg Rate: $${s.averageRate}`);
  console.log(`  Range: $${s.minRate} - $${s.maxRate}`);
  console.log(`  Direct: ${s.directScraped}, Estimated: ${s.estimated}`);
  console.log('');
});
