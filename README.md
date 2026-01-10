# 5E Ancestry Builder

A custom ancestry builder for the 5th Edition tabletop role-playing game, allowing you to create unique characters using a point-buy system or pre-built ancestries.

## Features

- Custom ancestry builder using a 16-point budget
- Pre-built ancestry options with multiple forms
- Save and manage multiple character lineages
- Integration with Notion for data management

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Notion API key (if you want to use real Notion data)

### Installation

1. Clone the repository
2. Install dependencies
```bash
npm install
```
3. Run the development server
```bash
npm run dev
```

## Data Sources

The application supports three data sources for ancestries, traits, and spells:

1. **Mock Data**: Built-in mock data for development
2. **Local Exported Data**: Exported Notion data saved as a local JSON file
3. **Direct Notion API**: Direct connection to Notion (requires a server-side proxy in production)

### Using Notion Data

To use real data from Notion:

1. Set up a Notion integration and share your databases/pages with it
2. Create a `.env` file with the necessary variables:

For database-based data:
```
NOTION_API_KEY=your_notion_api_key
NOTION_TRAITS_DB_ID=your_traits_database_id
NOTION_SPELLS_DB_ID=your_spells_database_id
```

For page-based ancestries and archetypes:
```
NOTION_ANCESTRY_PAGES=comma,separated,list,of,page,ids
NOTION_ARCHETYPE_PAGES=comma,separated,list,of,page,ids
```

For using a custom JSON file:
```
CUSTOM_JSON_PATH=./path/to/your/data.json
```

3. Export the data from Notion:
```bash
npm run export-notion
```
4. Update the data source in `src/hooks/useNotionData.js`:
```js
const DATA_SOURCE = 'local'; // Options: 'notion', 'local', 'mock'
```

## Development

### Project Structure

- `/src/api` - API and data fetching logic
- `/src/components` - Reusable UI components
- `/src/contexts` - React contexts for state management
- `/src/hooks` - Custom React hooks
- `/src/pages` - Page components
- `/src/utils` - Utility functions
- `/public/data` - Exported data files

### Export Workflow

The application includes utilities to export data from Notion to a local JSON file:

1. `src/utils/notionExporter.js` - Utility to export Notion data
2. `scripts/export-notion-data.js` - Script to run the exporter
3. `src/api/notionLocalData.js` - API to use the exported data

This approach avoids CORS issues that would occur when trying to connect directly to the Notion API from the browser.

## Technologies Used

- React - UI library
- Vite - Build tool and development server
- React Router - Page routing
- Tailwind CSS - Styling
- Notion API - Data storage and retrieval

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the custom ancestry creation rules for 5th Edition tabletop roleplaying games
- Utilizes the Notion API for flexible data management
