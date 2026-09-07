// Versatile ancestries — see ./README.md for the reference format.
//
// The genasi archetypes pasted in from external sources carry no point values at
// all. Everything marked `priced: true` below is a pricing decision made under
// audit item 7, following the pattern Notion's own godlike archetypes establish:
//
//     Elemental Attunement (2)  resistance + primordial tongue
//     Cantrip (Elemental)  (2)  the at-will
//     Elemental Magic      (7)  the 3rd- and 5th-level spells
//
// The curated elemental options only cover air/earth/fire/nature/water, so a
// lightning, thunder, metal, vapor or poison archetype references the closest
// element and overrides the name.

const MEDIUM_OR_SMALL = ['size-medium', 'size-small'];

export default [
  {
    id: 'undine',
    name: 'Undine',
    type: 'Versatile ancestry',
    descriptors: 'Waterborn – Marine, Aquatic, Fishlike',
    notion: 'https://app.notion.com/p/894ace4d80a24cef8ea18ef4342dd65a',
    summary: 'Waterborn godlike, marked either by marine anatomy or by the element itself.',
    description:
      'Waterborn take two common forms. They may have the obvious physical traits of marine creatures, or some sort of elemental influence that manifests — hair magically formed out of water, ice cold skin, skin colour that swirls like the sea.',
    shared: [...MEDIUM_OR_SMALL, 'swim-speed', 'amphibious'],
    archetypes: [
      {
        id: 'elemental',
        name: 'Elemental',
        traits: ['elemental-attunement:water', 'elemental-cantrip:water', 'elemental-magic:water', 'emissary-sea', 'amphibious', 'swim-speed'],
        notes: ['Notion re-lists Amphibious (2) and Swim Speed (2) here; both duplicates are dropped, which is exactly what brings this to 16.'],
      },
      {
        id: 'surface',
        name: 'Surface',
        traits: ['waterborne-cultural-skill:mariners-lore', 'waterborne-tool-proficiency', 'waterborne-skill-proficiency', 'martial-training', ['sea-legs', { description: 'You have advantage on Dexterity (Acrobatics) checks, and checks to be knocked prone when standing atop a vehicle.' }]],
      },
      {
        id: 'deep',
        name: 'Deep',
        traits: ['darkvision-60', 'emissary-sea', 'elemental-magic:water', ['hardy', { name: 'Endurance', description: 'You are acclimated to extreme climates and do not suffer the effects of deep waters below 100 ft.' }]],
      },
      {
        id: 'extreme',
        name: 'Extreme',
        traits: ['darkvision-60', 'emissary-sea', ['hardy', { name: 'Endurance', description: 'You are acclimated to extreme climates and do not suffer the effects of deep waters below 100 ft.' }], ['aquatic-cantrip', { description: 'You know the dancing lights cantrip.' }], 'natural-magic', 'keen-senses-proficiency'],
      },
      {
        id: 'fish',
        name: 'Fish',
        traits: ['bite-pincers:bite', 'emissary-sea', 'aquatic-resistance', 'defensive-feature:spines', 'natural-armor', 'weather-worn'],
      },
      {
        id: 'crustacean',
        name: 'Crustacean',
        traits: ['bite-pincers:pincers', 'survivalist-cultural-skill:acclimatization', 'carapace', 'survivalist-skill-proficiency', 'emissary-sea', 'aquatic-resistance'],
      },
      {
        id: 'iceborn',
        name: 'Iceborn',
        traits: [
          [null, { name: 'Ice Skate', points: 3, description: 'You can walk across the surface of water as if it were solid ground, your footsteps temporarily freezing it, with the ice melting the instant your foot moves. Walking across difficult terrain caused by ice or snow costs you no extra movement.' }],
          'amphibious',
          ['elemental-attunement:water', { name: 'Water' }],
          'elemental-cantrip:water',
          'elemental-magic:water',
        ],
        notes: ['Notion re-lists Amphibious (2) here; the duplicate is dropped.'],
      },
      {
        id: 'poisonborn',
        name: 'Poisonborn',
        priced: true,
        traits: [
          ['elemental-attunement:water', { name: 'Elemental Attunement, Poison', description: 'You gain resistance to poison damage and have advantage on saving throws you make to avoid or end the poisoned condition on yourself.' }],
          ['elemental-cantrip:water', { name: 'Cantrip (Elemental), Poison', description: 'You know the poison spray cantrip.' }],
          ['elemental-magic:water', { name: 'Brew the Toxin', description: 'Starting at 3rd level, you can cast either ray of sickness or sleep with this trait, without requiring a material component. Starting at 5th level, you can cast stinking cloud with this trait, without requiring a material component. Once you cast the chosen spell or stinking cloud with this trait, you can’t cast that spell with this trait again until you finish a long rest.' }],
          'emissary-sea',
        ],
        notes: [
          'Priced under item 7. The source text also lists Darkvision and a separate Poison Resilience; poison resistance and the condition advantage are folded into the attunement, and Darkvision is dropped, because the budget buys the genasi spell package or Darkvision but not both. Undine ▸ Elemental takes no Darkvision either.',
        ],
      },
    ],
  },

  {
    id: 'ifriti',
    name: 'Ifriti',
    type: 'Versatile ancestry',
    descriptors: 'Flameborn – Fire, Ash, Magma',
    notion: 'https://app.notion.com/p/13fddbcc068f801a8d87e4acf0ba9733',
    summary: 'Flameborn godlike — hot tempered, impassioned, holding sway over destruction.',
    description:
      'Ifrit have physical traits of flame, smoke, or volcanic rock that allude to their fiery inheritance. Their eyes may be alight with a glow, their skin may flake with ash, their breath emanate black smoke, or their hair may actually be an everburning flame.',
    shared: [...MEDIUM_OR_SMALL, ['elemental-attunement:fire', { name: 'Fire' }]],
    archetypes: [
      {
        id: 'fire',
        name: 'Fire',
        traits: [
          'elemental-cantrip:fire', 'elemental-magic:fire',
          [null, { name: 'Born of Fire', points: 2, description: 'You can convert any spell or melee attack you make that does magical damage to fire damage. You can do this a number of times per day equal to your proficiency bonus, recharging on a long rest.' }],
          [null, { name: 'Flamewalker', points: 2, description: 'You can walk across and through flame as if it were solid ground. You can walk through nonmagical fire without taking damage.' }],
        ],
      },
      { id: 'ash', name: 'Ash', traits: ['elemental-cantrip:fire', 'elemental-magic:fire', 'unending-breath'] },
      {
        id: 'magma',
        name: 'Magma',
        traits: [
          'elemental-cantrip:fire', 'elemental-magic:fire',
          [null, { name: 'Molten Core', points: 4, description: 'If a spell you cast with this trait deals a damage type other than fire, you can choose for it to deal fire damage instead when you cast it with this trait. If a spell or ability you use deals fire damage, you can choose for it to deal bludgeoning damage instead.' }],
          [null, { name: 'Volcanic Being', points: 0, description: 'You are immune to any fire damage caused by being near or in contact with non-magical magma or molten rock.' }],
        ],
        notes: ['Volcanic Being is confirmed at 0, not merely unpriced: you already have fire resistance from the shared attunement, so this is a narrow flavour rider like Combat Awareness (0) or Acclimatization (0), and 0 is what lands the chain on exactly 16.'],
      },
      {
        id: 'steam',
        name: 'Steam',
        traits: [
          'amphibious', 'elemental-cantrip:fire', 'elemental-magic:fire',
          [null, { name: 'Burning Cloud', points: 2, description: 'When a creature succeeds on an Intelligence (Investigation) check it makes against a minor illusion or disguise self you cast with this trait, it takes fire damage equal to your proficiency bonus.' }],
          [null, { name: 'Heat Distortion', points: 0, description: 'While you’re moving, each other creature has disadvantage on any Wisdom check it makes to discern visual details about you.' }],
        ],
        notes: ['Heat Distortion is confirmed at 0 on the same reasoning as Volcanic Being.'],
      },
    ],
  },

  {
    id: 'talos',
    name: 'Talos',
    type: 'Versatile ancestry',
    descriptors: 'Stoneborn – Earth, Stone, Metal',
    notion: 'https://app.notion.com/p/b688867c582242aea58fdf4df1732eca',
    summary: 'Stoneborn godlike, bodied in stone, crystal or metal, with mercurial blood.',
    description:
      'Talos are as variant as the stone, crystals, and metals that fill the planes, but they always have a physical manifestation of that form in their person. Their eyes are always a solid colour and never have pupils.',
    shared: [...MEDIUM_OR_SMALL],
    archetypes: [
      {
        id: 'stoneborn',
        name: 'Stoneborn',
        traits: ['elemental-attunement:earth', 'unending-breath', 'elemental-strike:earth', 'elemental-magic:earth', 'natural-armor'],
      },
      {
        id: 'ironborn',
        name: 'Ironborn',
        priced: true,
        traits: [
          ['elemental-attunement:earth', { name: 'Elemental Attunement, Metal', description: 'You know the blade ward cantrip and can cast it normally or as a bonus action a number of times equal to your Proficiency Bonus, replenishing on a long rest. If you have darkvision you see in shades of a colour of your choice. You speak primordial (terran).' }],
          'unending-breath',
          [null, { name: 'Metal Skin', points: 7, description: 'You can use your metal heritage to defend yourself. As a bonus action, you can enhance the metal in your body by turning your skin into metal: this process heals 1hp per level and provides you with resistance to all damage till the beginning of your next turn. A long rest is required to regain this power.' }],
          'toxin-resilience', 'warrior-cultural-skill:combat-climber',
          ['artisan-tool-proficiency', { description: 'You gain proficiency with smith’s tools.' }],
          'skilled-combatant:charge',
        ],
        notes: ['Metal Skin priced at 7 under item 7: it is Ironborn’s single signature trait, standing where every other Talos archetype has a 7-point Elemental Magic, and resistance to all damage plus level-scaled healing is comparable to Durable (7).'],
      },
      {
        id: 'goldenblood',
        name: 'Goldenblood',
        priced: true,
        traits: [
          [null, { name: 'Golden Bulwark', points: 4, description: 'Your form lets you shrug off damage. You know the blade ward cantrip and can cast it normally or as a bonus action a number of times equal to your Proficiency Bonus, replenishing on a long rest. It takes only somatic components. Starting at 5th level, you may cast liquid armor once per day on a creature other than yourself, replenishing on a long rest. You speak primordial (terran).' }],
          [null, { name: 'Metallic Appendage', points: 2, description: 'You form part of your body into a weapon-like appendage able to make damaging unarmed strikes as a light weapon. When you hit with it, the strike deals 1d6 + Strength modifier damage. You pick whether the damage is slashing, piercing, or bludgeoning based on the form you create.' }],
          [null, { name: 'Metal Skin', points: 4, description: 'You can use your metal heritage to defend yourself. As a bonus action, you can enhance the metal in your body by turning your skin into metal: this process grants you temporary HP equal to your Constitution modifier + 1 per level for the next 10 minutes, and provides you with resistance to all damage till the beginning of your next turn. A long rest is required to regain this power.' }],
          'toxin-resilience', 'warrior-cultural-skill:combat-climber',
          ['artisan-tool-proficiency', { description: 'You gain proficiency with smith’s tools.' }],
          'skilled-combatant:charge',
        ],
        notes: ['Goldenblood’s Metal Skin is a different, weaker trait than Ironborn’s — temporary HP rather than healing — so it is priced at 4 while Ironborn’s is 7.'],
      },
      {
        id: 'orchid',
        name: 'Orchid',
        traits: ['natural-armor', [null, { name: 'Chromatic Magic', points: 4, description: 'You can cast color spray. You can also cast chromatic orb in the element matching your attunement as a melee spell attack. Beginning at 3rd level you can use this trait a number of times equal to your Proficiency Bonus per long rest to cast either of these spells, or cast them normally using spell slots.' }], 'unending-breath', 'constructed-form', 'psionic-resistance:psychic', 'friendly-cultural-skill:empathic', 'serenity'],
      },
      {
        id: 'duster',
        name: 'Duster / Saltborn',
        priced: true,
        traits: [
          'darkvision-60', 'necrotic-resistance',
          ['elemental-cantrip:earth', { name: 'Cantrip (Elemental), Decay', description: 'You know the chill touch cantrip.' }],
          ['elemental-magic:earth', { name: 'Touch of Decay', description: 'Starting at 3rd level, you can cast inflict wounds with this trait. Starting at 5th level, you can cast dust devil with this trait, without requiring a material component; when you do, you can choose for it to deal necrotic damage instead of bludgeoning for the duration. Once you cast either with this trait, you can’t cast that spell with this trait again until you finish a long rest.' }],
          'unending-breath',
        ],
        notes: ['Priced under item 7. Necrotic Resistance is taken at the curated 3 (the value the Tiefling and Fetchling pages use), which lands the chain on exactly 16.'],
      },
      {
        id: 'metal',
        name: 'Metal',
        priced: true,
        traits: [
          ['elemental-attunement:earth', { name: 'Elemental Attunement, Metal' }],
          'unending-breath',
          ['elemental-cantrip:earth', { name: 'Cantrip (Elemental), Forge', description: 'You know the green-flame blade cantrip.' }],
          ['elemental-magic:earth', { name: 'Heart of the Forge', description: 'Starting at 3rd level, you can cast searing smite with this trait. Starting at 5th level, you can cast heat metal with this trait, without requiring a material component. Once you cast either with this trait, you can’t cast that spell with this trait again until you finish a long rest.' }],
          [null, { name: 'Metallic Skin', points: 3, description: 'You gain a +1 bonus to Armor Class.' }],
          ['artisan-tool-proficiency', { description: 'You gain proficiency with smith’s tools.' }],
        ],
        notes: ['Priced under item 7. Metallic Skin at 3 matches Natural Armor (3), the other AC-raising trait in the vocabulary.'],
      },
      {
        id: 'oozeborn',
        name: 'Oozeborn',
        priced: true,
        traits: [
          'swim-speed',
          ['aquatic-resistance', { name: 'Acid Resistance', description: 'You have resistance to acid damage.' }],
          ['elemental-cantrip:water', { name: 'Cantrip (Elemental), Ooze', description: 'You know the acid splash cantrip.' }],
          ['elemental-magic:water', { name: 'Play with Mud', description: 'Starting at 3rd level, you can cast grease with this trait, without requiring a material component. Starting at 5th level, you can cast Melf’s acid arrow, without requiring a material component. Once you cast either with this trait, you can’t cast that spell with this trait again until you finish a long rest.' }],
          [null, { name: 'Slippery Skin', points: 2, description: 'You have advantage on any ability check or saving throw you make to avoid or end the grappled or restrained condition on yourself.' }],
          [null, { name: 'Muck Walker', points: 1, description: 'You ignore difficult terrain caused by mud, muck, or similar terrain.' }],
        ],
        notes: ['Priced under item 7. The source also lists Darkvision; it is dropped so Slippery Skin — the archetype’s signature — fits inside 16.'],
      },
    ],
  },

  {
    id: 'asir',
    name: 'Asir',
    type: 'Versatile ancestry',
    descriptors: 'Windborn – Celestial, Angelic, Avian, Air',
    notion: 'https://app.notion.com/p/c7f000aed887458682db17e59a970d1d',
    summary: 'Windborn godlike, thought to be blessed or descended from celestials.',
    description:
      'Asir godlike manifest with features of air, the heavens, or flying creatures. All asir have strange markings or symbols that adorn their skin, sometimes accompanied by symbols that float around them like halos.',
    shared: [],
    archetypes: [
      {
        id: 'psionic',
        name: 'Psionic',
        traits: [
          ['elemental-attunement:air', { name: 'Elemental Attunement, Air, Thunder', description: 'You gain resistance to thunder damage. If you have darkvision, it is tinged with wisps of white.' }],
          'psionic-cantrip', 'psionic-magic', 'greater-psionic-magic', 'telepathy', 'friendly-cultural-skill:empathic',
        ],
      },
      {
        id: 'psionic-2',
        name: 'Psionic',
        traits: [
          'streetwise-cultural-skill:bamboozler', 'psionic-cantrip', 'friendly-cultural-skill:empathic',
          [null, { name: 'Skill Proficiency, Insight', points: 2, description: 'You have proficiency in the Insight skill.' }],
          ['out-of-sight', { note: 'Notion annotates "1, was 2"; a rider here, so 1 stands' }],
          'psionic-resistance:psychic', 'flight:limited-flight',
        ],
        notes: ['Notion gives two different archetypes the same name, "Psionic". Kept verbatim per the Notion-naming rule, with the id disambiguated. Worth renaming one in Notion — the builder previously called this one "Empath".'],
      },
      {
        id: 'lightningborn',
        name: 'Lightningborn',
        priced: true,
        traits: [
          'speed-quick',
          ['elemental-attunement:air', { name: 'Elemental Attunement, Lightning', description: 'You gain resistance to lightning damage. If you have darkvision, it crackles with static.' }],
          ['elemental-cantrip:air', { name: 'Cantrip (Elemental), Lightning', description: 'You know the lightning leash or manipulate wind cantrip.' }],
          ['elemental-magic:air', { name: 'Ride the Storm', description: 'Starting at 3rd level, you can cast thunder punch, lightning tendril, or electrify. Starting at 5th level, you can cast call lightning, lightning charged, or become wind.' }],
          [null, { name: 'Static Touch', points: 3, description: 'The first time during each of your turns you hit a creature with a melee attack, that creature has disadvantage on opportunity attacks it makes against you until the start of your next turn.' }],
        ],
      },
      {
        id: 'thundercaller',
        name: 'Thundercaller',
        priced: true,
        traits: [
          ['elemental-attunement:air', { name: 'Elemental Attunement, Thunder', description: 'You gain resistance to thunder damage. If you have darkvision, it shimmers with vibration.' }],
          ['elemental-cantrip:air', { name: 'Cantrip (Elemental), Thunder', description: 'You know the thunder burst or thaumaturgy cantrip.' }],
          ['elemental-magic:air', { name: 'Elemental Magic, Thunder', description: 'Starting at 3rd level, you can cast thunder punch. Starting at 5th level, you can cast shatter or silence.' }],
          [null, { name: 'Echolocation', points: 3, description: 'As a bonus action on your turn, you can emit a pulse of sound that is inaudible to another creature without an echolocation trait. Until the end of your next turn, you have blindsight out to a range of 30 feet while you aren’t deafened. You can use this trait a number of times equal to your proficiency bonus, regaining all expended uses when you finish a long rest.' }],
          [null, { name: 'Silent Walk', points: 2, description: 'When you use your walking speed, you can choose for your steps to make no noise. If you’re wearing armor that would normally impose disadvantage on Dexterity (Stealth) checks, you can ignore that source of disadvantage.' }],
        ],
      },
      {
        id: 'windborn',
        name: 'Windborn',
        priced: true,
        traits: [
          'elemental-attunement:air',
          ['elemental-cantrip:air', { description: 'You know the manipulate wind, windborne weapon, or message cantrip.' }],
          ['elemental-magic:air', { description: 'Starting at 3rd level, you can cast gale bolt, zephyr strike, or violent updraft. Starting at 5th level, you can cast vacuum pull, dust cyclone, or hurricane slash.' }],
          'flight:limited-flight',
        ],
        notes: ['Priced under item 7. Notion gives only spell lists; Limited Flight (5) is added as the archetype’s signature — Windborn is the air genasi and flight is what the remaining 5 points buy.'],
      },
      {
        id: 'vapor',
        name: 'Vapor',
        priced: true,
        traits: [
          ['elemental-attunement:air', { name: 'Elemental Attunement, Vapor', description: 'Your body is half mist. If you have darkvision, it is hazed with drifting fog.' }],
          ['elemental-magic:air', { name: 'Dance in the Clouds', description: 'You can cast fog cloud with this trait. Starting at 3rd level, you can cast misty step with this trait. Starting at 5th level, you can cast gaseous form on yourself with this trait, without requiring a material component. Once you cast any of those spells with this trait, you can’t cast that spell with this trait again until you finish a long rest.' }],
          [null, { name: 'Ethereal Body', points: 4, description: 'When you are hit by an attack that deals a damage type other than psychic or thunder, or take damage due to falling, you can use your reaction to momentarily turn yourself and anything you’re wearing or carrying into mist, causing you to take only half damage from the attack or fall. You can use this trait a number of times equal to your proficiency bonus, regaining all expended uses when you finish a long rest.' }],
          [null, { name: 'Mistvision', points: 3, description: 'Within 60 feet of you, you can see through lightly obscured areas as if they weren’t obscured at all, and through heavily obscured areas as if they were only lightly obscured. You can’t discern colour in heavily obscured areas, only shades of gray.' }],
        ],
      },
    ],
  },

  {
    id: 'oread',
    name: 'Oread',
    type: 'Versatile ancestry',
    descriptors: 'Natureborn – Nature, Plant, Mammalian',
    notion: 'https://app.notion.com/p/1bf758b7ea3a40a89fa2e75ea46c387d',
    summary: 'Natureborn godlike — manifestations of nature in mammalian or plantlike form.',
    description:
      'Nature godlike are manifestations of nature. Some bear mammalian features such as horns, antlers, long cervine ears, tails, fur, or hooved legs. Others have plantlike growths such as mossy or flowering vines for hair, barklike skin, or saplike blood.',
    shared: [
      ...MEDIUM_OR_SMALL, 'darkvision-60',
      ['elemental-attunement:nature', { name: 'Nature', description: 'You gain resistance to acid damage. If you have darkvision you see in shades of brown or green. You speak primordial (giant). Notion also offers poison resistance at 3 instead.' }],
      'speech-beast-leaf',
      ['traversal', { points: 0, description: 'You can move across difficult terrain caused by Plant creatures and vegetation without spending extra movement.', note: 'Narrow rider — plant-created terrain only — so 0, the low end of the core/rider rule. Notion prices it at 0 here.' }],
    ],
    archetypes: [
      { id: 'desert', name: 'Desert', traits: ['native-environment:desert', 'speed-quick', 'survivalist-cultural-skill:survivalist-skill'] },
      { id: 'nature', name: 'Nature', traits: ['speech-beast-leaf', 'keen-senses'] },
      { id: 'forest', name: 'Forest', traits: ['native-environment:forest', 'speech-beast-leaf', 'elemental-magic:nature'] },
      { id: 'myconid', name: 'Myconid', traits: ['elemental-strike:nature', 'charm-resistance', 'fey-magic', 'psionic-cantrip'] },
      {
        id: 'florid',
        name: 'Florid',
        traits: [
          ['elemental-attunement:nature', { name: 'Nature' }],
          'elemental-cantrip:nature', 'elemental-magic:nature', 'speech-beast-leaf',
          [null, { name: 'Spore Ward', points: 2, description: 'You can’t be put to sleep against your will, and you have advantage on saving throws you make to resist or end the poisoned condition on yourself.' }],
        ],
      },
    ],
    notes: [
      'The builder used entirely different archetype names — Sandsoul, Rootwhisper, Old Growth, Mycelial, Florid. Notion’s names are Desert, Nature, Forest, Myconid, Florid, and those are what ship.',
      'Nature, Forest and Florid each re-list a shared trait; the duplicates are dropped.',
    ],
  },

  {
    id: 'tiefling',
    name: 'Tiefling',
    type: 'Versatile ancestry',
    descriptors: 'Hellborn – Fiendish, Abyssal, Hellish',
    notion: 'https://app.notion.com/p/763f33a2f2fa4af2b4b8536efac8bee5',
    summary: 'Mortals carrying the sinister mark of the fiendish planes on their flesh.',
    description:
      'When the influence of a demon, devil, fiend, or shadowspawn infiltrates the bloodline of a mortal family, tieflings are the inevitable result. Their specific abilities and physical qualities vary according to their heritage.',
    shared: ['size-medium', 'darkvision-60'],
    archetypes: [
      { id: 'shadows', name: 'Shadows', traits: ['necrotic-resistance', 'step-of-darkness', 'charm-resistance'] },
      {
        id: 'deception',
        name: 'Deception',
        traits: [
          ['elemental-attunement:fire', { name: 'Fire' }],
          'elemental-cantrip:fire',
          ['elemental-magic:fire', { description: 'Starting at 3rd level, you can cast blade mirage, hellish rebuke, or disguise self. Then starting at 5th level, you can cast adaptation (self only), crown of madness, or captivate.' }],
          ['hardy', { description: 'You are acclimated to extreme climates and do not suffer the effects of extreme heat above 100 degrees Fahrenheit.' }],
        ],
      },
      { id: 'decay', name: 'Decay', designed: true, traits: ['necrotic-resistance', 'shadow-cantrip', 'shadow-magic', 'greater-shadow-magic', 'toxin-resilience'] },
      { id: 'domination', name: 'Domination', designed: true, traits: ['planar-cantrip', 'planar-magic', 'greater-planar-magic', 'charm-resistance', 'theocratic-skill-proficiency', 'friendly-cultural-skill:empathic'] },
      { id: 'corruption', name: 'Corruption', designed: true, traits: ['planar-attunement:fiend-fire', 'plane-strike', 'poison-resistance', 'defensive-feature:poisonous'] },
      { id: 'forbidden-knowledge', name: 'Forbidden knowledge', designed: true, traits: ['mage-cultural-skill:advanced-arcane-training', 'mage-cantrip', 'learned-magic', 'ritualist', 'mage-skill-proficiency', 'friendly-cultural-skill:empathic'] },
      { id: 'many-faces', name: 'Many faces', designed: true, traits: ['shapechanger', 'shifter', 'charm-resistance', 'streetwise-skill-proficiency'] },
    ],
    notes: [
      'Many faces is a designed archetype, not a Notion page: it exists to give Shapechanger (7) and Shifter (2) a home on Tiefling. Shapechanger had never been referenced by any ancestry; Shifter was inline on Anadi. 3 shared + 13 = 16.',
    ],
  },

  {
    id: 'fetchling',
    name: 'Fetchling',
    type: 'Versatile ancestry',
    descriptors: 'Shadowborn – Faded, Death',
    notion: 'https://app.notion.com/p/0d37415a912b4f9c8322ac97d26c59d0',
    summary: 'Creatures bleached of pigment by the magic of the fade.',
    description:
      'The fade strips humanoid creatures of pigmentation in their skin and hair. Known as fetchlings, creatures influenced by these places are characterized by pale or greyscale hair and pale, greyish, or even semi-translucent skin.',
    shared: [...MEDIUM_OR_SMALL, 'darkvision-60'],
    archetypes: [
      { id: 'shadowborn', name: 'Shadowborn', traits: ['necrotic-resistance', 'step-of-darkness', 'charm-resistance'] },
    ],
    notes: ['The rest of the page is inside an Archived block — Shadowborn elf, gnome, human and tiefling variants — and is deliberately not converted.'],
  },

  {
    id: 'fey',
    name: 'Fey',
    type: 'Versatile ancestry',
    descriptors: 'Feyborn – Chaos',
    notion: 'https://app.notion.com/p/7be713ac9c464b15aa6caade7b0c9211',
    summary: 'Not an ancestry — a swap-in overlay applied to another ancestry’s traits.',
    description:
      'All fey characters have a connection to magic and time passes differently for them. Take another ancestry’s traits, and change out traits to take Fey, one of Trance / Fey Magic / Greater Fey Magic, and one other Fey trait — staying within the 16 point limit.',
    overlay: true,
    shared: [],
    archetypes: [],
    notes: ['Modelled as an overlay rather than an ancestry, because that is what the page describes. Its archived elf/gnome/wodekin variants are not converted.'],
  },
];
