// Awakened ancestries — see ./README.md for the reference format.
// `[null, {...}]` declares an inline trait that has no curated equivalent.
//
// Every animal-like people, each subtitled with a plain "-folk" descriptor.

const MEDIUM_OR_SMALL = ['size-medium', 'size-small'];

export default [
  // ── Grung page: two lineages live here ────────────────────────────────────
  {
    id: 'grung',
    name: 'Grung',
    subtitle: 'Frogfolk',
    type: 'Awakened (Uncommon) ancestry',
    descriptors: 'Amphibian species',
    notion: 'https://app.notion.com/p/e3e068d78f524fba9bf78a2790d36ba2',
    summary: 'Small, brightly coloured frogkin, at home in water and canopy alike.',
    description:
      'All grung characters are size small, have at least one trait from the Aquatic ancestry, and at least one trait from the Reptilian ancestry.',
    shared: ['size-small', 'darkvision-60', 'amphibious', 'swim-speed', 'emissary-sea', 'leap'],
    archetypes: [
      {
        id: 'croak',
        name: 'Croak',
        traits: [
          [null, { name: 'Thunderous Croak', points: 6, description: 'When you take the Attack action, you can replace one of your attacks with an exhalation of sonic energy in a 60-foot cone. Each creature in the area must make a Dexterity saving throw of DC 8 + your Constitution modifier + your Proficiency Bonus. On a failed save, a creature takes 1d10 thunder damage and is [deafened]() for 1 minute. On a success, a creature takes half as much thunder damage and isn’t deafened. This damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10). At the end of each of its turns, a deafened creature can make another Constitution saving throw, ending the effect on a success. After you use your croak, you can’t use it again until you finish a short or long rest.' }],
        ],
      },
      {
        id: 'tongue',
        name: 'Tongue',
        traits: [
          [null, { name: 'Tongue', points: 3, description: 'Your tongue can make damaging unarmed strikes as a light weapon with a reach of 10 feet. When you hit with it, the strike deals 1d6 + Strength modifier bludgeoning damage.' }],
          ['prehensile-limb:trunk', { name: 'Prehensile Limb, Tongue', description: 'Your tongue can perform simple tasks with a reach of 10 feet: lift, drop, hold, push, or pull an object or a creature; open or close a door or a container; grapple a creature your size or smaller; or make an unarmed strike.' }],
          'hold-breath',
        ],
      },
      {
        id: 'poisonous',
        name: 'Poisonous',
        traits: [
          'defensive-feature:poisonous',
          [null, { name: 'Hypnotic Blood', points: 2, description: 'Your blood contains a natural toxin. When you take piercing or slashing damage as the result of an unarmed attack, such as from a bite or claw attack, you can use your reaction to force that creature to make a Constitution saving throw. The DC for this saving throw equals 8 + your Constitution modifier + your Proficiency Bonus. On a failed save, a creature is poisoned until the end of your next turn. A creature that’s been poisoned in this way or succeeds on the saving throw against it is immune to this effect for 24 hours. You can use this feature a number of times equal to your Proficiency Bonus and regain all expended uses of it when you finish a long rest.' }],
        ],
      },
    ],
  },

  {
    id: 'atxayotl',
    name: 'Atxayotl',
    subtitle: 'Axolotlfolk',
    type: 'Awakened (Uncommon) ancestry',
    descriptors: 'Axolotlkin',
    notion: 'https://app.notion.com/p/e3e068d78f524fba9bf78a2790d36ba2',
    summary: 'Axolotlkin regrow what they lose, and shift form with the water they live in.',
    description:
      'A shifting amphibious folk. Lagoon atxayotl must fully immerse themselves in water for at least 1 hour per week or they transform into Landbound; Landbound transform back after 24 hours immersed.',
    shared: [
      ...MEDIUM_OR_SMALL,
      'swim-speed',
      ['survivalist-skill-proficiency', { description: 'You have proficiency in one of the following skills of your choice: Nature, Persuasion, Survival.' }],
      'regeneration',
      ['regrowth', { points: 0, name: 'Limb Regrowth', description: 'You are incapable of scarring, regenerating the damaged tissue instead. Disfiguring scars fully heal themselves after you complete a long rest. Major injuries such as missing limbs or eyes heal themselves after 1 week.', note: 'Notion leaves this unpriced; the curated Regrowth (1) is faster, so this slower version is carried at 0' }],
      [null, { name: 'Environmental Adaptation', points: 0, description: 'Lagoon Atxayotls must fully immerse themselves in water for at least 1 hour per week, or they transform into Landbound Atxayotls. Landbound transform into Lagoon after 24 hours immersed in water.' }],
    ],
    archetypes: [
      { id: 'lagoon', name: 'Lagoon', traits: ['amphibious', ['sea-legs', { description: 'You have advantage on Dexterity (Acrobatics) checks, and checks to be knocked prone from effects other than attacks.' }]] },
      {
        id: 'landbound',
        name: 'Landbound',
        traits: [
          'climb-speed',
          [null, { name: 'Salamander Sprint', points: 5, description: 'You can Dash as a bonus action.' }],
          'streetwise-cultural-skill:bamboozler',
        ],
      },
    ],
  },


  {
    id: 'khenra',
    name: 'Khenra',
    subtitle: 'Jackalfolk',
    type: 'Awakened (Uncommon) ancestry',
    descriptors: 'Canine species, always born with a twin.',
    notion: 'https://app.notion.com/p/830278e8ef94438badb2244743dc776b',
    summary: 'Jackal-headed twins, bonded so closely that losing one remakes the other.',
    description:
      'Nearly every khenra is born a twin, and a pair forms an extremely close emotional bond. The death of one twin causes a tremendous shock to the survivor, who typically grows more aggressive and foolhardy in battle.',
    shared: [
      ...MEDIUM_OR_SMALL,
      'speed-quick',
      [null, { name: 'Vigilant', points: 2, description: 'You have advantage on Perception checks. Instead of being unaware of your surroundings while you are unconscious from being asleep, you have disadvantage on Wisdom (Perception) checks instead.' }],
      'pack-tactics',
    ],
    archetypes: [
      { id: 'twin-alive', name: 'Twin alive', traits: ['lucky'] },
      { id: 'twin-dead', name: 'Twin dead', traits: ['brave', 'shadow-magic'] },
    ],
    notes: ['The builder had invented two extra archetypes, Twin-Bonded and Twin-Severed. Notion defines only these two; the inventions are dropped.'],
  },

  {
    id: 'mrrshan',
    name: 'Mrrshan',
    subtitle: 'Catfolk',
    type: 'Awakened (Common) ancestry',
    descriptors: 'Feline species',
    notion: 'https://app.notion.com/p/bb1c1edf9d2849ecbdfb74ac18d0514e',
    summary: 'Curious, gregarious felinefolk who see themselves as guardians of wild places.',
    description:
      'Mrrshan are a species with feline-like traits and qualities. They commonly resemble large cats of the world, but their patterns and body structures vary as much as any other humanoid.',
    shared: [...MEDIUM_OR_SMALL, 'darkvision-60', 'tooth-nail:claws', 'agile-fall'],
    archetypes: [
      {
        id: 'felis',
        name: 'Felis',
        traits: ['speed-quick', 'climb-speed', 'leap', 'skirmisher-cultural-skill:combat-awareness', 'skilled-combatant:adrenaline-rush'],
        notes: ['The builder called this archetype "Tabaxi". Notion’s name is Felis.'],
      },
      {
        id: 'panthera',
        name: 'Panthera',
        traits: ['roar', 'swiftness', 'warrior-cultural-skill:combat-climber', 'brave'],
      },
    ],
  },

  // ── Muul page: one lineage, six sub-lineages ──────────────────────────────
  {
    id: 'muul',
    name: 'Muul',
    type: 'Awakened (Uncommon) ancestry',
    descriptors: 'Large mammalian species',
    notion: 'https://app.notion.com/p/0fda5ea4290c4fc5854a221ff0b294e8',
    summary: 'The collective term for humanoids shaped like large mammals — bulls, elephants, hippos.',
    description:
      'Originating as a slur, Muul is the collective term for any number of humanoids that take the form of large mammals like bulls, elephants, or hippos.',
    shared: ['size-medium', 'keen-senses-proficiency'],
    sublineages: [
      {
        id: 'auran',
        name: 'Auran',
        subtitle: 'Bullfolk',
        summary: 'Massive humanoids with powerful physiques and the heads of bulls.',
        shared: [
          ['tooth-nail:horns', { name: 'Horns', description: 'Your horns allow you to make damaging unarmed strikes as natural, light weapons. When you hit, a strike deals 1d6 + Strength modifier piercing damage.' }],
          'powerful-build',
          ['menacing:intimidation', { note: 'Was an inline "Imposing Presence" (2) — a skill-choice trait wearing a flavour name. Replaced with the curated Menacing, an option-bearing trait whose Intimidation and Persuasion options are both 2, so the choice and the price both survive. The doc separates plain Menacing from the flavoured Divine Presence (3).' }],
          [null, { name: 'Goring Charge', points: 2, description: 'Immediately after you take the Dash action on your turn and move 15 feet in a straight line, you can make a special attack with your horns as part of the same action. If the attack hits, the target takes bonus piercing damage based on your level: 2d6 at 1st level, 3d6 at 5th level, 4d6 at 11th level, and 5d6 at 17th level. The target takes an additional 1d6 bonus damage if you dashed at least 30 feet in a straight line before making the attack. The target must also make a Strength saving throw, with a DC equal to 8 + your Strength modifier + your Proficiency Bonus. If they fail, they are shoved up to 15 feet and knocked prone. Creatures that are at least two sizes larger than you automatically succeed on this saving throw. Once you use this ability, you can’t use it again until you finish a short or long rest.' }],
        ],
        archetypes: [
          { id: 'wildhorn', name: 'Wildhorn', traits: ['fey-creature', 'survivalist-skill-proficiency', 'skilled-tracker', 'traversal'], notes: ['Notion prices "Skill Proficiency (4)" for two skills; carried as two 2-point curated proficiencies.'] },
          { id: 'abyssal-brood', name: 'Abyssal Brood', traits: [[null, { name: 'Monstrous Ancestry', points: 1, description: 'You can speak, read, and write Abyssal. In addition to Humanoid you are considered a Fiend.' }], 'planar-cantrip', 'natural-magic'] },
          { id: 'seafarer', name: 'Seafarer', traits: ['waterborne-skill-proficiency', [null, { name: 'Rider on the Waves', points: 2, description: 'You gain proficiency with navigator’s tools and vehicles (water).' }], 'swim-speed'] },
          { id: 'labyrinth-born', name: 'Labyrinth-Born', traits: ['darkvision-60', 'survivalist-skill-proficiency', [null, { name: 'Labyrinth Sense', points: 1, description: 'You always know which direction is north, and you have advantage on any Wisdom (Survival) check you make to navigate or track. Additionally, you cannot become lost on any path you have previously traveled.' }]] },
        ],
      },
      {
        id: 'bearkin',
        name: 'Bearkin',
        subtitle: 'Bearfolk',
        summary: 'Broad, heavy-set bearfolk who sleep deep and hit hard.',
        shared: ['darkvision-60'],
        archetypes: [
          {
            id: 'bearkin',
            name: 'Bearkin',
            traits: [
              'tooth-nail:claws',
              [null, { name: 'Deep Slumber', points: 1, description: 'When you take a long rest, you can choose to enter a deep sleep to reduce your exhaustion by 2 instead of 1, but if you are awoken during this sleep, you are [dazed]() for 1d4 rounds.' }],
              'sturdy:toughness', 'stout-build',
            ],
          },
        ],
      },
      {
        id: 'giff',
        name: 'Giff',
        subtitle: 'Hippofolk',
        summary: 'Hippo-headed and immovably strong, with famously poor hearing.',
        shared: [],
        archetypes: [
          {
            id: 'giff',
            name: 'Giff',
            traits: [
              'hold-breath',
              [null, { name: 'Giff Resilience', points: 2, description: 'Giff are resilient, yet have poor hearing. They are resistant to thunder damage, and have advantage on saves against being deafened.' }],
              ['tooth-nail:natural-strength', { description: 'Your natural strength allows you to make damaging unarmed strikes using your head or bite as a natural, light weapon. When you hit with it, the strike deals 1d6 + Strength modifier bludgeoning damage.' }],
              'powerful-build', 'strong', 'sturdy:toughness',
            ],
          },
        ],
      },
      {
        id: 'kashrishi',
        name: 'Kashrishi',
        subtitle: 'Rhinofolk',
        summary: 'Dwarf-sized bipedal rhinoceroses with crystalline horns and inherent psychic powers.',
        description:
          'Kashrishi adapt to their environs with unusual efficiency, using a combination of rapid physical evolutions and inherent psychic powers. They are natural empaths, capable of discerning a creature’s emotional state through proximity.',
        shared: [
          'psionic-cantrip',
          ['tooth-nail:horns', { description: 'Your powerful neck muscles and facial horn allow you to make damaging unarmed strikes as a natural, light weapon. When you hit with it, the strike deals 1d6 + Strength modifier piercing or bludgeoning damage (choose one).' }],
          'brave', 'psionic-magic', 'greater-psionic-magic',
        ],
        archetypes: [
          { id: 'athamasi', name: 'Athamasi', traits: ['climb-speed'] },
          { id: 'lethoci', name: 'Lethoci', traits: ['swim-speed'] },
          { id: 'trogloshi', name: 'Trogloshi', traits: [[null, { name: 'Crystal Luminescence', points: 2, description: 'You can use a bonus action to make your horn glow with bioluminescent color, casting bright light in a 20-foot emanation (and dim light for the next 20 feet). This light can be any color. The light shuts off when you take this bonus action again or fall unconscious.' }]] },
          { id: 'xyloshi', name: 'Xyloshi', traits: [['finesse-training', { description: 'Your physical strength and training allows you to add the finesse property to your horn. The damage it deals is increased to 1d8.' }]] },
        ],
      },
      {
        id: 'loxodon',
        name: 'Loxodon',
        subtitle: 'Elephantfolk',
        summary: 'Elephantine, long-memoried and serene.',
        shared: [],
        archetypes: [
          {
            id: 'loxodon',
            name: 'Loxodon',
            traits: [
              ['tooth-nail:natural-strength', { description: 'Your trunk and tusks allow you to make damaging unarmed strikes as natural, light weapons. Tusks deal 1d6 + Strength modifier bludgeoning damage; your trunk deals 1d4 + Strength modifier bludgeoning damage.' }],
              'prehensile-limb:trunk', 'keen-smell', 'serenity',
              [null, { name: 'Perfect Memory', points: 4, description: 'You have advantage on History checks and can perfectly recall any person you’ve seen, place you’ve visited, and item of note that you’ve studied for over a minute.' }],
            ],
            notes: ['Windwise and Soulwise exist only in the brew file, not in Notion. Dropped.'],
          },
        ],
      },
      {
        id: 'porcein',
        name: 'Porcein',
        subtitle: 'Boarfolk',
        summary: 'Boarfolk of the Muul lineage. Blank in Notion; the traits below are a proposal.',
        shared: [],
        archetypes: [
          {
            id: 'porcein',
            name: 'Porcein',
            designed: true,
            traits: [
              'keen-smell', 'sturdy:toughness', 'stout-build',
              ['tooth-nail:horns', { name: 'Tusks', description: 'Your tusks allow you to make damaging unarmed strikes as natural, light weapons. When you hit, a strike deals 1d6 + Strength modifier piercing damage.' }],
              'survivalist-cultural-skill:beast-tracker', 'survivalist-skill-proficiency',
            ],
          },
        ],
      },
    ],
  },

  // ── Ysoki page: one lineage, four sub-lineages ────────────────────────────
  {
    id: 'ysoki',
    name: 'Ysoki',
    type: 'Awakened (Uncommon) ancestry',
    descriptors: 'Rodent/marsupial-like species',
    notion: 'https://app.notion.com/p/1e501a83c7074ddab5f29b3fa9eea5ae',
    summary: 'The collective name for rodent- and marsupial-like mammalian species.',
    description:
      'Ysoki is the collective name for a number of rodent and marsupial-like mammalian species. They are generally small mammalian species, most commonly resembling rats, mice, hare, and squirrels.',
    shared: [],
    sublineages: [
      {
        id: 'kangaroofolk',
        name: 'Osphrani',
        subtitle: 'Kangaroofolk',
        summary: 'Long-legged marsupial folk who cover ground in bounds.',
        shared: [...MEDIUM_OR_SMALL, 'speed-quick'],
        archetypes: [
          {
            id: 'kangaroofolk',
            name: 'Osphrani',
            traits: [
              [null, { name: 'Strong Kick', points: 2, description: 'Your strong legs and tail allow you to make damaging unarmed strikes as light weapons while balancing on your tail. When you hit with it, a strike deals 1d6 + Strength modifier bludgeoning damage. The target of your attack must make a Strength saving throw (DC 10 + your Strength bonus) or be pushed back 5 feet.' }],
              'leap', 'agile-fall',
              [null, { name: 'Pouch', points: 1, description: 'All osphrani have a pouch on their belly that can either carry one item weighing up to their Strength score, or can serve as a component pouch. You cannot use this feature if your belly is covered or otherwise inaccessible. You have advantage on Dexterity (Sleight of Hand) checks you make to conceal an object in your pouch.' }],
              [null, { name: 'Bounding', points: 4, description: 'As a bonus action, you can jump a number of feet equal to five times your proficiency bonus, without provoking opportunity attacks. You can use this trait only if your speed is greater than 0. You can use it a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest. Additionally, the efficiency of movement your bounding provides means you can move twice the normal time (up to 16 hours) each day before being subject to the effects of a forced march.' }],
              [null, { name: 'Skill Proficiency, Nature', points: 2, description: 'You have proficiency in the Nature skill.' }],
            ],
          },
        ],
      },
      {
        id: 'ratfolk',
        name: 'Ysoki',
        type: 'Awakened (Common) ancestry',
        subtitle: 'Ratfolk',
        summary: 'Skilled scouts and agriculturalists, driven by constant searching.',
        shared: [
          ...MEDIUM_OR_SMALL,
          ['contortion', { name: 'Squeeze', points: 1, description: 'You can squeeze into any space that can be traversed by a creature one size category smaller than you.', note: 'Notion leaves Squeeze unpriced; 1 is what makes the chain sum to 16' }],
          'darkvision-60',
          'artisan-cultural-skill:gifted-artisan',
          'tooth-nail:bite',
          [null, { name: 'Gnaw', points: 0, description: 'With enough time, your teeth can chew through almost anything. Your teeth deal double damage against objects like doors or ropes that are made of wood, fiber, or other natural materials.' }],
          'toxin-resilience',
        ],
        archetypes: [
          { id: 'spotter', name: 'Spotter', traits: ['keen-smell', 'hunters-senses'], notes: ['Notion’s "Hunter’s Senses (7)" is the curated Keen Smell (3) plus Hunter’s Senses (4).'] },
          { id: 'scavenger', name: 'Scavenger', traits: ['keen-smell', 'skirmisher-cultural-skill:trap-master', 'poison-resistance'] },
          { id: 'rural', name: 'Rural', traits: ['keen-smell', 'skilled-agriculturalist', 'cute'] },
        ],
      },
      {
        id: 'rabbitfolk',
        name: 'Harengon',
        subtitle: 'Rabbitfolk',
        summary: 'Small, twitchy and quick off the mark.',
        shared: ['size-small'],
        archetypes: [
          {
            id: 'rabbitfolk',
            name: 'Harengon',
            traits: [
              'leap',
              [null, { name: 'Keen Hearing', points: 3, description: 'You have advantage on Wisdom (Perception) checks that rely on hearing sounds.' }],
              [null, { name: 'Twitchy', points: 3, description: 'You can add 1d4 to your initiative rolls, and while unconscious from sleeping you lose your advantage on Wisdom (Perception) checks that rely on hearing sounds within 60 feet instead of automatically failing them.' }],
              [null, { name: 'Bounding', points: 4, description: 'As a bonus action, you can jump a number of feet equal to five times your proficiency bonus, without provoking opportunity attacks. You can use this trait only if your speed is greater than 0. You can use it a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.' }],
              'keen-senses-proficiency',
              'the-way-my-ma-taught-me',
            ],
            notes: ['The builder had Hare and Rabbit archetypes. Notion defines none; they are dropped.'],
          },
        ],
      },
      {
        id: 'squirrelfolk',
        name: 'Kercpa',
        subtitle: 'Squirrelfolk',
        summary: 'Tiny arboreal folk for whom the canopy is level ground.',
        shared: ['size-small', 'darkvision-60'],
        archetypes: [
          {
            id: 'squirrelfolk',
            name: 'Kercpa',
            traits: [
              'nimble', 'small-stealth', 'tooth-nail:claws', 'climb-speed',
              [null, { name: 'Forager', points: 1, description: 'During a long rest in an abundant environment, you can spend 1 hour gathering enough food to sustain you and 1d4 other creatures for a day.' }],
              ['traversal', { points: 2, description: 'You can move across difficult terrain without expending extra movement if you are using your walking or climbing speed.', note: 'Traversal is a core feature here, not a rider: it covers climbing as well as walking, and arboreal movement is the archetype’s whole identity. Priced at 2 per the core/rider rule.' }],
              'keen-senses-proficiency', 'fury-of-small',
            ],
            notes: ['The builder spelled this "Kcerpa". Notion spells it Kercpa.'],
          },
        ],
      },
    ],
  },

  {
    id: 'aven',
    name: 'Aven',
    subtitle: 'Birdfolk',
    type: 'Awakened (Common) ancestry',
    descriptors: 'Bird-like',
    notion: 'https://app.notion.com/p/77100064c0ba43b28552e1bbe384d57e',
    summary: 'Feathered, beaked and taloned — winged or not.',
    description:
      'Aven is the collective term for humanoids with birdlike appearances. Aven may be winged or wingless, but all of them are covered in feathers, have beaks, and have talons on their feet.',
    shared: [...MEDIUM_OR_SMALL],
    archetypes: [
      { id: 'flying', name: 'Flying', traits: ['beak-claw:talons', 'flying-cantrip', 'flight:wings', 'hardy', 'survivalist-cultural-skill:beast-tracker', 'keen-senses-proficiency'] },
      { id: 'flightless', name: 'Flightless', traits: ['beak-claw:talons', 'flight:limited-flight', 'keen-senses-proficiency', 'sea-legs', 'sure-footed'] },
      {
        id: 'arctic',
        name: 'Arctic',
        traits: [
          'native-environment:arctic',
          'beak-claw:talons',
          'keen-sight',
          'swim-speed',
          'survivalist-cultural-skill:acclimatization',
          ['aquatic-resistance', { name: 'Insulation', description: 'You gain resistance to cold damage.' }],
          'hold-breath',
          'flight:glide',
          'weather-worn',
        ],
      },
      { id: 'raptor', name: 'Raptor', traits: ['beak-claw:talons', 'flight:wings', 'keen-sight', 'survivalist-cultural-skill:acclimatization'] },
    ],
  },

  {
    id: 'yuan-ti',
    name: 'Yuan-ti',
    subtitle: 'Snakefolk',
    type: 'Awakened (Uncommon) ancestry',
    notion: 'https://app.notion.com/p/a77227110f5e450dbba40306e488b1bc',
    summary: 'Nagaji of the deep places. Marked non-playable; defined only by an external PDF.',
    description:
      'An intensely cruel and fascistic culture, nagaji were driven to the depths of Eora millennia ago, though some still control regions of untamed jungles on the surface.',
    stub: true,
    shared: [],
    archetypes: [],
    notes: ['The Notion page carries a description and a link to an external PDF, no traits. Left as a stub rather than invented.'],
  },

  {
    id: 'iruxi',
    name: 'Iruxi',
    subtitle: 'Lizardfolk',
    type: 'Awakened (Common) ancestry',
    descriptors: 'Reptilian species',
    notion: 'https://app.notion.com/p/d5a52f1e4b584904966d59056efc8a20',
    summary: 'Lizardfolk and tortles, each shaped by the landscape that raised them.',
    description:
      'All iruxi characters are size medium or small, and must take at least one trait from the Reptilian ancestry.',
    shared: [...MEDIUM_OR_SMALL],
    archetypes: [
      {
        id: 'badlands',
        name: 'Badlands',
        traits: [
          'native-environment:desert',
          'darkvision-60', 'tooth-tail:bite', 'defensive-feature:spines', 'climb-speed', 'leap',
          'survivalist-cultural-skill:acclimatization', 'hold-breath',
          'survivalist-cultural-skill:survivalist-skill', 'skilled-tracker',
        ],
        notes: ['Notion lists both Acclimatization (0) and Survivalist (1). They are two options of one Cultural Skill trait, but Notion charges for both, so both are kept — de-duplication only drops an exact id+option repeat.'],
      },
      {
        id: 'swamp',
        name: 'Swamp',
        traits: [
          'native-environment:swamp',
          'hold-breath', 'darkvision-60',
          ['tooth-tail:tail', { name: 'Natural Weapons', description: 'Your toothy maw and/or strong tail allow you to make damaging unarmed strikes as a light weapon. When you hit with it, the strike deals 1d6 + Strength modifier slashing (bite) or bludgeoning (tail) damage.' }],
          'hungry-jaws', 'natural-armor', 'weather-worn', 'swim-speed',
          ['survivalist-skill-proficiency', { description: 'You have proficiency in the Intimidation skill.' }],
        ],
      },
      {
        id: 'jungle',
        name: 'Jungle',
        traits: [
          'native-environment:forest',
          'darkvision-60', 'chromatophore',
          [null, { name: 'Tongue', points: 3, description: 'Your tongue can make damaging unarmed strikes as a light weapon with a reach of 10 feet. When you hit with it, the strike deals 1d6 + Strength modifier bludgeoning damage.' }],
          'climb-speed',
          ['survivalist-skill-proficiency', { description: 'You have proficiency in the Stealth skill.' }],
        ],
      },
      {
        id: 'desert',
        name: 'Desert',
        traits: [
          'native-environment:desert',
          'speed-quick', 'darkvision-60', 'survivalist-cultural-skill:acclimatization',
          'tooth-tail:bite',
          ['survivalist-skill-proficiency', { description: 'You have proficiency in the Intimidation skill.' }],
          'natural-armor', 'burrow',
        ],
      },
      {
        id: 'forest-or-plains',
        name: 'Forest or Plains',
        traits: [
          'native-environment:forest',
          'tooth-tail:fangs', 'regeneration', 'natural-armor',
          'survivalist-cultural-skill:beast-tracker', 'survivalist-skill-proficiency',
          'toxin-resilience', 'poison-resistance',
        ],
        notes: ['The builder previously shortened this to "Forest"; Notion’s name is "Forest or Plains".'],
      },
      {
        id: 'shelled',
        name: 'Shelled',
        traits: ['bite-pincers:bite', ['carapace', { name: 'Shell' }], 'swim-speed', 'sturdy:durable', 'shell-defense'],
      },
    ],
  },

  {
    id: 'myconid',
    name: 'Myconid',
    subtitle: 'Mushroomfolk',
    type: 'Awakened (Uncommon) ancestry',
    notion: 'https://app.notion.com/p/755e02995bde425498372fef7c8210bc',
    summary: 'Fungal folk who speak in spores and decompose anything organic to survive.',
    description:
      'Myconids possess a diverse variety of physical features, but they all share a few core traits. They grow quickly, reaching maturity by the age of four and living just under a quarter of a century.',
    shared: [
      [null, { name: 'Decomposition', points: 0, description: 'You can eat any organic material to survive. Your body decomposes it into a form that is nutritious to you.' }],
      'darkvision-60',
      [null, { name: 'Poisonous Form', points: 4, description: 'You are resistant to poison damage and you are immune to the poisoned condition.' }],
      ['hybrid-nature', { note: 'Negative-cost drawback: −1. Requires the negative point support added for item 2.' }],
      [null, { name: 'Rapport Spores', points: 0, description: 'You are unable to verbally speak, but can communicate telepathically to creatures within a number of feet equal to 40 + ten times your level, emitting spores that transmit your messages directly to their minds. The creature doesn’t need to share a language with you to understand your telepathy, but it must be able to understand at least one language, and it can’t be an Undead, Construct, or Elemental. This telepathy doesn’t grant the creature the ability to telepathically respond.' }],
    ],
    archetypes: [
      {
        id: 'sporemaster',
        name: 'Sporemaster',
        traits: [
          'size-small',
          [null, { name: 'Fungal Alchemy', points: 0, description: 'Sporemasters have an innate understanding of alchemy, often using their spores as ingredients. You gain proficiency in Alchemists’ Supplies.' }],
          [null, { name: 'Spores', points: 10, description: 'Sporemasters control powerful spores they can use to meld both friends and enemies. As you level up, you gain access to more powerful spores: Distress and Preserve at 1st, Soothe and Control at 2nd, Hallucination at 4th, and Pacifying at 5th. If your spore’s effects require a saving throw, the DC equals 8 + your proficiency bonus + the specified ability modifier. You can use each spore option once, and must complete a long rest before you do so again.' }],
        ],
      },
    ],
  },

  {
    id: 'anadi',
    name: 'Anadi',
    subtitle: 'Spiderfolk',
    type: 'Awakened (Uncommon) ancestry',
    descriptors: 'Spiderfolk',
    notion: 'https://app.notion.com/p/129ddbcc068f802bb2a2dc72c9e2ae82',
    summary: 'Spiderfolk who learned to wear a humanoid shape so the world would talk to them.',
    description:
      'Anadi in their true form resemble large spiders. All anadi possess the ability to transform into a humanoid guise, a fusion of transmutation and illusion magic their scholars innovated so they could trade with neighbours who found their true appearance objectionable. Both forms are granted together.',
    shared: [
      ...MEDIUM_OR_SMALL,
      ['darkvision-60', { description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. Your darkvision appears in shades of shifting purple.' }],
    ],
    archetypes: [
      {
        id: 'anadi',
        name: 'Anadi',
        traits: [
          // Both forms are granted together, so every trait below is taken.
          // ── In your spider form ──,
          [null, { name: 'Spider Climb', points: 4, description: 'While in spider form, you can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check. While doing so, you cannot use your extra arms for any purpose but to aid in climbing. You are not affected by the web spell or difficult terrain from webs.' }],
          [null, { name: 'Extra Arms', points: 3, description: 'While in spider form, you have a second set of arms that can grasp and manipulate objects. You can still only wield one weapon or carry one large object per side, but you can use your extra arms to carry out simple tasks, initiate or maintain grapples, use tools, reload ranged weapons, and perform the somatic components of spells. They also allow one extra free object interaction per turn.' }],
          [null, { name: 'Venomous Bite', points: 3, description: 'Your spider mandibles are a natural weapon, which you can use to make unarmed strikes as a light weapon, dealing 1d6 + your Strength modifier piercing damage. Additionally, when you hit an enemy with a bite attack, you may use your bonus action to latch on and inject deadly venom. They must make a Constitution saving throw (DC 8 + your Constitution modifier + your proficiency bonus), taking 4d6 poison damage on a failure or half as much on a success. This damage increases to 6d6 at level 5, 8d6 at level 11, and 10d6 at level 16. Once you use this ability, you can’t use it again until you take a short or long rest.' }],
          [null, { name: 'Skill Proficiency, Stealth', points: 2, description: 'You have proficiency in the Stealth skill.' }],
          // ── In your humanoid form ──
          ['shifter', { note: 'Was inline (2). Promoted to a curated trait so Anadi and Tiefling reference one Shifter rather than two copies. Same price.' }],
          [null, { name: 'Calming Presence', points: 1, description: 'As a bonus action, you can end the frightened condition on a friendly creature. Once you use this ability, you can’t use it again until you take a short or long rest.' }],
        ],
        notes: ['Notion splits these under "In your spider form" and "In your humanoid form", but both are granted together — they are not alternatives — so they are one flat trait list, not two archetypes.'],
      },
    ],
  },

  {
    id: 'dragonborn',
    name: 'Dragonborn',
    subtitle: 'Created by dragons',
    type: 'Awakened (Uncommon) ancestry',
    descriptors: 'Created by dragons',
    notion: 'https://app.notion.com/p/3703a1af083d40cba634e17c9417f6fc',
    summary: 'The only species that may draw on the Draconic ancestry.',
    description:
      'All dragonborn characters are medium or small, and must take at least 2 traits from the Draconic ancestry. They are the only species that can choose from this ancestry.',
    shared: [...MEDIUM_OR_SMALL, 'draconic-ancestry'],
    archetypes: [
      {
        id: 'dragonborn',
        name: 'Dragonborn',
        designed: true,
        traits: [
          'draconic-element:fire',
          [null, { name: 'Draconic Nature', points: 0, description: '**Arrogant Tyrant.** You assume any room you enter is yours. You have advantage on Charisma (Intimidation) checks made against a creature you outmatch in size or station.' }],
          'breath-weapon', 'draconic-resistance', 'draconic-cantrip', 'draconic-presence', 'powerful-build',
        ],
      },
      {
        id: 'elemental-dragonborn',
        name: 'Elemental dragonborn',
        designed: true,
        traits: [
          'draconic-element:lightning',
          [null, { name: 'Draconic Nature', points: 0, description: '**Mocking Trickster.** Your laugh carries further than you mean it to. You have advantage on Charisma (Deception) checks made to maintain a falsehood you find funny.' }],
          'breath-weapon', 'draconic-resistance', 'elemental-attunement:air', 'elemental-cantrip:air', 'draconic-warding',
        ],
      },
      {
        id: 'brutal',
        name: 'Brutal',
        designed: true,
        traits: [
          'draconic-element:acid',
          [null, { name: 'Draconic Nature', points: 0, description: '**Brutal.** You add your Constitution modifier to your breath weapon and natural weapon attacks.' }],
          'breath-weapon', 'draconic-resistance', 'draconic-cry', 'tooth-nail:bite', 'swim-speed',
        ],
      },
      {
        id: 'reserved',
        name: 'Reserved',
        designed: true,
        traits: [
          'draconic-element:radiant',
          [null, { name: 'Draconic Nature', points: 0, description: '**Reserved Companion.** You say a good deal less than you know. You have advantage on Wisdom (Insight) checks made to determine whether a creature is lying to someone you have named a friend.' }],
          'breath-weapon', 'draconic-resistance', 'draconic-cantrip', 'draconic-warding', 'friendly-cultural-skill:empathic', 'powerful-build',
        ],
      },
      {
        id: 'uncanny',
        name: 'Uncanny',
        designed: true,
        traits: [
          'draconic-element:psychic',
          [null, { name: 'Draconic Nature', points: 0, description: '**Good Host.** You have advantage on Wisdom (Insight) checks made to work out what a creature wants from you.' }],
          'breath-weapon', 'draconic-resistance', 'psionic-cantrip', 'psionic-magic', 'battlefield-intuition', 'tooth-nail:bite',
        ],
      },
    ],
    notes: [
      'The old Draconic Ancestry trait is split three ways. Draconic Ancestry is only the Dragon creature type (shared). Draconic Element (required, in traits.json) picks the damage type and scale colour, keeping the 0/1 rarity pricing. Draconic Nature is the temperament, written inline on each archetype rather than hung off the element.',
      'Brutal’s nature (Constitution modifier added to breath weapon and natural weapon attacks) is new. The other four natures are the old option riders, drawn from the dragonborn colour traits in Races-1.pdf (p.24–26), and stay rider-weight at 0 points.',
      'Natures with no archetype yet, kept here for when one is designed: Cold — Primal and Vengeful (never forgets the scent of a creature that wounded you; advantage on Survival to track it). Force — Unbroken Line (advantage on Charisma checks to prove draconic lineage; can tell whether a creature you see carries dragon blood). Thunder — Boldly Talkative (advantage on Persuasion to keep a conversation going with a creature that would rather end it). Necrotic — Hoarding History (advantage on History to recall the deeds of the dead; can tell roughly how long ago a corpse died). Poison — Manipulative Schemer (advantage on Deception to convince a creature you act in its interest).',
      'Brutal (acid/black), Reserved (radiant/gold) and Uncanny (psychic) are designed archetypes, not Notion pages. They exist so the elements are exercised across all three rarity bands rather than only fire and lightning. Each lands on 16.',
      'The doc’s bronze rider, Dragon of the Coast, was not carried across: a 30 ft. swim speed is mechanically heavier than the other natures and would not be a 0-point rider. Brutal buys swim-speed (2) outright instead.',
    ],
  },
];
