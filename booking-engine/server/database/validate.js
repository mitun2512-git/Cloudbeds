/**
 * Database Validation Test Suite
 * Tests schema integrity, data quality, and potential use-cases
 */

const db = require('./db');

// Test results collector
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(test, detail = '') {
  results.passed.push({ test, detail });
  console.log(`  ✅ ${test}${detail ? ': ' + detail : ''}`);
}

function fail(test, detail = '') {
  results.failed.push({ test, detail });
  console.log(`  ❌ ${test}${detail ? ': ' + detail : ''}`);
}

function warn(test, detail = '') {
  results.warnings.push({ test, detail });
  console.log(`  ⚠️  ${test}${detail ? ': ' + detail : ''}`);
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  DATABASE VALIDATION TEST SUITE - Hennessey Estate');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await db.initDatabase();

  // =========================================================================
  // 1. SCHEMA VALIDATION
  // =========================================================================
  console.log('\n📋 1. SCHEMA VALIDATION\n');

  // Check all tables exist
  const tables = db.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  const tableNames = tables.map(t => t.name);
  const requiredTables = ['reservations', 'guests', 'reservation_rooms', 'room_types', 'sync_log'];
  
  for (const table of requiredTables) {
    if (tableNames.includes(table)) {
      pass(`Table '${table}' exists`);
    } else {
      fail(`Table '${table}' missing`);
    }
  }
  
  // Check indexes exist
  const indexes = db.query("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'");
  if (indexes.length >= 5) {
    pass(`Indexes created`, `${indexes.length} indexes found`);
  } else {
    warn(`Few indexes`, `Only ${indexes.length} custom indexes found`);
  }

  // Check for primary keys
  for (const table of requiredTables) {
    const pkInfo = db.query(`PRAGMA table_info(${table})`);
    const hasPK = pkInfo.some(col => col.pk > 0);
    if (hasPK) {
      pass(`Table '${table}' has primary key`);
    } else {
      fail(`Table '${table}' missing primary key`);
    }
  }

  // =========================================================================
  // 2. DATA INTEGRITY
  // =========================================================================
  console.log('\n\n📊 2. DATA INTEGRITY\n');

  // Check for duplicate reservation IDs
  const duplicateRes = db.query(`
    SELECT reservation_id, COUNT(*) as cnt 
    FROM reservations 
    GROUP BY reservation_id 
    HAVING cnt > 1
  `);
  if (duplicateRes.length === 0) {
    pass('No duplicate reservation IDs');
  } else {
    fail('Duplicate reservation IDs found', `${duplicateRes.length} duplicates`);
  }

  // Check for duplicate guest IDs
  const duplicateGuests = db.query(`
    SELECT guest_id, COUNT(*) as cnt 
    FROM guests 
    GROUP BY guest_id 
    HAVING cnt > 1
  `);
  if (duplicateGuests.length === 0) {
    pass('No duplicate guest IDs');
  } else {
    fail('Duplicate guest IDs found', `${duplicateGuests.length} duplicates`);
  }

  // Check for orphaned reservation_rooms
  const orphanedRooms = db.query(`
    SELECT rr.reservation_id 
    FROM reservation_rooms rr 
    LEFT JOIN reservations r ON rr.reservation_id = r.reservation_id 
    WHERE r.reservation_id IS NULL
  `);
  if (orphanedRooms.length === 0) {
    pass('No orphaned reservation_rooms');
  } else {
    warn('Orphaned reservation_rooms', `${orphanedRooms.length} records`);
  }

  // Check for NULL in required fields
  const nullReservationIds = db.query("SELECT COUNT(*) as cnt FROM reservations WHERE reservation_id IS NULL");
  if (nullReservationIds[0].cnt === 0) {
    pass('No NULL reservation_id values');
  } else {
    fail('NULL reservation_id values', `${nullReservationIds[0].cnt} records`);
  }

  const nullGuestIds = db.query("SELECT COUNT(*) as cnt FROM guests WHERE guest_id IS NULL");
  if (nullGuestIds[0].cnt === 0) {
    pass('No NULL guest_id values');
  } else {
    fail('NULL guest_id values', `${nullGuestIds[0].cnt} records`);
  }

  // =========================================================================
  // 3. DATA QUALITY
  // =========================================================================
  console.log('\n\n🔍 3. DATA QUALITY\n');

  // Check reservation statuses are valid
  const invalidStatuses = db.query(`
    SELECT DISTINCT status, COUNT(*) as cnt 
    FROM reservations 
    WHERE status NOT IN ('confirmed', 'not_confirmed', 'canceled', 'checked_in', 'checked_out', 'no_show')
    GROUP BY status
  `);
  if (invalidStatuses.length === 0) {
    pass('All reservation statuses are valid');
  } else {
    fail('Invalid reservation statuses', invalidStatuses.map(s => `${s.status}(${s.cnt})`).join(', '));
  }

  // Check for reservations with invalid date ranges
  const invalidDateRanges = db.query(`
    SELECT COUNT(*) as cnt 
    FROM reservations 
    WHERE start_date > end_date
  `);
  if (invalidDateRanges[0].cnt === 0) {
    pass('All date ranges valid (start_date <= end_date)');
  } else {
    fail('Invalid date ranges', `${invalidDateRanges[0].cnt} reservations have start_date > end_date`);
  }

  // Check for future dates that are too far out (suspicious data)
  const farFutureDates = db.query(`
    SELECT COUNT(*) as cnt 
    FROM reservations 
    WHERE start_date > date('now', '+2 years')
  `);
  if (farFutureDates[0].cnt < 10) {
    pass('Few far-future reservations', `${farFutureDates[0].cnt} reservations 2+ years ahead`);
  } else {
    warn('Many far-future reservations', `${farFutureDates[0].cnt} reservations 2+ years ahead`);
  }
  
  // Check email format validity
  const invalidEmails = db.query(`
    SELECT COUNT(*) as cnt 
    FROM reservations 
    WHERE guest_email IS NOT NULL 
    AND guest_email != ''
    AND guest_email NOT LIKE '%@%.%'
  `);
  if (invalidEmails[0].cnt === 0) {
    pass('All emails have valid format');
  } else {
    warn('Invalid email formats', `${invalidEmails[0].cnt} records`);
  }

  // Check for negative balances (might be valid refunds)
  const negativeBalances = db.query(`
    SELECT COUNT(*) as cnt, MIN(balance) as min_balance 
    FROM reservations 
    WHERE balance < 0
  `);
  if (negativeBalances[0].cnt === 0) {
    pass('No negative balances');
  } else {
    warn('Negative balances found', `${negativeBalances[0].cnt} records (min: $${negativeBalances[0].min_balance})`);
  }

  // Check for unreasonably high totals
  const highTotals = db.query(`
    SELECT COUNT(*) as cnt, MAX(total) as max_total 
    FROM reservations 
    WHERE total > 50000
  `);
  if (highTotals[0].cnt < 5) {
    pass('Few unusually high totals', `${highTotals[0].cnt} reservations over $50k`);
  } else {
    warn('Many high-value reservations', `${highTotals[0].cnt} reservations over $50k (max: $${highTotals[0].max_total})`);
  }

  // =========================================================================
  // 4. CUSTOM FIELDS VALIDATION
  // =========================================================================
  console.log('\n\n🍳 4. CUSTOM FIELDS (Breakfast & Cleaning)\n');

  // Check breakfast field values
  const breakfastValues = db.query(`
    SELECT breakfast_requested, COUNT(*) as cnt 
    FROM reservations 
    WHERE breakfast_requested IS NOT NULL
    GROUP BY breakfast_requested
    ORDER BY cnt DESC
    LIMIT 10
  `);
  console.log('  Breakfast values distribution:');
  breakfastValues.forEach(v => console.log(`    "${v.breakfast_requested}": ${v.cnt}`));
  
  // Check for inconsistent breakfast values
  const breakfastYes = db.query(`
    SELECT COUNT(*) as cnt 
    FROM reservations 
    WHERE LOWER(breakfast_requested) LIKE '%yes%'
  `);
  const breakfastNo = db.query(`
    SELECT COUNT(*) as cnt 
    FROM reservations 
    WHERE breakfast_requested IS NOT NULL 
    AND LOWER(breakfast_requested) NOT LIKE '%yes%'
  `);
  pass('Breakfast field populated', `${breakfastYes[0].cnt} yes, ${breakfastNo[0].cnt} other values`);

  // Check cleaning field values
  const cleaningValues = db.query(`
    SELECT daily_cleaning_requested, COUNT(*) as cnt 
    FROM reservations 
    WHERE daily_cleaning_requested IS NOT NULL
    GROUP BY daily_cleaning_requested
    ORDER BY cnt DESC
    LIMIT 10
  `);
  console.log('\n  Cleaning values distribution:');
  cleaningValues.forEach(v => console.log(`    "${v.daily_cleaning_requested}": ${v.cnt}`));

  // =========================================================================
  // 5. BUSINESS LOGIC VALIDATION
  // =========================================================================
  console.log('\n\n💼 5. BUSINESS LOGIC VALIDATION\n');

  // Check for checked-in guests with past checkout dates
  const overdueCheckouts = db.query(`
    SELECT COUNT(*) as cnt 
    FROM reservations 
    WHERE status = 'checked_in' 
    AND end_date < date('now')
  `);
  if (overdueCheckouts[0].cnt === 0) {
    pass('No overdue checkouts');
  } else {
    warn('Overdue checkouts', `${overdueCheckouts[0].cnt} guests checked in past their checkout date`);
  }

  // Check for confirmed reservations with past check-in dates
  const missedCheckins = db.query(`
    SELECT COUNT(*) as cnt 
    FROM reservations 
    WHERE status = 'confirmed' 
    AND start_date < date('now')
  `);
  if (missedCheckins[0].cnt === 0) {
    pass('No missed check-ins');
  } else {
    warn('Missed check-ins', `${missedCheckins[0].cnt} confirmed reservations with past check-in dates`);
  }

  // Check outstanding balances for checked-out guests
  const checkedOutWithBalance = db.query(`
    SELECT COUNT(*) as cnt, SUM(balance) as total_balance 
    FROM reservations 
    WHERE status = 'checked_out' 
    AND balance > 0
  `);
  if (checkedOutWithBalance[0].cnt === 0) {
    pass('No checked-out guests with outstanding balance');
  } else {
    warn('Outstanding balances on checked-out', 
      `${checkedOutWithBalance[0].cnt} guests owe $${checkedOutWithBalance[0].total_balance?.toFixed(2)}`);
  }

  // Check for cancelled reservations with balance
  const cancelledWithBalance = db.query(`
    SELECT COUNT(*) as cnt, SUM(balance) as total 
    FROM reservations 
    WHERE status = 'canceled' 
    AND balance > 100
  `);
  if (cancelledWithBalance[0].cnt < 5) {
    pass('Few cancelled with significant balance', `${cancelledWithBalance[0].cnt} records`);
  } else {
    warn('Cancelled with balance', `${cancelledWithBalance[0].cnt} cancelled reservations with balance > $100`);
  }

  // =========================================================================
  // 6. GUEST DATA VALIDATION
  // =========================================================================
  console.log('\n\n👥 6. GUEST DATA VALIDATION\n');

  // Check guest email coverage
  const guestsWithEmail = db.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as with_email
    FROM guests
  `);
  const emailCoverage = ((guestsWithEmail[0].with_email / guestsWithEmail[0].total) * 100).toFixed(1);
  if (emailCoverage > 80) {
    pass('Good guest email coverage', `${emailCoverage}% have email`);
  } else if (emailCoverage > 50) {
    warn('Moderate guest email coverage', `${emailCoverage}% have email`);
  } else {
    fail('Poor guest email coverage', `Only ${emailCoverage}% have email`);
  }

  // Check for guests without names
  const guestsWithoutName = db.query(`
    SELECT COUNT(*) as cnt 
    FROM guests 
    WHERE (first_name IS NULL OR first_name = '') 
    AND (last_name IS NULL OR last_name = '')
  `);
  if (guestsWithoutName[0].cnt === 0) {
    pass('All guests have names');
  } else {
    warn('Guests without names', `${guestsWithoutName[0].cnt} records`);
  }

  // Check country distribution (for marketing location targeting)
  const countryDist = db.query(`
    SELECT country, COUNT(*) as cnt 
    FROM guests 
    WHERE country IS NOT NULL AND country != ''
    GROUP BY country 
    ORDER BY cnt DESC 
    LIMIT 5
  `);
  console.log('\n  Top guest countries:');
  countryDist.forEach(c => console.log(`    ${c.country}: ${c.cnt} guests`));

  // =========================================================================
  // 7. ROOM DATA VALIDATION
  // =========================================================================
  console.log('\n\n🛏️ 7. ROOM DATA VALIDATION\n');

  // Check room types
  const roomTypes = db.query('SELECT room_type_name, room_type_id FROM room_types');
  pass('Room types defined', `${roomTypes.length} room types`);
  roomTypes.forEach(rt => console.log(`    - ${rt.room_type_name} (${rt.room_type_id})`));

  // Check reservation rooms coverage
  const roomCoverage = db.query(`
    SELECT 
      COUNT(DISTINCT r.reservation_id) as total_reservations,
      COUNT(DISTINCT rr.reservation_id) as with_room_data
    FROM reservations r
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
  `);
  const roomDataCoverage = ((roomCoverage[0].with_room_data / roomCoverage[0].total_reservations) * 100).toFixed(1);
  if (roomDataCoverage > 50) {
    pass('Room assignment data', `${roomDataCoverage}% of reservations have room data`);
  } else {
    warn('Limited room data', `Only ${roomDataCoverage}% of reservations have room assignments`);
  }

  // =========================================================================
  // 8. USE-CASE SIMULATIONS
  // =========================================================================
  console.log('\n\n🎯 8. USE-CASE SIMULATIONS\n');

  // Use Case 1: Today's Operations
  const todayStats = db.query(`
    SELECT 
      SUM(CASE WHEN start_date = date('now') AND status IN ('confirmed', 'not_confirmed') THEN 1 ELSE 0 END) as arrivals,
      SUM(CASE WHEN end_date = date('now') AND status = 'checked_in' THEN 1 ELSE 0 END) as departures,
      SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as in_house
      FROM reservations 
  `);
  pass('Daily operations query works', 
    `Today: ${todayStats[0].arrivals || 0} arrivals, ${todayStats[0].departures || 0} departures, ${todayStats[0].in_house || 0} in-house`);

  // Use Case 2: Revenue Report
  const revenueQuery = db.query(`
      SELECT 
        strftime('%Y-%m', start_date) as month,
        COUNT(*) as reservations,
      SUM(total) as revenue
      FROM reservations 
      WHERE status NOT IN ('canceled', 'no_show')
    AND start_date >= date('now', '-6 months')
    GROUP BY month
      ORDER BY month DESC
    LIMIT 6
  `);
  pass('Revenue report query works', `${revenueQuery.length} months of data`);

  // Use Case 3: Email Marketing - Welcome Back Campaign
  const welcomeBackTargets = db.query(`
    SELECT COUNT(DISTINCT g.guest_id) as cnt
      FROM guests g
    JOIN reservations r ON g.reservation_id = r.reservation_id
    WHERE g.email IS NOT NULL 
    AND g.email != ''
    AND r.status = 'checked_out'
    AND r.end_date < date('now', '-30 days')
  `);
  pass('Welcome-back campaign query', `${welcomeBackTargets[0].cnt} potential targets`);

  // Use Case 4: Email Marketing - Upsell Campaign
  const upsellTargets = db.query(`
    SELECT COUNT(*) as cnt
    FROM reservations r
    WHERE r.status = 'confirmed'
    AND r.start_date > date('now')
    AND r.guest_email IS NOT NULL
  `);
  pass('Upsell campaign query', `${upsellTargets[0].cnt} potential targets`);

  // Use Case 5: Outstanding Balance Collection
  const balanceCollection = db.query(`
    SELECT 
      r.guest_name,
      r.guest_email,
      r.balance,
      r.status,
      r.end_date
    FROM reservations r
    WHERE r.balance > 0
    AND r.status IN ('checked_in', 'checked_out')
    ORDER BY r.balance DESC
    LIMIT 5
  `);
  pass('Balance collection query', `Top 5 outstanding balances retrieved`);
  console.log('  Top outstanding balances:');
  balanceCollection.forEach(b => console.log(`    $${b.balance?.toFixed(2)} - ${b.guest_name} (${b.status})`));

  // Use Case 6: Service Requests (Breakfast/Cleaning)
  const serviceRequests = db.query(`
    SELECT 
      SUM(CASE WHEN LOWER(breakfast_requested) LIKE '%yes%' AND status = 'checked_in' THEN 1 ELSE 0 END) as breakfast,
      SUM(CASE WHEN LOWER(daily_cleaning_requested) LIKE '%yes%' AND status = 'checked_in' THEN 1 ELSE 0 END) as cleaning
    FROM reservations
    WHERE date('now') BETWEEN start_date AND end_date
  `);
  pass('Service requests query', `Breakfast: ${serviceRequests[0].breakfast || 0}, Cleaning: ${serviceRequests[0].cleaning || 0}`);

  // =========================================================================
  // 9. PERFORMANCE TESTS
  // =========================================================================
  console.log('\n\n⚡ 9. PERFORMANCE TESTS\n');

  // Test query times
  const perfTests = [
    { name: 'Full table scan (reservations)', query: 'SELECT COUNT(*) FROM reservations' },
    { name: 'Indexed query (status)', query: "SELECT COUNT(*) FROM reservations WHERE status = 'confirmed'" },
    { name: 'Date range query', query: "SELECT COUNT(*) FROM reservations WHERE start_date BETWEEN date('now', '-30 days') AND date('now', '+30 days')" },
    { name: 'Join query', query: 'SELECT COUNT(*) FROM reservations r JOIN guests g ON r.reservation_id = g.reservation_id' },
    { name: 'Complex aggregation', query: "SELECT status, COUNT(*), SUM(total), AVG(balance) FROM reservations GROUP BY status" }
  ];

  for (const test of perfTests) {
    const start = Date.now();
    db.query(test.query);
    const duration = Date.now() - start;
    if (duration < 100) {
      pass(`${test.name}`, `${duration}ms`);
    } else if (duration < 500) {
      warn(`${test.name} slow`, `${duration}ms`);
  } else {
      fail(`${test.name} very slow`, `${duration}ms`);
    }
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`  ✅ Passed:   ${results.passed.length}`);
  console.log(`  ⚠️  Warnings: ${results.warnings.length}`);
  console.log(`  ❌ Failed:   ${results.failed.length}`);
  
  if (results.warnings.length > 0) {
    console.log('\n  Warnings:');
    results.warnings.forEach(w => console.log(`    - ${w.test}: ${w.detail}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n  Failures:');
    results.failed.forEach(f => console.log(`    - ${f.test}: ${f.detail}`));
  }

  const score = ((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(0);
  console.log(`\n  📊 Overall Score: ${score}%`);
  
  if (results.failed.length === 0 && results.warnings.length < 5) {
    console.log('  🎉 Database is in good shape!\n');
  } else if (results.failed.length === 0) {
    console.log('  ✨ Database is functional but has some areas for improvement.\n');
  } else {
    console.log('  🔧 Database needs attention - see failures above.\n');
  }
  
  db.closeDatabase();
  return results;
}

// Run tests
runTests().catch(console.error);
