import { Client } from '@notionhq/client';
import {
  fetchAncestries as fetchMockAncestries,
  fetchArchetypes as fetchMockArchetypes,
  fetchTraits as fetchMockTraits,
  fetchSpells as fetchMockSpells
} from './mockData';

// Use mock data in development environment
const USE_MOCK_DATA = true; // Set to true to use mock data

// Initialize Notion client
const notion = new Client({
  auth: import.meta.env.VITE_NOTION_API_KEY,
});

// Database IDs
const ANCESTRIES_DB_ID = import.meta.env.VITE_NOTION_ANCESTRIES_DB_ID;
const ARCHETYPES_DB_ID = import.meta.env.VITE_NOTION_ARCHETYPES_DB_ID;
const TRAITS_DB_ID = import.meta.env.VITE_NOTION_TRAITS_DB_ID;
const SPELLS_DB_ID = import.meta.env.VITE_NOTION_SPELLS_DB_ID;

/**
 * Fetch and process all ancestries data from Notion
 * @returns {Promise<{prebuiltAncestries: Array, ancestryTraits: Object, cultureTraits: Object}>}
 */
export async function fetchAncestryData() {
  try {
    // Fetch all databases in parallel for efficiency
    const [
      ancestriesResponse,
      archetypesResponse,
      traitsResponse,
      spellsResponse
    ] = await Promise.all([
      fetchAncestries(),
      fetchArchetypes(),
      fetchTraits(),
      fetchSpells()
    ]);

    // Process the raw data
    const ancestries = USE_MOCK_DATA
      ? convertMockAncestries(ancestriesResponse)
      : processAncestries(ancestriesResponse.results);

    const archetypes = USE_MOCK_DATA
      ? convertMockArchetypes(archetypesResponse)
      : processArchetypes(archetypesResponse.results);

    const traits = USE_MOCK_DATA
      ? convertMockTraits(traitsResponse)
      : processTraits(traitsResponse.results);

    const spells = USE_MOCK_DATA
      ? convertMockSpells(spellsResponse)
      : processSpells(spellsResponse.results);

    // Build the prebuilt ancestries with their archetypes and traits
    const prebuiltAncestries = buildPrebuiltAncestries(
      ancestries.filter(a => !a.isCustom),
      archetypes,
      traits,
      spells
    );

    // Organize traits for the point-buy system
    const { ancestryTraits, cultureTraits } = organizeTraitsForPointBuy(
      traits.filter(t => t.isAvailableInPointBuy),
      spells
    );

    return {
      prebuiltAncestries,
      ancestryTraits,
      cultureTraits
    };
  } catch (error) {
    console.error("Error fetching ancestry data:", error);
    throw error;
  }
}

/**
 * Fetch all ancestries from Notion
 */
async function fetchAncestries() {
  if (USE_MOCK_DATA) {
    return await fetchMockAncestries();
  }

  return await notion.databases.query({
    database_id: ANCESTRIES_DB_ID,
    sorts: [{ property: "Name", direction: "ascending" }],
  });
}

/**
 * Fetch all archetypes from Notion
 */
async function fetchArchetypes() {
  if (USE_MOCK_DATA) {
    return await fetchMockArchetypes();
  }

  return await notion.databases.query({
    database_id: ARCHETYPES_DB_ID,
    sorts: [{ property: "Name", direction: "ascending" }],
  });
}

/**
 * Fetch all traits from Notion
 */
async function fetchTraits() {
  if (USE_MOCK_DATA) {
    return await fetchMockTraits();
  }

  return await notion.databases.query({
    database_id: TRAITS_DB_ID,
    sorts: [
      { property: "Type", direction: "ascending" },
      { property: "Category", direction: "ascending" },
      { property: "Name", direction: "ascending" },
    ],
  });
}

/**
 * Fetch all spells from Notion
 */
async function fetchSpells() {
  if (USE_MOCK_DATA) {
    return await fetchMockSpells();
  }

  return await notion.databases.query({
    database_id: SPELLS_DB_ID,
    sorts: [{ property: "Name", direction: "ascending" }],
  });
}

// Helper functions to convert mock data to Notion-like structure
function convertMockAncestries(mockAncestries) {
  return mockAncestries.map(ancestry => ({
    id: ancestry.id,
    name: ancestry.name,
    description: ancestry.description,
    icon: ancestry.emoji,
    isCustom: false,
    baseTraitIds: [],
    archetypeIds: ancestry.archetypes.map(archetype => archetype.id),
  }));
}

function convertMockArchetypes(mockArchetypes) {
  return mockArchetypes.map(archetype => ({
    id: archetype.id,
    name: archetype.name,
    description: archetype.description || "",
    icon: archetype.emoji,
    ancestryId: archetype.parentAncestryId,
    traitIds: [],
    imageUrl: null,
  }));
}

function convertMockTraits(mockTraits) {
  return mockTraits.map(trait => ({
    id: trait.id,
    name: trait.name,
    description: trait.description,
    cost: trait.cost,
    type: trait.type || "ancestry",
    category: trait.category || "general",
    required: false,
    isAvailableInPointBuy: true,
    spellRefs: trait.spellRefs || [],
  }));
}

function convertMockSpells(mockSpells) {
  return mockSpells.map(spell => ({
    id: spell.id,
    name: spell.name,
    description: spell.description || "",
    level: spell.level,
    school: "",
    castingTime: "",
    range: "",
    components: "",
    duration: "",
    url: spell.url
  }));
}

/**
 * Process raw ancestry data from Notion
 */
function processAncestries(rawAncestries) {
  return rawAncestries.map(ancestry => {
    const properties = ancestry.properties;

    return {
      id: ancestry.id,
      name: properties.Name.title[0]?.plain_text || "Unnamed Ancestry",
      description: properties.Description.rich_text[0]?.plain_text || "",
      icon: properties.Icon.rich_text[0]?.plain_text || "🧬",
      isCustom: properties.IsCustom.checkbox || false,
      baseTraitIds: properties.BaseTraits.relation.map(rel => rel.id) || [],
      archetypeIds: properties.Archetypes.relation.map(rel => rel.id) || [],
    };
  });
}

/**
 * Process raw archetype data from Notion
 */
function processArchetypes(rawArchetypes) {
  return rawArchetypes.map(archetype => {
    const properties = archetype.properties;

    return {
      id: archetype.id,
      name: properties.Name.title[0]?.plain_text || "Unnamed Archetype",
      description: properties.Description.rich_text[0]?.plain_text || "",
      icon: properties.Icon.rich_text[0]?.plain_text || "🔄",
      ancestryId: properties.Ancestry.relation[0]?.id || null,
      traitIds: properties.Traits.relation.map(rel => rel.id) || [],
      imageUrl: properties.Image.files[0]?.file?.url || null,
    };
  });
}

/**
 * Process raw trait data from Notion
 */
function processTraits(rawTraits) {
  return rawTraits.map(trait => {
    const properties = trait.properties;

    return {
      id: trait.id,
      name: properties.Name.title[0]?.plain_text || "Unnamed Trait",
      description: properties.Description.rich_text[0]?.plain_text || "",
      cost: properties.Cost.number || 0,
      type: properties.Type.select?.name.toLowerCase() || "ancestry",
      category: properties.Category.select?.name.toLowerCase() || "general",
      required: properties.Required.checkbox || false,
      isAvailableInPointBuy: properties.AvailableInPointBuy.checkbox || false,
      spellRefs: properties.SpellReferences.relation.map(rel => rel.id) || [],
    };
  });
}

/**
 * Process raw spell data from Notion
 */
function processSpells(rawSpells) {
  return rawSpells.map(spell => {
    const properties = spell.properties;

    return {
      id: spell.id,
      name: properties.Name.title[0]?.plain_text || "Unnamed Spell",
      description: properties.Description.rich_text[0]?.plain_text || "",
      level: properties.Level.number || 0,
      school: properties.School.select?.name || "",
      castingTime: properties.CastingTime.rich_text[0]?.plain_text || "",
      range: properties.Range.rich_text[0]?.plain_text || "",
      components: properties.Components.rich_text[0]?.plain_text || "",
      duration: properties.Duration.rich_text[0]?.plain_text || "",
    };
  });
}

/**
 * Build complete prebuilt ancestries with their archetypes and traits
 */
function buildPrebuiltAncestries(ancestries, archetypes, traits, spells) {
  if (USE_MOCK_DATA) {
    // For mock data, we need to create a simpler structure
    return ancestries.map(ancestry => {
      // Get matching archetypes for this ancestry
      const ancestryArchetypes = archetypes
        .filter(archetype => archetype.ancestryId === ancestry.id)
        .map(archetype => {
          // For each archetype, assign some traits
          const archetypeTraits = traits
            .filter(t => t.type === 'ancestry')
            .slice(0, 3) // Just pick a few traits for testing
            .map(trait => ({
              ...trait,
              spells: trait.spellRefs
                .map(spellId => spells.find(s => s.id === spellId))
                .filter(Boolean)
            }));

          return {
            ...archetype,
            traits: archetypeTraits
          };
        });

      // Create some base traits
      const baseTraits = traits
        .filter(t => t.type === 'ancestry')
        .slice(0, 3)
        .map(trait => ({
          ...trait,
          spells: trait.spellRefs
            .map(spellId => spells.find(s => s.id === spellId))
            .filter(Boolean)
        }));

      return {
        ...ancestry,
        baseTraits,
        archetypes: ancestryArchetypes
      };
    });
  }

  // Original implementation for Notion data
  return ancestries.map(ancestry => {
    // Find base traits for this ancestry
    const baseTraits = ancestry.baseTraitIds.map(traitId => {
      const trait = traits.find(t => t.id === traitId);
      if (!trait) return null;

      // Add spell references to trait if needed
      return {
        ...trait,
        spells: trait.spellRefs.map(spellId => spells.find(s => s.id === spellId)).filter(Boolean)
      };
    }).filter(Boolean);

    // Find archetypes for this ancestry
    const ancestryArchetypes = archetypes
      .filter(archetype => archetype.ancestryId === ancestry.id)
      .map(archetype => {
        // Find traits for this archetype
        const archetypeTraits = archetype.traitIds.map(traitId => {
          const trait = traits.find(t => t.id === traitId);
          if (!trait) return null;

          // Add spell references to trait if needed
          return {
            ...trait,
            spells: trait.spellRefs.map(spellId => spells.find(s => s.id === spellId)).filter(Boolean)
          };
        }).filter(Boolean);

        return {
          ...archetype,
          traits: archetypeTraits
        };
      });

    return {
      ...ancestry,
      baseTraits,
      archetypes: ancestryArchetypes
    };
  });
}

/**
 * Organize traits for the point-buy system
 */
function organizeTraitsForPointBuy(traits, spells) {
  const traitsWithSpells = traits.map(trait => ({
    ...trait,
    spells: trait.spellRefs.map(spellId => spells.find(s => s.id === spellId)).filter(Boolean)
  }));

  const ancestryTraits = traitsWithSpells.filter(t => t.type === 'ancestry');
  const cultureTraits = traitsWithSpells.filter(t => t.type === 'culture');

  const groupedAncestryTraits = ancestryTraits.reduce((grouped, trait) => {
    const category = trait.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(trait);
    return grouped;
  }, {});

  const groupedCultureTraits = cultureTraits.reduce((grouped, trait) => {
    const category = trait.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(trait);
    return grouped;
  }, {});

  return {
    ancestryTraits: groupedAncestryTraits,
    cultureTraits: groupedCultureTraits
  };
}

/**
 * Helper function to convert Notion text to usable HTML
 */
export function notionTextToHtml(richText) {
  if (!richText || richText.length === 0) return '';

  return richText.map(text => {
    let content = text.plain_text;

    // Apply formatting
    if (text.annotations.bold) content = `<strong>${content}</strong>`;
    if (text.annotations.italic) content = `<em>${content}</em>`;
    if (text.annotations.strikethrough) content = `<del>${content}</del>`;
    if (text.annotations.underline) content = `<u>${content}</u>`;
    if (text.annotations.code) content = `<code>${content}</code>`;

    // Apply links
    if (text.href) content = `<a href="${text.href}" target="_blank" rel="noopener noreferrer">${content}</a>`;

    return content;
  }).join('');
} 