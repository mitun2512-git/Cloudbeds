/**
 * Basic test file for Zapier integration
 * Run with: zapier test
 */

const zapier = require('zapier-platform-core');
const App = require('../index');

// Mock test to verify app structure
describe('Cloudbeds Zapier Integration', () => {
  it('should have authentication configured', () => {
    expect(App.authentication).toBeDefined();
    expect(App.authentication.type).toBe('oauth2');
  });

  it('should have triggers defined', () => {
    expect(App.triggers).toBeDefined();
    expect(Object.keys(App.triggers).length).toBeGreaterThan(0);
  });

  it('should have creates defined', () => {
    expect(App.creates).toBeDefined();
    expect(Object.keys(App.creates).length).toBeGreaterThan(0);
  });

  it('should have searches defined', () => {
    expect(App.searches).toBeDefined();
    expect(Object.keys(App.searches).length).toBeGreaterThan(0);
  });
});


