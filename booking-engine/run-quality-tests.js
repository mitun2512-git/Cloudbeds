#!/usr/bin/env node
/**
 * Hennessey Estate - Quality Test Runner
 * Automated tests based on QUALITY_TEST_PLAN.md
 */

const fs = require('fs');
const path = require('path');

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Helper functions
function test(id, category, name, fn) {
  try {
    const result = fn();
    if (result.pass) {
      results.passed++;
      results.tests.push({ id, category, name, status: 'PASS', message: 'OK' });
      console.log(`✅ [${id}] ${name}`);
    } else {
      results.failed++;
      results.tests.push({ id, category, name, status: 'FAIL', message: result.message });
      console.log(`❌ [${id}] ${name}: ${result.message}`);
    }
  } catch (err) {
    results.failed++;
    results.tests.push({ id, category, name, status: 'FAIL', message: err.message });
    console.log(`❌ [${id}] ${name}: ${err.message}`);
  }
}

function warn(id, category, name, message) {
  results.warnings++;
  results.tests.push({ id, category, name, status: 'WARN', message });
  console.log(`⚠️  [${id}] ${name}: ${message}`);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// ============================================================
// STATIC FILE VALIDATION
// ============================================================
console.log('\n📋 STATIC FILE VALIDATION\n' + '='.repeat(50));

// robots.txt tests
const robotsPath = path.join(__dirname, 'client/public/robots.txt');
test('SF-001', 'Static Files', 'robots.txt exists', () => {
  return { pass: fileExists(robotsPath), message: 'File not found' };
});

if (fileExists(robotsPath)) {
  const robotsContent = readFile(robotsPath);
  
  test('SF-002', 'Static Files', 'robots.txt allows root path', () => {
    return { pass: robotsContent.includes('Allow: /'), message: 'Root path not allowed' };
  });
  
  test('SF-003', 'Static Files', 'robots.txt allows /book', () => {
    return { pass: robotsContent.includes('Allow: /book'), message: '/book not allowed' };
  });
  
  test('SF-004', 'Static Files', 'robots.txt blocks /dashboard', () => {
    return { pass: robotsContent.includes('Disallow: /dashboard'), message: '/dashboard not blocked' };
  });
  
  test('SF-005', 'Static Files', 'robots.txt blocks /editor', () => {
    return { pass: robotsContent.includes('Disallow: /editor'), message: '/editor not blocked' };
  });
  
  test('SF-006', 'Static Files', 'robots.txt blocks /api', () => {
    return { pass: robotsContent.includes('Disallow: /api'), message: '/api not blocked' };
  });
  
  test('SF-007', 'Static Files', 'robots.txt has sitemap reference', () => {
    return { pass: robotsContent.includes('Sitemap:'), message: 'No sitemap reference' };
  });
}

// sitemap.xml tests
const sitemapPath = path.join(__dirname, 'client/public/sitemap.xml');
test('SF-008', 'Static Files', 'sitemap.xml exists', () => {
  return { pass: fileExists(sitemapPath), message: 'File not found' };
});

if (fileExists(sitemapPath)) {
  const sitemapContent = readFile(sitemapPath);
  
  test('SF-009', 'Static Files', 'sitemap.xml includes homepage', () => {
    return { pass: sitemapContent.includes('https://hennesseyestate.com/'), message: 'Homepage not in sitemap' };
  });
  
  test('SF-010', 'Static Files', 'sitemap.xml includes booking page', () => {
    return { pass: sitemapContent.includes('https://hennesseyestate.com/book'), message: 'Booking page not in sitemap' };
  });
  
  test('SF-011', 'Static Files', 'sitemap.xml excludes dashboard', () => {
    return { pass: !sitemapContent.includes('/dashboard'), message: 'Dashboard should not be in sitemap' };
  });
  
  test('SF-012', 'Static Files', 'sitemap.xml has proper XML structure', () => {
    return { pass: sitemapContent.includes('<?xml version="1.0"') && sitemapContent.includes('<urlset'), message: 'Invalid XML structure' };
  });
}

// index.html SEO tests
const indexPath = path.join(__dirname, 'client/public/index.html');
test('SF-013', 'Static Files', 'index.html exists', () => {
  return { pass: fileExists(indexPath), message: 'File not found' };
});

if (fileExists(indexPath)) {
  const indexContent = readFile(indexPath);
  
  test('SEO-001', 'SEO', 'Page title is set', () => {
    return { pass: indexContent.includes('<title>') && indexContent.includes('Hennessey Estate'), message: 'Title missing or incorrect' };
  });
  
  test('SEO-002', 'SEO', 'Meta description exists', () => {
    return { pass: indexContent.includes('name="description"'), message: 'Meta description missing' };
  });
  
  test('SEO-003', 'SEO', 'Robots meta tag set to index', () => {
    return { pass: indexContent.includes('name="robots"') && indexContent.includes('index, follow'), message: 'Robots meta tag not set correctly' };
  });
  
  test('SEO-004', 'SEO', 'Open Graph title exists', () => {
    return { pass: indexContent.includes('og:title'), message: 'OG title missing' };
  });
  
  test('SEO-005', 'SEO', 'Open Graph image exists', () => {
    return { pass: indexContent.includes('og:image'), message: 'OG image missing' };
  });
  
  test('SEO-006', 'SEO', 'Twitter card exists', () => {
    return { pass: indexContent.includes('twitter:card'), message: 'Twitter card missing' };
  });
  
  test('SEO-007', 'SEO', 'Canonical URL exists', () => {
    return { pass: indexContent.includes('rel="canonical"'), message: 'Canonical URL missing' };
  });
  
  test('SEO-008', 'SEO', 'Structured data (JSON-LD) exists', () => {
    return { pass: indexContent.includes('application/ld+json'), message: 'Structured data missing' };
  });
  
  test('SEO-009', 'SEO', 'Geographic meta tags exist', () => {
    return { pass: indexContent.includes('geo.region') && indexContent.includes('geo.placename'), message: 'Geo meta tags missing' };
  });
  
  test('SEO-010', 'SEO', 'Lang attribute set', () => {
    return { pass: indexContent.includes('lang="en"'), message: 'Language attribute missing' };
  });
  
  test('SEO-011', 'SEO', 'Viewport meta tag exists', () => {
    return { pass: indexContent.includes('name="viewport"'), message: 'Viewport meta tag missing' };
  });
  
  test('SEO-012', 'SEO', 'Favicon is set', () => {
    return { pass: indexContent.includes('rel="icon"') || indexContent.includes('rel="shortcut icon"'), message: 'Favicon not set' };
  });
}

// ============================================================
// DESIGN SYSTEM COMPLIANCE
// ============================================================
console.log('\n🎨 DESIGN SYSTEM COMPLIANCE\n' + '='.repeat(50));

const appCssPath = path.join(__dirname, 'client/src/App.css');
if (fileExists(appCssPath)) {
  const appCss = readFile(appCssPath);
  
  // Color variables
  test('DS-001', 'Design System', 'Primary color defined', () => {
    return { pass: appCss.includes('--color-primary:'), message: 'Primary color variable not found' };
  });
  
  test('DS-002', 'Design System', 'Background color defined', () => {
    return { pass: appCss.includes('--color-bg:'), message: 'Background color variable not found' };
  });
  
  test('DS-003', 'Design System', 'Text color defined', () => {
    return { pass: appCss.includes('--color-text:'), message: 'Text color variable not found' };
  });
  
  test('DS-004', 'Design System', 'Success color defined', () => {
    return { pass: appCss.includes('--color-success:'), message: 'Success color variable not found' };
  });
  
  test('DS-005', 'Design System', 'Warning color defined', () => {
    return { pass: appCss.includes('--color-warning:'), message: 'Warning color variable not found' };
  });
  
  test('DS-006', 'Design System', 'Danger color defined', () => {
    return { pass: appCss.includes('--color-danger:'), message: 'Danger color variable not found' };
  });
  
  // Spacing variables
  test('DS-007', 'Design System', 'Spacing scale defined', () => {
    const hasSpacing = appCss.includes('--spacing-xs:') && 
                       appCss.includes('--spacing-sm:') && 
                       appCss.includes('--spacing-md:') && 
                       appCss.includes('--spacing-lg:') && 
                       appCss.includes('--spacing-xl:');
    return { pass: hasSpacing, message: 'Spacing scale not complete' };
  });
  
  // Border radius
  test('DS-008', 'Design System', 'Border radius scale defined', () => {
    const hasRadius = appCss.includes('--radius-sm:') && 
                      appCss.includes('--radius-md:') && 
                      appCss.includes('--radius-lg:');
    return { pass: hasRadius, message: 'Border radius scale not complete' };
  });
  
  // Typography
  test('DS-009', 'Design System', 'Serif font imported (Cormorant Garamond)', () => {
    return { pass: appCss.includes('Cormorant Garamond'), message: 'Serif font not imported' };
  });
  
  test('DS-010', 'Design System', 'Sans-serif font imported (Lato)', () => {
    return { pass: appCss.includes('Lato'), message: 'Sans-serif font not imported' };
  });
}

// ============================================================
// COMPONENT VALIDATION
// ============================================================
console.log('\n🧩 COMPONENT VALIDATION\n' + '='.repeat(50));

const componentsDir = path.join(__dirname, 'client/src/components');
const expectedComponents = [
  'LandingPage.js',
  'GuestBookingApp.js',
  'Homepage.js',
  'DailyReservations.js',
  'AvailabilityChecker.js',
  'EmailMarketing.js',
  'RevenueDashboard.js',
  'DynamicPricing.js',
  'CompetitiveBenchmark.js',
  'WebsiteEditor.js',
  'ChatBot.js'
];

expectedComponents.forEach((comp, i) => {
  test(`CV-${String(i + 1).padStart(3, '0')}`, 'Components', `${comp} exists`, () => {
    const compPath = path.join(componentsDir, comp);
    return { pass: fileExists(compPath), message: 'Component file not found' };
  });
});

// Check for corresponding CSS files
const componentsWithCss = [
  'LandingPage',
  'GuestBookingApp',
  'Homepage',
  'DailyReservations',
  'AvailabilityChecker',
  'EmailMarketing',
  'RevenueDashboard',
  'DynamicPricing',
  'CompetitiveBenchmark',
  'WebsiteEditor',
  'ChatBot'
];

componentsWithCss.forEach((comp, i) => {
  test(`CV-CSS-${String(i + 1).padStart(3, '0')}`, 'Components', `${comp}.css exists`, () => {
    const cssPath = path.join(componentsDir, `${comp}.css`);
    return { pass: fileExists(cssPath), message: 'CSS file not found' };
  });
});

// ============================================================
// ACCESSIBILITY PATTERN CHECKS
// ============================================================
console.log('\n♿ ACCESSIBILITY PATTERN CHECKS\n' + '='.repeat(50));

// Check components for common accessibility patterns
const accessibilityChecks = [
  { file: 'LandingPage.js', patterns: ['aria-label', 'alt=', 'role='], name: 'LandingPage' },
  { file: 'GuestBookingApp.js', patterns: ['aria-label', 'alt=', 'type="submit"'], name: 'GuestBookingApp' },
];

accessibilityChecks.forEach(({ file, patterns, name }) => {
  const filePath = path.join(componentsDir, file);
  if (fileExists(filePath)) {
    const content = readFile(filePath);
    patterns.forEach((pattern, i) => {
      test(`A11Y-${name}-${i + 1}`, 'Accessibility', `${name} uses ${pattern}`, () => {
        return { pass: content.includes(pattern), message: `Pattern "${pattern}" not found` };
      });
    });
  }
});

// Check for form labels
const formComponents = ['GuestBookingApp.js', 'AvailabilityChecker.js'];
formComponents.forEach(comp => {
  const filePath = path.join(componentsDir, comp);
  if (fileExists(filePath)) {
    const content = readFile(filePath);
    test(`A11Y-FORM-${comp}`, 'Accessibility', `${comp} has form labels`, () => {
      return { pass: content.includes('<label'), message: 'No form labels found' };
    });
  }
});

// ============================================================
// SECURITY PATTERN CHECKS
// ============================================================
console.log('\n🔒 SECURITY PATTERN CHECKS\n' + '='.repeat(50));

// Check for hardcoded secrets
const srcDir = path.join(__dirname, 'client/src');
const jsFiles = [];
function findJsFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findJsFiles(fullPath);
    } else if (file.endsWith('.js')) {
      jsFiles.push(fullPath);
    }
  });
}
findJsFiles(srcDir);

// Check for exposed secrets patterns
const secretPatterns = [
  { pattern: /sk_live_[a-zA-Z0-9]{20,}/, name: 'Stripe Live Secret Key' },
  { pattern: /AIza[a-zA-Z0-9_-]{35}/, name: 'Google API Key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub Token' },
  { pattern: /password\s*=\s*['"][^'"]+['"]/, name: 'Hardcoded Password' },
];

jsFiles.forEach(file => {
  const content = readFile(file);
  const fileName = path.basename(file);
  
  secretPatterns.forEach(({ pattern, name }) => {
    const hasSecret = pattern.test(content);
    if (hasSecret) {
      warn(`SEC-${fileName}`, 'Security', `${fileName} may contain ${name}`, 'Potential secret exposure detected');
    }
  });
});

test('SEC-001', 'Security', 'No hardcoded secrets detected', () => {
  // Check the main api.js file specifically
  const apiFile = path.join(srcDir, 'services/api.js');
  if (fileExists(apiFile)) {
    const content = readFile(apiFile);
    const hasHardcodedSecrets = secretPatterns.some(({ pattern }) => pattern.test(content));
    return { pass: !hasHardcodedSecrets, message: 'Potential hardcoded secrets found in api.js' };
  }
  return { pass: true };
});

// Check for environment variable usage
test('SEC-002', 'Security', 'Uses environment variables for API URLs', () => {
  const apiFile = path.join(srcDir, 'services/api.js');
  if (fileExists(apiFile)) {
    const content = readFile(apiFile);
    return { pass: content.includes('process.env') || content.includes('REACT_APP_'), message: 'Should use environment variables' };
  }
  return { pass: false, message: 'api.js not found' };
});

// ============================================================
// IMAGE ASSETS VALIDATION
// ============================================================
console.log('\n🖼️  IMAGE ASSETS VALIDATION\n' + '='.repeat(50));

const publicImagesDir = path.join(__dirname, 'client/public/images');
const expectedImages = [
  'logo.png',
  'pool-aerial.png',
  'room-couple.png',
  'breakfast-tasting-room.png'
];

// Check for images in public folder root
test('IMG-001', 'Images', 'Logo exists in public folder', () => {
  return { pass: fileExists(path.join(__dirname, 'client/public/logo.png')), message: 'logo.png not found' };
});

if (fs.existsSync(publicImagesDir)) {
  const images = fs.readdirSync(publicImagesDir);
  
  test('IMG-002', 'Images', 'Images folder is not empty', () => {
    return { pass: images.length > 0, message: 'No images found' };
  });
  
  expectedImages.slice(1).forEach((img, i) => {
    test(`IMG-${String(i + 3).padStart(3, '0')}`, 'Images', `${img} exists`, () => {
      return { pass: images.includes(img), message: `${img} not found in images folder` };
    });
  });
}

// ============================================================
// ROUTING VALIDATION
// ============================================================
console.log('\n🛤️  ROUTING VALIDATION\n' + '='.repeat(50));

const appJsPath = path.join(__dirname, 'client/src/App.js');
if (fileExists(appJsPath)) {
  const appJs = readFile(appJsPath);
  
  test('RT-001', 'Routing', 'Landing page route exists', () => {
    return { pass: appJs.includes('path="/"') && appJs.includes('LandingPage'), message: 'Landing page route not found' };
  });
  
  test('RT-002', 'Routing', 'Booking route exists', () => {
    return { pass: appJs.includes('path="/book"') && appJs.includes('GuestBookingApp'), message: 'Booking route not found' };
  });
  
  test('RT-003', 'Routing', 'Dashboard route exists', () => {
    const hasDashboardRoute = (appJs.includes('path="/dashboard"') || appJs.includes('path="/dashboard/*"')) && appJs.includes('StaffDashboard');
    return { pass: hasDashboardRoute, message: 'Dashboard route not found' };
  });
  
  test('RT-004', 'Routing', 'Editor route exists', () => {
    return { pass: appJs.includes('path="/editor"') && appJs.includes('WebsiteEditor'), message: 'Editor route not found' };
  });
  
  test('RT-005', 'Routing', 'Dashboard sets noindex meta', () => {
    return { pass: appJs.includes('noindex, nofollow'), message: 'Dashboard should set noindex meta tag' };
  });
}

// ============================================================
// CSS QUALITY CHECKS
// ============================================================
console.log('\n🎨 CSS QUALITY CHECKS\n' + '='.repeat(50));

// CSS files that should use responsive design and design system variables
// Note: Dashboard components may have their own design systems
const cssFiles = [
  'App.css',
  'LandingPage.css',
  'GuestBookingApp.css'
];

// Additional CSS files to check for responsive design only
const dashboardCssFiles = [
  'Homepage.css',
  'DailyReservations.css',
  'RevenueDashboard.css',
  'EmailMarketing.css'
];

// Test core CSS files for design system compliance
cssFiles.forEach(cssFile => {
  const cssPath = cssFile === 'App.css' 
    ? path.join(__dirname, 'client/src', cssFile)
    : path.join(componentsDir, cssFile);
    
  if (fileExists(cssPath)) {
    const cssContent = readFile(cssPath);
    
    // Check for responsive design patterns
    test(`CSS-RESP-${cssFile}`, 'CSS Quality', `${cssFile} uses media queries`, () => {
      return { pass: cssContent.includes('@media'), message: 'No media queries found for responsive design' };
    });
    
    // Check for CSS variable usage
    test(`CSS-VAR-${cssFile}`, 'CSS Quality', `${cssFile} uses CSS variables`, () => {
      return { pass: cssContent.includes('var(--'), message: 'Not using CSS variables from design system' };
    });
  }
});

// Test dashboard CSS files for responsive design (not requiring design system variables)
dashboardCssFiles.forEach(cssFile => {
  const cssPath = path.join(componentsDir, cssFile);
    
  if (fileExists(cssPath)) {
    const cssContent = readFile(cssPath);
    
    // Check for responsive design patterns only
    test(`CSS-RESP-${cssFile}`, 'CSS Quality', `${cssFile} uses media queries`, () => {
      return { pass: cssContent.includes('@media'), message: 'No media queries found for responsive design' };
    });
  }
});

// Check for flex and grid usage for layouts across all CSS files
let hasFlexbox = false;
let hasCssGrid = false;

const allCssFiles = [...cssFiles, ...dashboardCssFiles];
allCssFiles.forEach(cssFile => {
  const cssPath = cssFile === 'App.css' 
    ? path.join(__dirname, 'client/src', cssFile)
    : path.join(componentsDir, cssFile);
    
  if (fileExists(cssPath)) {
    const cssContent = readFile(cssPath);
    if (cssContent.includes('display: flex') || cssContent.includes('display:flex')) {
      hasFlexbox = true;
    }
    if (cssContent.includes('display: grid') || cssContent.includes('display:grid')) {
      hasCssGrid = true;
    }
  }
});

test('CSS-LAYOUT-001', 'CSS Quality', 'Uses flexbox for layouts', () => {
  return { pass: hasFlexbox, message: 'No flexbox usage found' };
});

test('CSS-LAYOUT-002', 'CSS Quality', 'Uses CSS grid for complex layouts', () => {
  return { pass: hasCssGrid, message: 'No CSS grid usage found' };
});

// ============================================================
// ERROR HANDLING VALIDATION
// ============================================================
console.log('\n⚠️  ERROR HANDLING VALIDATION\n' + '='.repeat(50));

const componentsToCheckErrors = [
  'DailyReservations.js',
  'AvailabilityChecker.js',
  'EmailMarketing.js',
  'RevenueDashboard.js'
];

componentsToCheckErrors.forEach(comp => {
  const compPath = path.join(componentsDir, comp);
  if (fileExists(compPath)) {
    const content = readFile(compPath);
    
    test(`ERR-TRY-${comp}`, 'Error Handling', `${comp} has try-catch blocks`, () => {
      return { pass: content.includes('try {') && content.includes('catch'), message: 'No try-catch error handling' };
    });
    
    test(`ERR-STATE-${comp}`, 'Error Handling', `${comp} has error state`, () => {
      return { pass: content.includes('error') && (content.includes('setError') || content.includes('useState')), message: 'No error state management' };
    });
    
    test(`ERR-LOADING-${comp}`, 'Error Handling', `${comp} has loading state`, () => {
      return { pass: content.includes('loading') && (content.includes('setLoading') || content.includes('useState')), message: 'No loading state management' };
    });
  }
});

// ============================================================
// PERFORMANCE PATTERNS
// ============================================================
console.log('\n⚡ PERFORMANCE PATTERNS\n' + '='.repeat(50));

// Check for lazy loading
const landingCss = fileExists(path.join(componentsDir, 'LandingPage.css')) 
  ? readFile(path.join(componentsDir, 'LandingPage.css')) : '';

test('PERF-001', 'Performance', 'Images use lazy loading', () => {
  const landingJs = fileExists(path.join(componentsDir, 'LandingPage.js'))
    ? readFile(path.join(componentsDir, 'LandingPage.js')) : '';
  const hasLazyLoading = landingJs.includes('loading="lazy"') || 
                         landingJs.includes('loading: "lazy"') ||
                         landingJs.includes('"lazy"') ||
                         landingJs.includes("'lazy'");
  return { pass: hasLazyLoading, message: 'No lazy loading for images' };
});

test('PERF-002', 'Performance', 'Uses React hooks optimizations', () => {
  let usesHooks = false;
  jsFiles.slice(0, 10).forEach(file => {
    const content = readFile(file);
    if (content.includes('useCallback') || content.includes('useMemo')) {
      usesHooks = true;
    }
  });
  return { pass: usesHooks, message: 'No useCallback/useMemo optimizations found' };
});

// Check for proper state management
test('PERF-003', 'Performance', 'Uses useState for state management', () => {
  const appJsContent = fileExists(appJsPath) ? readFile(appJsPath) : '';
  return { pass: appJsContent.includes('useState'), message: 'useState not found' };
});

test('PERF-004', 'Performance', 'Uses useEffect for side effects', () => {
  const appJsContent = fileExists(appJsPath) ? readFile(appJsPath) : '';
  return { pass: appJsContent.includes('useEffect'), message: 'useEffect not found' };
});

// ============================================================
// API SERVICE VALIDATION
// ============================================================
console.log('\n🔌 API SERVICE VALIDATION\n' + '='.repeat(50));

const apiServicePath = path.join(srcDir, 'services/api.js');
if (fileExists(apiServicePath)) {
  const apiContent = readFile(apiServicePath);
  
  test('API-001', 'API Service', 'Uses axios for HTTP requests', () => {
    return { pass: apiContent.includes('axios'), message: 'axios not found in api service' };
  });
  
  test('API-002', 'API Service', 'Has reservation API functions', () => {
    return { pass: apiContent.includes('Reservation') || apiContent.includes('reservation'), message: 'No reservation API functions' };
  });
  
  test('API-003', 'API Service', 'Has availability API functions', () => {
    return { pass: apiContent.includes('Availability') || apiContent.includes('availability'), message: 'No availability API functions' };
  });
  
  test('API-004', 'API Service', 'Has pricing API functions', () => {
    return { pass: apiContent.includes('Pricing') || apiContent.includes('pricing') || apiContent.includes('Price'), message: 'No pricing API functions' };
  });
  
  test('API-005', 'API Service', 'Exports functions properly', () => {
    return { pass: apiContent.includes('export'), message: 'No exports found' };
  });
}

// ============================================================
// PRINT RESULTS SUMMARY
// ============================================================
console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed:   ${results.passed}`);
console.log(`❌ Failed:   ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📋 Total:    ${results.passed + results.failed + results.warnings}`);
console.log('='.repeat(50));

// Calculate pass rate
const passRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
console.log(`📈 Pass Rate: ${passRate}%`);

if (results.failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  results.tests.filter(t => t.status === 'FAIL').forEach(t => {
    console.log(`   [${t.id}] ${t.name}: ${t.message}`);
  });
}

if (results.warnings > 0) {
  console.log('\n⚠️  WARNINGS:');
  results.tests.filter(t => t.status === 'WARN').forEach(t => {
    console.log(`   [${t.id}] ${t.name}: ${t.message}`);
  });
}

// Write detailed report to file
const reportPath = path.join(__dirname, 'QUALITY_TEST_RESULTS.md');
const reportContent = `# Quality Test Results

**Generated:** ${new Date().toISOString()}

## Summary

| Metric | Count |
|--------|-------|
| ✅ Passed | ${results.passed} |
| ❌ Failed | ${results.failed} |
| ⚠️ Warnings | ${results.warnings} |
| **Total** | ${results.passed + results.failed + results.warnings} |
| **Pass Rate** | ${passRate}% |

## Detailed Results

${Object.entries(
  results.tests.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {})
).map(([category, tests]) => `
### ${category}

| ID | Test | Status | Message |
|----|------|--------|---------|
${tests.map(t => `| ${t.id} | ${t.name} | ${t.status === 'PASS' ? '✅' : t.status === 'FAIL' ? '❌' : '⚠️'} ${t.status} | ${t.message} |`).join('\n')}
`).join('\n')}

## Next Steps

${results.failed > 0 ? `
### Fix Failed Tests

${results.tests.filter(t => t.status === 'FAIL').map(t => `- [ ] **${t.id}**: ${t.name} - ${t.message}`).join('\n')}
` : '✅ All tests passed!'}

${results.warnings > 0 ? `
### Address Warnings

${results.tests.filter(t => t.status === 'WARN').map(t => `- [ ] **${t.id}**: ${t.name} - ${t.message}`).join('\n')}
` : ''}
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// Exit with error code if tests failed
process.exit(results.failed > 0 ? 1 : 0);
