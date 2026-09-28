// Uncommon ancestries — see ./README.md for the reference format.
// `[null, {...}]` declares an inline trait that has no curated equivalent.

const MEDIUM_OR_SMALL = ['size-medium', 'size-small'];

export default [
  {
    id: 'elves',
    name: 'Elves',
    subtitle: 'Long-lived and elegant, hidden in ancient forests.',
    type: 'Uncommon ancestry',
    notion: 'https://app.notion.com/p/e15c26beb7b845edbb5a5ec39cc3a0d6',
    summary: 'Elegant, long-lived and forest-bound, with a reputation they cultivate on purpose.',
    description:
      'Elegant, slender and tall, elves could almost be mistaken for humans at a glance. Their fortitude and cultural tendency of keeping themselves hidden within their ancient forests allow them to live inordinately long lives. All elves have the following traits, plus one matching their forest home.',
    shared: [
      'size-medium', 'speed-quick', 'trance', 'fey-cantrip', 'charm-resistance',
      [null, { name: 'Corpse Eater', points: 2, description: 'You can consume a piece of a recently deceased humanoid’s flesh to get a glimpse of its memories. If the corpse is over 5 days old you have a 50% chance of contracting a disease or poison from the DM and gaining no memories.' }],
      'skirmisher-cultural-skill:combat-awareness',
    ],
    archetypes: [
      {
        id: 'boreal',
        name: 'Boreal',
        traits: [
          'native-environment:forest',
          ['out-of-sight', { note: 'Notion annotates "1, was 2". A rider here, not a core stealth feature, so 1 stands.' }],
          'keen-senses-proficiency',
          'climb-speed',
        ],
      },
      { id: 'old-growth', name: 'Old growth', traits: ['shadow-magic', 'greater-fey-magic'] },
      { id: 'primeval', name: 'Primeval', traits: ['magic-resistance'] },
      {
        id: 'jungle',
        name: 'Jungle',
        traits: ['native-environment:forest', 'traversal', ['survivalist-skill-proficiency', { description: 'You have proficiency in the Athletics skill.' }], 'traversal'],
        notes: ['Notion lists Traversal twice in this archetype; the duplicate is dropped.'],
      },
      {
        id: 'desert',
        name: 'Desert',
        designed: true,
        traits: [
          'native-environment:desert',
          'hardy',
          'survivalist-cultural-skill:survivalist-skill',
          'natural-movement',
          'out-of-sight',
          [null, { name: "Sandswimmer", points: 2, description: "While in sand, you have a 15 ft burrowing speed, tremorsense out to 120 ft., and can breathe normally." }],
        ],
      },
    ],
  },

  {
    id: 'gnomes',
    name: 'Gnomes',
    subtitle: 'Fey wanderers who must keep dreaming or fade.',
    type: 'Uncommon ancestry',
    notion: 'https://app.notion.com/p/00a6d8270ff04dc9b991c30f4ba60ce7',
    summary: 'Fey emigrants staving off the Bleaching with novelty and obsession.',
    description:
      'Long ago, early gnome ancestors emigrated from the First World, realm of the fey. Always hungry for new experiences, gnomes constantly wander both mentally and physically, attempting to stave off the Bleaching — an affliction that strikes gnomes who fail to dream, innovate, and take in new experiences.',
    shared: ['size-small'],
    archetypes: [
      { id: 'inventor', name: 'Inventor', traits: ['magic-resistance', 'artisan-cultural-skill:tinkerer', 'artisan-cultural-skill:artisans-lore', 'artisan-tool-proficiency', 'artisan-cultural-skill:gifted-artisan', 'skilled-artistry'] },
      { id: 'traveler', name: 'Traveler', traits: ['greater-magic-resistance', 'friendly-cultural-skill:socializer', 'fey-cantrip', 'fey-magic'] },
      { id: 'discoverer', name: 'Discoverer', traits: ['greater-magic-resistance', 'survivalist-cultural-skill:beast-tracker', 'speech-beast-leaf', ['out-of-sight', { note: 'Notion annotates "1, was 2"; a rider here' }]] },
      { id: 'seafarer', name: 'Seafarer', traits: ['greater-magic-resistance', 'swim-speed', 'waterborne-cultural-skill:fishermens-tales', 'weather-worn'] },
      { id: 'deep-traveler', name: 'Deep traveler', traits: ['fey-cantrip', 'magic-resistance', 'fey-magic', 'telepathy'] },
    ],
    notes: ['Notion lists Tinkerer, Artisan’s Lore and Gifted Artisan as separate traits on Inventor; all three are options of the same Artisan Cultural Skill, so the builder keeps them as distinct references and the total reflects Notion.'],
  },

  {
    id: 'goblin',
    name: 'Goblin',
    subtitle: 'An alien species whose forms are stages of one life.',
    type: 'Uncommon ancestry',
    notion: 'https://app.notion.com/p/ade731c6a91c4c789fae1140e1589250',
    summary: 'An alien species whose several forms are life stages of one creature.',
    description:
      'Goblinoids are an alien species and while not kith are similar in body plan and structure. The multiple forms of goblinoid are life stages of a single species. All goblinoid characters must take at least two traits from a heritage matching their environment, one stealth-oriented trait from Shadowborn or Stout, and one Skirmisher trait.',
    shared: [],
    archetypes: [
      {
        id: 'goblin',
        name: 'Goblin',
        traits: [
          'size-small',
          'tooth-nail:bite', 'traversal', 'skirmisher-cultural-skill:combat-awareness', 'climb-speed',
          ['out-of-sight', { points: 2, note: 'Goblin is a stealth-based ancestry — Out of Sight sits alongside Ambush and Nimble Escape as a core feature, so it is priced at 2 per the core/rider rule. Notion already prices it at 2 here.' }],
          'skilled-combatant:ambush', 'skilled-combatant:nimble-escape',
        ],
      },
      {
        id: 'hobgoblin',
        name: 'Hobgoblin',
        traits: [
          'size-medium',
          'darkvision-60', 'skirmisher-cultural-skill:combat-awareness', 'brave', 'creativity', 'artisan-tool-proficiency',
          [null, { name: 'The Guiding Arts', points: 2, description: 'You have proficiency in one of the following skills of your choice: History, Medicine, Performance, or Persuasion.' }],
          'martial-training',
        ],
        notes: ['Notion offers a final choice of Finesse Training, Martial Training or Skilled, all at 2. Martial Training is carried as the default.'],
      },
      {
        id: 'moglin',
        name: 'Moglin',
        traits: [
          'size-medium',
          'powerful-build', 'close-to-death', 'sturdy:relentless', 'brave', 'lethal-strike',
          'skilled-combatant:charge', 'tooth-nail:bite',
        ],
      },
      {
        id: 'og',
        name: 'Og',
        designed: true,
        traits: ['size-medium', 'powerful-build', 'reach', 'strong', 'sturdy:relentless', 'tooth-nail:natural-strength'],
      },
    ],
  },
];
