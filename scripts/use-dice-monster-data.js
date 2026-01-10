import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use createRequire to simulate require() in ES modules
const require = createRequire(import.meta.url);

// Get the directory of the current script
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default source and destination paths
const defaultSourcePath = process.env.DICE_MONSTER_JSON_PATH || './Ancestries.json';

// The target filename (this must match what we're trying to load in diceMonsterData.js)
const targetFilename = 'hightouch; The Dice Monster\'s Ancestries.json';
const destinationPath = path.resolve(__dirname, '../public/data/', targetFilename);

// Get source path from command line args if provided
const sourcePath = process.argv[2] || defaultSourcePath;

// Main function
async function copyDiceMonsterData() {
  try {
    console.log(`🔍 Looking for The Dice Monster's Ancestries.json file at: ${sourcePath}`);

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ File not found: ${sourcePath}`);
      console.log('Please provide the correct path to the Ancestries.json file as an argument:');
      console.log('npm run use-dice-monster -- /path/to/Ancestries.json');
      process.exit(1);
    }

    // Ensure the destination directory exists
    const destinationDir = path.dirname(destinationPath);
    fs.mkdirSync(destinationDir, { recursive: true });

    // Read source file
    const data = fs.readFileSync(sourcePath, 'utf8');

    // Try to validate JSON and print useful diagnostic information
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ JSON validation successful');
      console.log('File structure:', Object.keys(jsonData).join(', '));

      // Basic structure validation
      let hasAncestries = false;
      if (Array.isArray(jsonData.ancestries)) {
        hasAncestries = jsonData.ancestries.length > 0;
      } else if (Array.isArray(jsonData.Ancestries)) {
        hasAncestries = jsonData.Ancestries.length > 0;
      } else if (Array.isArray(jsonData)) {
        hasAncestries = jsonData.length > 0;
      } else {
        // Check if any property is an array
        for (const key in jsonData) {
          if (Array.isArray(jsonData[key]) && jsonData[key].length > 0) {
            hasAncestries = true;
            break;
          }
        }
      }

      if (!hasAncestries) {
        console.warn('⚠️ Warning: File may not contain ancestry data. Please check the structure.');
      }
    } catch (error) {
      console.error('❌ The source file is not valid JSON:', error.message);
      console.error('First 100 characters:', data.substring(0, 100));
      process.exit(1);
    }

    // Copy the file
    fs.writeFileSync(destinationPath, data);

    console.log(`✅ Successfully copied to: ${destinationPath}`);
    console.log('To use this data source, make sure the DATA_SOURCE in src/hooks/useNotionData.js is set to "dice-monster"');

    // Also create a second copy with the alternative name for compatibility
    const altPath = path.resolve(__dirname, '../public/data/The Dice Monster\'s Ancestries.json');
    fs.writeFileSync(altPath, data);
    console.log(`✅ Also created a copy at: ${altPath} for maximum compatibility`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
copyDiceMonsterData(); 