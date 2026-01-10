// Script to export data from Notion to a local JSON file
import dotenv from 'dotenv';
import { exportNotionData } from '../src/utils/notionExporter.js';

// Load environment variables
dotenv.config();

// Run the export
console.log('Starting Notion data export...');
exportNotionData()
  .then((outputPath) => {
    console.log(`✅ Export completed successfully! File saved to: ${outputPath}`);
    console.log('You can now use this data in your application without connecting to Notion API directly.');
  })
  .catch((error) => {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }); 