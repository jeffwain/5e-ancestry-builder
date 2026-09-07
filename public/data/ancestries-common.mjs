// Common ancestries — see ./README.md for the reference format.

const MEDIUM_OR_SMALL = ['size-medium', 'size-small'];

export default [
  {
    id: 'humans',
    name: 'Humans',
    type: 'Common ancestry',
    notion: 'https://app.notion.com/p/873e5832070244358a821027a745e0e1',
    summary:
      'Varied and diverse, humans are the most populous humanoid creatures due to their resiliency and creativity.',
    description:
      'Humans are as varied and diverse as the lands they occupy, and are the most populous humanoid creatures in the world due to their resiliency and creativity. All humans gain the following traits, and the traits from the biome in which you were raised or spent the most time.',
    shared: [...MEDIUM_OR_SMALL, 'endurance', 'creativity'],
    archetypes: [
      {
        id: 'plains',
        name: 'Plains',
        traits: [
          'native-environment:grassland',
          ['quick-learner', { name: 'Expert', note: 'Notion: "Expert (4)"; curated equivalent is Quick Learner (4)' }],
          'friendly-cultural-skill:socializer',
        ],
      },
      {
        id: 'arctic',
        name: 'Arctic',
        traits: [
          'native-environment:arctic',
          ['natural-movement', { note: 'was a bespoke "Traversal (1)" whose wording matches Natural Movement' }],
          ['aquatic-resistance', { description: 'You have resistance to cold damage.' }],
          'survival-training',
        ],
      },
      {
        id: 'coastal',
        name: 'Coastal',
        traits: [
          'native-environment:coastal',
          'swim-speed',
          'weather-worn',
          'waterborne-tool-proficiency',
        ],
      },
      {
        id: 'deep',
        name: 'Deep',
        traits: ['native-environment:subterranean', 'brave', 'toxin-resilience'],
      },
      {
        id: 'desert',
        name: 'Desert',
        traits: [
          'native-environment:desert',
          ['hardy', { description: 'You are acclimated to extreme climates and do not suffer the effects of extreme heat above 100 degrees Fahrenheit.' }],
          'survivalist-cultural-skill:survivalist-skill',
          ['natural-movement', { note: 'was a bespoke "Traversal (1)"' }],
          'survival-training',
        ],
      },
      {
        id: 'mountain',
        name: 'Mountain',
        traits: [
          'native-environment:hill-mountain',
          ['natural-movement', { note: 'was a bespoke "Traversal (1)"' }],
          'powerful-build',
          ['hardy', { description: 'You are acclimated to extreme climates and do not suffer the effects of high altitudes above 10,000 ft.' }],
          ['climb-speed', { name: 'Climber', description: 'You have a climbing speed of 25 feet. You have advantage on ability checks made to climb, avoid falling while climbing, and helping others while climbing.' }],
        ],
      },
      {
        id: 'swamp',
        name: 'Swamp',
        traits: [
          'native-environment:swamp',
          'toxin-resilience',
          'survival-training',
          ['natural-movement', { points: 0, note: 'Notion prices Swamp’s Traversal at 0, unlike the other biomes' }],
        ],
      },
    ],
  },

  {
    id: 'dwarves',
    name: 'Dwarves',
    type: 'Common ancestry',
    notion: 'https://app.notion.com/p/40e0f6f8751348c8a4f0cc3a87753e5a',
    summary: 'Smaller but no less physically capable than other humanoids, and unmatched at the artisan’s bench.',
    description:
      'Dwarves are usually around 3.5 to 4.5 feet tall, weighing between 100-225 pounds. They are smaller but no less physically capable than other humanoids. Ever since the arrival of goblins on Eora, the dwarves have been locked in constant struggle with them.',
    shared: [...MEDIUM_OR_SMALL, 'artisan-cultural-skill:artisans-lore', 'artisan-tool-proficiency', 'skilled-artistry'],
    archetypes: [
      {
        id: 'stonebreaker',
        name: 'Stonebreaker',
        traits: ['strong', 'stout-build', 'artisan-tool-proficiency', 'quick-learner', 'warrior-cultural-skill:combat-training', 'martial-training'],
      },
      {
        id: 'steppemaster',
        name: 'Steppemaster',
        traits: [
          'nimble',
          'small-stealth',
          'artisan-cultural-skill:artisans-lore',
          'skilled-artistry',
          'friendly-cultural-skill:empathic',
          ['friendly-tool-proficiency', { description: 'You gain proficiency with one type of gaming set, musical instrument of your choice, Cook’s Utensils, or Herbalism Kit.' }],
          'lucky',
        ],
      },
      {
        id: 'lightbringer',
        name: 'Lightbringer',
        traits: [
          'toxin-resilience',
          'poison-resistance',
          'artisan-tool-proficiency',
          'artisan-cultural-skill:artisans-lore',
          'skilled-artistry',
          ['psychic-defense', { name: 'Psychic Resistance', note: 'Notion calls this "Psychic Resistance (2)". The curated trait carrying that exact wording is Psychic Defense (2) — not Psionic Resistance (3), which revision 1 wrongly mapped it to.' }],
          'traversal',
        ],
      },
      { id: 'vineguard', name: 'Vineguard', traits: ['skilled-combatant:nimble-escape'] },
      {
        id: 'wavetamer',
        name: 'Wavetamer',
        traits: ['finesse-training', 'waterborne-tool-proficiency', 'waterborne-cultural-skill:mariners-lore', 'swim-speed'],
      },
      {
        id: 'skyrider',
        name: 'Skyrider',
        designed: true,
        traits: ['hardy', 'climb-speed', 'flight:glide', 'survivalist-skill-proficiency', 'quick-learner', 'traversal'],
      },
      {
        id: 'frostbeard',
        name: 'Frostbeard',
        designed: true,
        traits: [
          'native-environment:arctic',
          'natural-movement',
          ['aquatic-resistance', { description: 'You have resistance to cold damage.' }],
          'stout-build',
          'sturdy:toughness',
          'survival-training',
          ['hardy', { description: 'You are acclimated to extreme climates and do not suffer the effects of extreme cold below 0 degrees Fahrenheit.' }],
        ],
      },
      {
        id: 'ashbearer',
        name: 'Ashbearer',
        designed: true,
        traits: [
          'elemental-attunement:fire',
          'elemental-strike:fire',
          ['hardy', { description: 'You are acclimated to extreme climates and do not suffer the effects of extreme heat above 100 degrees Fahrenheit.' }],
          'unending-breath',
          'stout-build',
          'martial-training',
          'warrior-cultural-skill:weaponsmith',
          'traversal',
        ],
      },
      {
        id: 'muckmolder',
        name: 'Muckmolder',
        designed: true,
        traits: [
          'native-environment:swamp',
          'natural-movement',
          'toxin-resilience',
          'poison-resistance',
          'survival-training',
          'swim-speed',
          'hold-breath',
          'weather-worn',
          'survivalist-cultural-skill:survivalist-skill',
        ],
      },
    ],
  },

  {
    id: 'half-giants',
    name: 'Half-giants',
    type: 'Common ancestry',
    notion: 'https://app.notion.com/p/f2f99104273e4cf98162fc08c81f4b42',
    summary: 'Mortals carrying the blood of giants, built on a heavier frame than their neighbours.',
    description:
      'All half-giant characters must take at least one trait from the Stout ancestry and traits from their giant ancestry, plus the shared traits below.',
    shared: ['size-medium', 'powerful-build'],
    archetypes: [
      {
        id: 'frost-giant',
        name: 'Frost giant',
        traits: [
          'sturdy:durable',
          ['elemental-attunement:water', { name: 'Water' }],
          ['elemental-strike:water', { name: 'Elemental Strike, Cold', description: 'When you damage a creature with an attack, you can cause the attack to deal extra cold damage equal to 1d4 + your Proficiency Bonus, and reduce the target’s Speed by 10 feet until the start of your next turn. This trait can be used a number of times equal to your Proficiency Bonus per long rest.' }],
          'survivalist-skill-proficiency',
          'traversal',
          'survivalist-cultural-skill:acclimatization',
        ],
      },
    ],
  },
];
