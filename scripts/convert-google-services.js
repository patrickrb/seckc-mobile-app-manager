#!/usr/bin/env node

/**
 * Utility script to convert google-services.json to environment variables
 * Usage: node scripts/convert-google-services.js path/to/google-services.json
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node scripts/convert-google-services.js path/to/google-services.json');
  process.exit(1);
}

const googleServicesPath = process.argv[2];

if (!fs.existsSync(googleServicesPath)) {
  console.error(`File not found: ${googleServicesPath}`);
  process.exit(1);
}

try {
  const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
  const client = googleServices.client[0];
  
  const envVars = `# Firebase Configuration from google-services.json
NEXT_PUBLIC_FIREBASE_API_KEY=${client.api_key[0].current_key}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${googleServices.project_info.project_id}.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${googleServices.project_info.project_id}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${googleServices.project_info.storage_bucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${googleServices.project_info.project_number}
NEXT_PUBLIC_FIREBASE_APP_ID=${client.client_info.mobilesdk_app_id}`;

  // Write to .env.local
  fs.writeFileSync('.env.local', envVars);
  
  console.log('✅ Environment variables have been written to .env.local');
  console.log('\nGenerated configuration:');
  console.log(envVars);
  
} catch (error) {
  console.error('Error processing google-services.json:', error.message);
  process.exit(1);
}