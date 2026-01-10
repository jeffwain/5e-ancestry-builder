import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the primary output filename - this needs to match what we're looking for in the data loader
const primaryFilename = 'hightouch; The Dice Monster\'s Ancestries.json';
const outputPath = path.resolve(__dirname, '../public/data/', primaryFilename);

// Create a simple sample data structure that works with our parser
const sampleData = {
  "ancestries": [
    {
      "name": "Human",
      "ancestry_traits": [
        {
          "name": "Adaptable",
          "description": "Humans receive a free 1st-tier ancestry feat at 1st level."
        },
        {
          "name": "Natural Ambition",
          "description": "Humans are naturally ambitious, and can gain an additional class feat at 1st level."
        },
        {
          "name": "Skilled",
          "description": "Humans gain an additional skill feat at 1st level and every 2 levels thereafter."
        }
      ],
      "archetypes": [
        {
          "name": "Scholar",
          "traits": [
            {
              "name": "Scholarly Aptitude",
              "description": "You gain a +1 bonus to all Knowledge skill checks."
            },
            {
              "name": "Lore Master",
              "description": "Once per day, you can re-roll a failed Knowledge check."
            }
          ]
        },
        {
          "name": "Warrior",
          "traits": [
            {
              "name": "Combat Training",
              "description": "You gain proficiency with all martial weapons."
            },
            {
              "name": "Battle Hardened",
              "description": "You gain a +1 bonus to all saving throws against fear effects."
            }
          ]
        }
      ]
    },
    {
      "name": "Elf",
      "ancestry_traits": [
        {
          "name": "Keen Senses",
          "description": "Elves gain a +2 bonus to Perception checks."
        },
        {
          "name": "Elven Magic",
          "description": "Elves gain a +2 bonus to saves against magical effects."
        },
        {
          "name": "Long-lived",
          "description": "Elves live for centuries, giving them a broad perspective on history and events."
        }
      ],
      "archetypes": [
        {
          "name": "Woodland",
          "traits": [
            {
              "name": "Forest Affinity",
              "description": "You gain a +2 bonus to Survival checks in forest environments."
            },
            {
              "name": "Swift",
              "description": "Your base speed increases by 5 feet."
            }
          ]
        }
      ]
    },
    {
      "name": "Dwarf",
      "ancestry_traits": [
        {
          "name": "Sturdy",
          "description": "Dwarves gain a +2 bonus to saves against poisons."
        },
        {
          "name": "Darkvision",
          "description": "Dwarves can see in darkness up to 60 feet."
        },
        {
          "name": "Stonecunning",
          "description": "Dwarves gain a +2 bonus to knowledge checks related to stone or metal."
        }
      ],
      "archetypes": [
        {
          "name": "Mountain",
          "traits": [
            {
              "name": "Hardy",
              "description": "You gain 1 additional hit point per level."
            },
            {
              "name": "Stone Resistance",
              "description": "You gain resistance 5 to acid damage."
            }
          ]
        }
      ]
    }
  ]
};

// Create the directory if it doesn't exist
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write the sample data to the file
fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));

// Also create an alternative named file for compatibility
const altOutputPath = path.resolve(__dirname, '../public/data/The Dice Monster\'s Ancestries.json');
fs.writeFileSync(altOutputPath, JSON.stringify(sampleData, null, 2));

console.log(`✅ Created sample ancestries file at: ${outputPath}`);
console.log(`✅ Also created a copy at: ${altOutputPath} for maximum compatibility`);
console.log(`To use this sample data, set DATA_SOURCE to "dice-monster" in src/hooks/useNotionData.js`); 