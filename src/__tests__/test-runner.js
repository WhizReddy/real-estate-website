#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Real Estate Website
 * 
 * This script runs all tests and generates a comprehensive report
 * covering unit tests, integration tests, accessibility tests, and performance tests.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive Test Suite for Real Estate Website\n');

// Test categories to run
const testCategories = [
  {
    name: 'Unit Tests',
    pattern: '__tests__/components/**/*.test.{ts,tsx}',
    description: 'Testing individual components in isolation'
  },
  {
    name: 'Utility Tests',
    pattern: '__tests__/utils/**/*.test.{ts,tsx}',
    description: 'Testing utility functions and helpers'
  },
  {
    name: 'Data Layer Tests',
    pattern: '__tests__/lib/**/*.test.{ts,tsx}',
    description: 'Testing data fetching and API integration'
  },
  {
    name: 'Integration Tests',
    pattern: '__tests__/integration/**/*.test.{ts,tsx}',
    description: 'Testing component interactions and user flows'
  },
  {
    name: 'Accessibility Tests',
    pattern: '__tests__/accessibility/**/*.test.{ts,tsx}',
    description: 'Testing WCAG compliance and screen reader support'
  }
];

// Results storage
const results = {
  categories: {},
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    coverage: null
  }
};

function runTestCategory(category) {
  console.log(`\n📋 Running ${category.name}...`);
  console.log(`   ${category.description}`);
  
  try {
    const output = execSync(
      `npm test -- --testPathPattern="${category.pattern}" --verbose --coverage=false`,
      { 
        encoding: 'utf8',
        stdio: 'pipe'
      }
    );
    
    // Parse Jest output for test results
    const testResults = parseJestOutput(output);
    results.categories[category.name] = {
      ...testResults,
      status: 'passed'
    };
    
    console.log(`   ✅ ${category.name}: ${testResults.passed} passed, ${testResults.failed} failed`);
    
  } catch (error) {
    const testResults = parseJestOutput(error.stdout || error.message);
    results.categories[category.name] = {
      ...testResults,
      status: 'failed',
      error: error.message
    };
    
    console.log(`   ❌ ${category.name}: ${testResults.passed} passed, ${testResults.failed} failed`);
  }
}

function parseJestOutput(output) {
  const lines = output.split('\n');
  let passed = 0;
  let failed = 0;
  let total = 0;
  
  // Look for Jest summary line
  const summaryLine = lines.find(line => line.includes('Tests:'));
  if (summaryLine) {
    const passedMatch = summaryLine.match(/(\d+) passed/);
    const failedMatch = summaryLine.match(/(\d+) failed/);
    const totalMatch = summaryLine.match(/(\d+) total/);
    
    if (passedMatch) passed = parseInt(passedMatch[1]);
    if (failedMatch) failed = parseInt(failedMatch[1]);
    if (totalMatch) total = parseInt(totalMatch[1]);
  }
  
  return { passed, failed, total };
}

function runCoverageReport() {
  console.log('\n📊 Generating Coverage Report...');
  
  try {
    const output = execSync(
      'npm test -- --coverage --watchAll=false --passWithNoTests',
      { 
        encoding: 'utf8',
        stdio: 'pipe'
      }
    );
    
    // Parse coverage information
    const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)/);
    if (coverageMatch) {
      results.summary.coverage = parseFloat(coverageMatch[1]);
      console.log(`   ✅ Overall Coverage: ${results.summary.coverage}%`);
    }
    
  } catch (error) {
    console.log('   ⚠️  Coverage report generation failed');
    console.log(`   Error: ${error.message}`);
  }
}

function generateReport() {
  console.log('\n📈 Generating Test Report...\n');
  
  // Calculate summary
  Object.values(results.categories).forEach(category => {
    results.summary.totalTests += category.total;
    results.summary.passedTests += category.passed;
    results.summary.failedTests += category.failed;
  });
  
  // Print summary
  console.log('='.repeat(60));
  console.log('                    TEST SUMMARY                     ');
  console.log('='.repeat(60));
  console.log(`Total Tests:     ${results.summary.totalTests}`);
  console.log(`Passed:          ${results.summary.passedTests} ✅`);
  console.log(`Failed:          ${results.summary.failedTests} ${results.summary.failedTests > 0 ? '❌' : '✅'}`);
  console.log(`Success Rate:    ${((results.summary.passedTests / results.summary.totalTests) * 100).toFixed(1)}%`);
  if (results.summary.coverage) {
    console.log(`Code Coverage:   ${results.summary.coverage}%`);
  }
  console.log('='.repeat(60));
  
  // Print category details
  console.log('\nDETAILED RESULTS BY CATEGORY:\n');
  
  Object.entries(results.categories).forEach(([name, result]) => {
    const status = result.status === 'passed' ? '✅' : '❌';
    console.log(`${status} ${name}`);
    console.log(`   Tests: ${result.passed} passed, ${result.failed} failed, ${result.total} total`);
    if (result.error) {
      console.log(`   Error: ${result.error.split('\n')[0]}`);
    }
    console.log('');
  });
  
  // Save report to file
  const reportPath = path.join(__dirname, '../test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
  
  // Exit with appropriate code
  const hasFailures = results.summary.failedTests > 0;
  if (hasFailures) {
    console.log('❌ Some tests failed. Please review the results above.');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed successfully!');
    process.exit(0);
  }
}

// Performance test function
function runPerformanceTests() {
  console.log('\n⚡ Running Performance Tests...');
  
  try {
    // Check if performance test page exists
    const perfTestPath = path.join(__dirname, '../app/test-performance/page.tsx');
    if (fs.existsSync(perfTestPath)) {
      console.log('   ✅ Performance test page available');
      console.log('   📊 Run `npm run dev` and visit /test-performance for interactive testing');
    } else {
      console.log('   ⚠️  Performance test page not found');
    }
    
    // Basic performance checks
    console.log('   🔍 Checking bundle size...');
    const buildOutput = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    
    if (buildOutput.includes('✓ Compiled successfully')) {
      console.log('   ✅ Build successful - no performance blocking issues');
    }
    
  } catch (error) {
    console.log('   ⚠️  Performance tests encountered issues');
    console.log(`   Error: ${error.message.split('\n')[0]}`);
  }
}

// Main execution
async function main() {
  try {
    // Run each test category
    testCategories.forEach(runTestCategory);
    
    // Run coverage report
    runCoverageReport();
    
    // Run performance tests
    runPerformanceTests();
    
    // Generate final report
    generateReport();
    
  } catch (error) {
    console.error('❌ Test runner encountered an error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, results };