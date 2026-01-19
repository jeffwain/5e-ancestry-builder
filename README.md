# 5E Ancestry Builder

A custom ancestry (species) builder for D&D 5th Edition, allowing you to create unique ancestries using a point-buy system or pre-built templates.

## Disclaimers

This tool was built with the help of generative AI for overall functionality and testing. However, most of the refinement and styling has been done by hand. Without it I wouldn't have been able to build this tool on my own (yes, I've tried twice).

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

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

The application uses a local JSON file of trait data.

## Development

### Project Structure

- `/src/api` - API and data fetching logic
- `/src/components` - Reusable UI components
- `/src/contexts` - React contexts for state management
- `/src/hooks` - Custom React hooks
- `/src/pages` - Page components
- `/src/utils` - Utility functions
- `/public/data` - Exported data files