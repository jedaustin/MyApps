#!/usr/bin/env node

/**
 * Test script to verify WebLauncher setup
 * Run with: node test-setup.js
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checks = {
  passed: 0,
  failed: 0,
  messages: []
};

function checkFile(filename, description) {
  const filepath = join(__dirname, filename);
  if (existsSync(filepath)) {
    checks.passed++;
    console.log(`✅ ${description}: ${filename}`);
    return true;
  } else {
    checks.failed++;
    checks.messages.push(`❌ Missing: ${filename}`);
    console.log(`❌ ${description}: ${filename}`);
    return false;
  }
}

function checkDirectory(dirname, description) {
  const dirpath = join(__dirname, dirname);
  if (existsSync(dirpath)) {
    checks.passed++;
    console.log(`✅ ${description}: ${dirname}/`);
    return true;
  } else {
    checks.failed++;
    checks.messages.push(`❌ Missing: ${dirname}/`);
    console.log(`❌ ${description}: ${dirname}/`);
    return false;
  }
}

console.log('\n🔍 WebLauncher Setup Verification\n');
console.log('='.repeat(50));

// Check configuration files
console.log('\n📋 Configuration Files:');
checkFile('package.json', 'Package configuration');
checkFile('Dockerfile', 'Docker configuration');
checkFile('docker-compose.yml', 'Docker Compose');
checkFile('env.example', 'Environment template');
checkFile('.eslintrc.json', 'ESLint configuration');
checkFile('.prettierrc', 'Prettier configuration');
checkFile('.gitignore', 'Git ignore rules');

// Check backend files
console.log('\n🔙 Backend Files:');
checkFile('server.js', 'Express server');
checkDirectory('config', 'Config directory');
checkFile('config/passport.js', 'Passport authentication');
checkDirectory('models', 'Models directory');
checkFile('models/User.js', 'User model');
checkFile('models/Url.js', 'URL model');
checkDirectory('routes', 'Routes directory');
checkFile('routes/auth.js', 'Auth routes');
checkFile('routes/api.js', 'API routes');

// Check frontend files
console.log('\n🎨 Frontend Files:');
checkDirectory('views', 'Views directory');
checkFile('views/login.ejs', 'Login template');
checkFile('views/register.ejs', 'Register template');
checkFile('views/dashboard.ejs', 'Dashboard template');
checkFile('views/error.ejs', 'Error template');
checkDirectory('public', 'Public directory');
checkDirectory('public/css', 'CSS directory');
checkFile('public/css/style.css', 'Custom styles');
checkDirectory('public/js', 'JavaScript directory');
checkFile('public/js/main.js', 'Main JavaScript');
checkFile('public/js/auth.js', 'Auth JavaScript');
checkFile('public/js/dashboard.js', 'Dashboard JavaScript');

// Check documentation
console.log('\n📚 Documentation:');
checkFile('README.md', 'Main documentation');
checkFile('QUICK_START.md', 'Quick start guide');
checkFile('SETUP.md', 'Setup guide');
checkFile('START_HERE.md', 'Getting started guide');
checkFile('PROJECT_SUMMARY.md', 'Project summary');

// Try to read package.json to check for dependencies
console.log('\n📦 Checking package.json:');
try {
  const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
  
  console.log(`✅ Package name: ${pkg.name}`);
  console.log(`✅ Node type: ${pkg.type}`);
  console.log(`✅ Dependencies: ${Object.keys(pkg.dependencies || {}).length}`);
  console.log(`✅ Dev dependencies: ${Object.keys(pkg.devDependencies || {}).length}`);
  
  // Check for required dependencies
  const requiredDeps = [
    'express',
    'mongoose',
    'passport',
    'passport-google-oauth20',
    'passport-local',
    'jsonwebtoken',
    'bcryptjs',
    'express-validator',
    'dotenv',
    'helmet',
    'express-rate-limit'
  ];
  
  console.log('\n📋 Checking required dependencies:');
  let missingDeps = 0;
  requiredDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ⚠️  ${dep} - Install with: npm install`);
      missingDeps++;
    }
  });
  
  if (missingDeps === 0) {
    checks.passed++;
    console.log('\n✅ All dependencies are defined in package.json');
  } else {
    checks.failed++;
    console.log(`\n⚠️  ${missingDeps} dependencies need to be installed`);
  }
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Verification Summary:\n');
console.log(`   Passed: ${checks.passed}`);
console.log(`   Failed: ${checks.failed}`);
console.log(`   Total:  ${checks.passed + checks.failed}\n`);

if (checks.failed === 0) {
  console.log('🎉 All checks passed! Your WebLauncher project is ready.\n');
  console.log('📝 Next steps:');
  console.log('   1. Run: npm install');
  console.log('   2. Copy: env.example to .env');
  console.log('   3. Edit .env with your configuration');
  console.log('   4. Run: npm run dev');
  console.log('\n🚀 Happy coding!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please review the issues above.\n');
  checks.messages.forEach(msg => console.log(`   ${msg}`));
  process.exit(1);
}

