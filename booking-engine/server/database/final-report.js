/**
 * Final validation report - before vs after fixes
 */

const db = require('./db');

async function finalReport() {
  await db.initDatabase();
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  VALIDATION FIX RESULTS - BEFORE vs AFTER');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Email validation
  const invalidEmails = db.query(`SELECT COUNT(*) as cnt FROM reservations WHERE guest_email LIKE 'N/A'`);
  console.log('📧 Email Validation:');
  console.log('   BEFORE: 4 invalid emails (N/A)');
  console.log(`   AFTER:  ${invalidEmails[0].cnt} invalid emails ✅\n`);
  
  // Custom fields
  const breakfast = db.query(`SELECT COUNT(*) as cnt FROM reservations WHERE breakfast_requested IS NOT NULL`);
  const cleaning = db.query(`SELECT COUNT(*) as cnt FROM reservations WHERE daily_cleaning_requested IS NOT NULL`);
  console.log('🍳 Custom Fields:');
  console.log('   BEFORE: 22 reservations with breakfast/cleaning data');
  console.log(`   AFTER:  ${breakfast[0].cnt} breakfast, ${cleaning[0].cnt} cleaning ✅\n`);
  
  // Guest names
  const guestsWithName = db.query(`SELECT COUNT(*) as cnt FROM guests WHERE first_name IS NOT NULL AND first_name != ''`);
  const totalGuests = db.query(`SELECT COUNT(*) as cnt FROM guests`);
  console.log('👤 Guest Names:');
  console.log('   BEFORE: 0 guests with first_name (784 missing)');
  console.log(`   AFTER:  ${guestsWithName[0].cnt}/${totalGuests[0].cnt} guests with names ✅\n`);
  
  // Email coverage
  const guestsWithEmail = db.query(`SELECT COUNT(*) as cnt FROM guests WHERE email IS NOT NULL AND email != ''`);
  console.log('📬 Guest Email Coverage:');
  console.log('   BEFORE: 85.8%');
  console.log(`   AFTER:  ${((guestsWithEmail[0].cnt / totalGuests[0].cnt) * 100).toFixed(1)}% ✅\n`);
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  REMAINING ISSUES (Require Cloudbeds Fixes)');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Overdue checkouts
  const overdue = db.query(`
    SELECT guest_name, end_date, julianday('now') - julianday(end_date) as days
    FROM reservations WHERE status = 'checked_in' AND end_date < date('now')
  `);
  console.log('🚨 OVERDUE CHECKOUTS (need status update in Cloudbeds):');
  overdue.forEach(r => console.log(`   - ${r.guest_name}: ${Math.round(r.days)} days overdue (checkout: ${r.end_date})`));
  
  // Missed check-ins
  const missed = db.query(`
    SELECT guest_name, start_date 
    FROM reservations 
    WHERE status = 'confirmed' AND start_date < date('now')
    ORDER BY start_date DESC LIMIT 5
  `);
  console.log('\n⚠️  MISSED CHECK-INS (should be no_show or checked_in):');
  missed.forEach(r => console.log(`   - ${r.guest_name}: was ${r.start_date}`));
  if (missed.length === 5) console.log('   ... and more');
  
  // Outstanding balances
  const balances = db.query(`
    SELECT SUM(balance) as total, COUNT(*) as cnt
    FROM reservations WHERE status = 'checked_out' AND balance > 0
  `);
  console.log(`\n💰 OUTSTANDING BALANCES FROM CHECKED-OUT GUESTS:`);
  console.log(`   ${balances[0].cnt} guests owe $${balances[0].total?.toFixed(2)} total`);
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  FINAL DATABASE STATS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const stats = db.query(`
    SELECT 
      (SELECT COUNT(*) FROM reservations) as reservations,
      (SELECT COUNT(*) FROM guests) as guests,
      (SELECT COUNT(*) FROM room_types) as room_types,
      (SELECT COUNT(*) FROM reservation_rooms) as room_assignments,
      (SELECT COUNT(*) FROM reservations WHERE breakfast_requested LIKE '%yes%' OR breakfast_requested LIKE '%Yes%') as breakfast_yes,
      (SELECT COUNT(*) FROM reservations WHERE daily_cleaning_requested LIKE '%yes%' OR daily_cleaning_requested LIKE '%Yes%') as cleaning_yes
  `);
  
  console.log(`   📊 Total Reservations:  ${stats[0].reservations}`);
  console.log(`   👥 Total Guests:        ${stats[0].guests}`);
  console.log(`   🛏️  Room Types:          ${stats[0].room_types}`);
  console.log(`   🚪 Room Assignments:    ${stats[0].room_assignments}`);
  console.log(`   🍳 Breakfast Requests:  ${stats[0].breakfast_yes}`);
  console.log(`   🧹 Cleaning Requests:   ${stats[0].cleaning_yes}\n`);
  
  db.closeDatabase();
}

finalReport().catch(console.error);

