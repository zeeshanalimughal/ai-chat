#!/usr/bin/env node

/**
 * Environment validation script
 * Checks if API keys are properly configured
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('🔍 Checking environment configuration...\n');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env.local file not found!');
  console.log('\n📝 Please create a .env.local file with your API keys:');
  console.log('   Copy .env.local.example to .env.local');
  console.log('   Then add your API keys from:');
  console.log('   - OpenAI: https://platform.openai.com/api-keys');
  console.log('   - Google AI: https://makersuite.google.com/app/apikey');
  console.log('\n💡 You only need at least ONE API key to use the app.\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

const keys = {
  OPENAI_API_KEY: false,
  GOOGLE_AI_API_KEY: false,
};

lines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && keys.hasOwnProperty(key.trim())) {
    const val = value?.trim();
    if (val && val !== 'your_openai_api_key_here' && val !== 'your_google_ai_api_key_here') {
      keys[key.trim()] = true;
    }
  }
});

const configuredKeys = Object.entries(keys).filter(([_, v]) => v);

if (configuredKeys.length === 0) {
  console.log('❌ No API keys configured!');
  console.log('\n📝 Please add at least one API key to .env.local');
  console.log('   Available providers:');
  console.log('   - OPENAI_API_KEY for GPT models');
  console.log('   - GOOGLE_AI_API_KEY for Gemini models\n');
  process.exit(1);
}

console.log('✅ Environment configuration looks good!\n');
console.log('📊 Configured providers:');
configuredKeys.forEach(([key]) => {
  const provider = key.replace('_API_KEY', '').toLowerCase();
  console.log(`   ✓ ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
});

console.log('\n🚀 You can now run: npm run dev\n');
