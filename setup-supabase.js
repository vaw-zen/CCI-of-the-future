#!/usr/bin/env node

/**
 * Supabase Setup Script
 * Run this script to help configure your Supabase integration
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 CCI Services - Supabase Setup');
console.log('=====================================');
console.log('This script will help you configure your Supabase integration.\n');

const questions = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    question: 'Enter your Supabase Project URL (e.g., https://xxxxx.supabase.co): ',
    validate: (url) => url.startsWith('https://') && url.includes('.supabase.co')
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    question: 'Enter your Supabase Anon/Public Key: ',
    validate: (key) => key.length > 50
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    question: 'Enter your Supabase Service Role Key (keep this secret!): ',
    validate: (key) => key.length > 50
  }
];

async function askQuestion(questionObj) {
  return new Promise((resolve) => {
    const ask = () => {
      rl.question(questionObj.question, (answer) => {
        if (questionObj.validate && !questionObj.validate(answer.trim())) {
          console.log('❌ Invalid input. Please try again.');
          ask();
        } else {
          resolve(answer.trim());
        }
      });
    };
    ask();
  });
}

async function main() {
  try {
    const answers = {};
    
    for (const questionObj of questions) {
      answers[questionObj.key] = await askQuestion(questionObj);
    }

    // Read current .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add Supabase variables
    for (const [key, value] of Object.entries(answers)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += envContent.endsWith('\n') ? '' : '\n';
        envContent += `${newLine}\n`;
      }
    }

    // Write back to .env.local
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Supabase configuration updated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open the SQL Editor');
    console.log('3. Copy and paste the contents of supabase/schema.sql');
    console.log('4. Execute the SQL to create the database tables');
    console.log('5. Restart your development server: npm run dev');
    console.log('\n🎉 Your devis forms will now save to Supabase and send email notifications!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}