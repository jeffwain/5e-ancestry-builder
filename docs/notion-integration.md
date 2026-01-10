import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Database IDs
const ANCESTRIES_DB_ID = process.env.NOTION_ANCESTRIES_DB_ID;
const ARCHETYPES_DB_ID = process.env.NOTION_ARCHETYPES_DB_ID;
const TRAITS_DB_ID = process.env.NOTION_TRAITS_DB_ID;
const SPELLS_DB_ID = process.env.NOTION_SPELLS_DB_ID;

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
    const ancestries = processAncestries(ancestriesResponse.results);
    const archetypes = processArchetypes(archetypesResponse.results);
    const traits = processTraits(traitsResponse.results);
    const spells = processSpells(spellsResponse.results);

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
  return await notion.databases.query({
    database_id: ANCESTRIES_DB_ID,
    sorts: [{ property: "Name", direction: "ascending" }],
  });
}

/**
 * Fetch all archetypes from Notion
 */
async function fetchArchetypes() {
  return await notion.databases.query({
    database_id: ARCHETYPES_DB_ID,
    sorts: [{ property: "Name", direction: "ascending" }],
  });
}

/**
 * Fetch all traits from Notion
 */
async function fetchTraits() {
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
  return await notion.databases.query({
    database_id: SPELLS_DB_ID,
    sorts: [{ property: "Name", direction: "ascending" }],
  });
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
  // Add spell references to traits
  const traitsWithSpells = traits.map(trait => ({
    ...trait,
    spells: trait.spellRefs.map(spellId => spells.find(s => s.id === spellId)).filter(Boolean)
  }));
  
  // Split traits by type
  const ancestryTraits = traitsWithSpells.filter(t => t.type === 'ancestry');
  const cultureTraits = traitsWithSpells.filter(t => t.type === 'culture');
  
  // Group ancestry traits by category
  const groupedAncestryTraits = ancestryTraits.reduce((grouped, trait) => {
    const category = trait.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(trait);
    return grouped;
  }, {});
  
  // Group culture traits by category
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
 * Custom hook for using the ancestry data in components
 */
export function useNotionData() {
  const [data, setData] = useState({
    prebuiltAncestries: [],
    ancestryTraits: {},
    cultureTraits: {},
    loading: true,
    error: null
  });
  
  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchAncestryData();
        setData({
          prebuiltAncestries: result.prebuiltAncestries,
          ancestryTraits: result.ancestryTraits,
          cultureTraits: result.cultureTraits,
          loading: false,
          error: null
        });
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    }
    
    loadData();
  }, []);
  
  return data;
}

// Helper function to convert Notion text to usable HTML
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