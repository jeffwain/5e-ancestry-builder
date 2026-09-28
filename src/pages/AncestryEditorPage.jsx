import { useState, useEffect, useMemo, useCallback } from 'react';
import { TraitTooltip } from '../components/TraitTooltip';
import { useCharacter } from '../contexts/CharacterContext';
import { useConvertedTraits, combineTraitLookups } from '../hooks/useConvertedTraits';
import { ancestryIssues } from '../utils/ancestryResolve';
import { loadJson } from '../utils/dataCache';
import { POINT_BUDGET } from '../utils/traitDisplay';
import './AncestryEditorPage.css';

/*
 * Ancestry source editor.
 *
 * Reads and writes public/data/ancestries-*.mjs through the dev-server API in
 * vite.config.js. Every existing trait entry is carried as its *original source
 * text*, so saving a slot rewrites only the entries you changed and leaves
 * comments, `note` strings and inline definitions untouched.
 *
 * All styles live in AncestryEditorPage.css under the `ae-` prefix, so the whole
 * feature can be lifted out later by deleting that file, this file, and the
 * plugin in vite.config.js.
 */

const slotKey = (t) =>
  `${t.file}|${t.ancestryId}|${t.sublineageId || ''}|${t.archetypeId || ''}`;

/** Flatten traits.json into searchable rows with their category context. */
function indexTraits(data) {
  const rows = [];
  const byId = {};
  for (const [typeKey, type] of Object.entries(data.traitTypes || {})) {
    for (const [catKey, cat] of Object.entries(type.categories || {})) {
      for (const trait of cat.traits || []) {
        const row = {
          id: trait.id,
          name: trait.name,
          points: trait.points,
          options: trait.options || [],
          requiresOption: Boolean(trait.requiresOption),
          type: typeKey,
          category: catKey,
          categoryName: cat.name,
          description: trait.description || '',
          // The untouched trait, for the hover tooltip.
          raw: { ...trait, type: typeKey, categoryName: cat.name },
        };
        rows.push(row);
        byId[trait.id] = row;
      }
    }
  }
  return { rows, byId };
}

/** Point cost of one element, mirroring the build script's resolution order. */
function pointsOf(el, byId) {
  if (el.points !== undefined && el.points !== null) return el.points;
  if (!el.id) return 0;
  const base = byId[el.id];
  if (!base) return 0;
  if (el.option) {
    const opt = (base.options || []).find(o => o.id === el.option);
    return opt ? (opt.points ?? 0) : (base.points ?? 0);
  }
  return base.points ?? 0;
}

/**
 * Human-readable name for a source element: "Tooth and Nail (Claws)" rather
 * than the raw `tooth-nail:claws` reference. An ancestry's own `name:` override
 * wins over the curated name, matching how the trait renders elsewhere.
 */
function displayName(el, byId) {
  if (el.kind === 'spread') return el.label;
  if (el.kind === 'inline') return el.nameOverride || el.label;

  const base = byId[el.id];
  const name = el.nameOverride || base?.name || el.id;
  if (!el.option) return name;

  const opt = (base?.options || []).find(o => o.id === el.option);
  const optName = opt?.name || el.option;

  // An override that already names the option ("Horns" on tooth-nail:horns)
  // would otherwise read "Horns (Horns)".
  if (el.nameOverride && el.nameOverride.toLowerCase().includes(optName.toLowerCase())) {
    return el.nameOverride;
  }
  return `${name} (${optName})`;
}

/**
 * A trait object the shared tooltip can render. Curated references get the real
 * trait plus any per-ancestry overrides; inline entries get a stand-in built
 * from what the source file declares.
 */
function tooltipTrait(el, byId) {
  if (el.kind === 'inline') {
    return {
      id: el.id || 'inline',
      name: el.nameOverride || el.label,
      description: el.description || '',
      points: el.points,
    };
  }
  const base = byId[el.id];
  if (!base) return null;
  return {
    ...base.raw,
    ...(el.nameOverride ? { nameOverride: el.nameOverride } : {}),
    ...(el.descriptionOverride ? { descriptionOverride: el.descriptionOverride } : {}),
    ...(el.points !== undefined && el.points !== null ? { pointsOverride: el.points } : {}),
  };
}

/** Build the source text for a newly added curated trait reference. */
function refText(id, option) {
  return option ? `'${id}:${option}'` : `'${id}'`;
}

function traitSearchText(row) {
  return `${row.name} ${row.id} ${row.categoryName} ${row.type}`.toLowerCase();
}

function optionSearchText(option) {
  return `${option.name} ${option.id}`.toLowerCase();
}

/**
 * Options a query is asking for.
 * null hides the trait. [] means the trait matched on its own name, so every
 * option stays available. "cultural skill > beast tracker" requires both sides,
 * because neither the trait name nor the option name contains that whole string.
 */
function matchedOptionsFor(row, query) {
  const parts = query.split(/\s*[>›]\s*/).map((part) => part.trim()).filter(Boolean);
  const traitHit = (term) => traitSearchText(row).includes(term);
  const optionHits = (term) => row.options.filter((option) => optionSearchText(option).includes(term));

  if (parts.length >= 2) {
    const matched = optionHits(parts.slice(1).join(' '));
    if (!traitHit(parts[0]) || matched.length === 0) return null;
    return matched;
  }

  const matched = optionHits(query);
  if (traitHit(query)) return [];
  return matched.length ? matched : null;
}

/** Build the source text for a new inline trait. */
function inlineText({ name, points, description }) {
  const parts = [
    `name: ${JSON.stringify(name)}`,
    `points: ${Number(points) || 0}`,
  ];
  if (description) parts.push(`description: ${JSON.stringify(description)}`);
  return `[null, { ${parts.join(', ')} }]`;
}

/**
 * The key the build de-duplicates on. Spreads resolve only in the build; the
 * one in the source is the 0-point size pair, so it counts as 0 and never drops.
 */
function elementKey(el) {
  if (el.kind === 'inline') return `inline:${el.nameOverride || el.label}`;
  if (!el.id) return null;
  return el.option ? `${el.id}:${el.option}` : el.id;
}

/**
 * Price one slot the way the build does: an element already granted higher up
 * the chain (or earlier in the same list) is dropped and costs nothing.
 * Returns the rows, the slot's own total, and every key granted so far.
 */
function resolveSlot(elements, inheritedKeys, byId) {
  const seen = new Set(inheritedKeys);
  let total = 0;
  const rows = elements.map((el) => {
    const key = elementKey(el);
    const dropped = key !== null && seen.has(key);
    if (key) seen.add(key);
    const points = pointsOf(el, byId);
    if (!dropped) total += points;
    return { el, points, dropped };
  });
  return { rows, total, keys: [...seen] };
}

const fileLabel = (file) => file.charAt(0).toUpperCase() + file.slice(1);

/** Icons for the row actions, drawn so they sit on the same box as the text. */
const ICONS = {
  up: 'M4 10l4-4 4 4',
  down: 'M4 6l4 4 4-4',
  remove: 'M4.5 4.5l7 7M11.5 4.5l-7 7',
};

function RowIcon({ name }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d={ICONS[name]} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AncestryEditorPage() {
  const [sources, setSources] = useState(null);
  const [traitIndex, setTraitIndex] = useState({ rows: [], byId: {} });
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState(null);   // { file, ancestryId, sublineageId? }
  const [activeSlot, setActiveSlot] = useState(null); // slot target object
  const [edits, setEdits] = useState({});           // slotKey -> element[]

  const [ancestryFilter, setAncestryFilter] = useState('');
  const [traitFilter, setTraitFilter] = useState('');
  const [pendingOption, setPendingOption] = useState({}); // traitId -> optionId
  const [inlineDraft, setInlineDraft] = useState({ name: '', points: 0, description: '' });
  const [showInline, setShowInline] = useState(false);

  // ── load ────────────────────────────────────────────────────────────────
  const reload = useCallback(() => {
    Promise.all([
      fetch('/api/ancestry-source').then(r => r.json()),
      fetch('/data/traits.json').then(r => r.json()),
    ])
      .then(([src, traits]) => {
        if (src.error) throw new Error(src.error);
        setSources(src.sources);
        setTraitIndex(indexTraits(traits));
        setEdits({});
      })
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // ── warnings, from the last build ───────────────────────────────────────
  // Recommended traits and off-budget archetypes are only known once the source
  // is built (the build adds RECOMMENDED: and drops re-listed traits), so these
  // read converted-ancestries.json — as of the last `npm run ancestries`.
  const { allTraits } = useCharacter();
  const { convertedTraitsById } = useConvertedTraits();
  const [built, setBuilt] = useState(null);

  useEffect(() => {
    loadJson('/data/converted-ancestries.json').then(setBuilt).catch(() => {});
  }, []);

  const issuesById = useMemo(() => {
    if (!built) return {};
    const lookup = combineTraitLookups(convertedTraitsById, allTraits);
    const byId = {};
    for (const category of built.categories || []) {
      for (const ancestry of category.ancestries || []) {
        byId[ancestry.id] = ancestryIssues(ancestry, lookup);
      }
      // A lineage with sub-lineages has no archetypes of its own; it carries
      // the sum of its children's.
      for (const sub of category.subcategories || []) {
        const children = (sub.ancestries || []).map((ancestry) => {
          byId[ancestry.id] = ancestryIssues(ancestry, lookup);
          return byId[ancestry.id];
        });
        byId[sub.id] = {
          recommended: children.reduce((sum, child) => sum + child.recommended, 0),
          offBudget: children.flatMap((child) => child.offBudget),
        };
      }
    }
    return byId;
  }, [built, convertedTraitsById, allTraits]);

  // ── derived ─────────────────────────────────────────────────────────────
  const lineages = useMemo(() => {
    if (!sources) return [];
    const out = [];
    for (const file of sources) {
      for (const lineage of file.lineages) {
        out.push({ file: file.file, ...lineage, sublineageId: null });
        for (const sub of lineage.sublineages || []) {
          out.push({
            file: file.file,
            id: lineage.id,
            sublineageId: sub.id,
            name: `${lineage.name} › ${sub.name}`,
            subName: sub.name,
            summary: lineage.summary,
            shared: sub.shared,
            archetypes: sub.archetypes,
            sublineages: [],
            // The lineage's own shared traits sit above this one in the chain.
            parent: { name: lineage.name, shared: lineage.shared },
          });
        }
      }
    }
    return out;
  }, [sources]);

  const visibleLineages = useMemo(() => {
    const q = ancestryFilter.trim().toLowerCase();
    if (!q) return lineages;
    return lineages.filter(l => l.name.toLowerCase().includes(q) || l.id.includes(q));
  }, [lineages, ancestryFilter]);

  const current = useMemo(() => {
    if (!selected) return null;
    return lineages.find(l =>
      l.file === selected.file &&
      l.id === selected.ancestryId &&
      (l.sublineageId || null) === (selected.sublineageId || null)
    ) || null;
  }, [lineages, selected]);

  /** Elements for a slot: local edit if dirty, otherwise the parsed original. */
  const elementsFor = useCallback((target, original) => {
    const key = slotKey(target);
    return edits[key] ?? (original?.elements || []);
  }, [edits]);

  const isDirty = (target) => Object.prototype.hasOwnProperty.call(edits, slotKey(target));
  const dirtyKeys = Object.keys(edits);
  const hasEdits = dirtyKeys.length > 0;

  // Unsaved edits live only in this page; leaving it would lose them.
  useEffect(() => {
    if (!hasEdits) return undefined;
    const warn = (e) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasEdits]);

  /** True when any slot of this list entry has unsaved edits. */
  const entryIsDirty = (entry) =>
    dirtyKeys.some((key) => key.startsWith(`${entry.file}|${entry.id}|${entry.sublineageId || ''}|`));

  const discard = () => {
    setEdits({});
    setStatus('Discarded unsaved edits.');
  };

  const revertSlot = (target, label) => {
    setEdits((prev) => {
      const next = { ...prev };
      delete next[slotKey(target)];
      return next;
    });
    setStatus(`Reverted ${label}.`);
  };

  const mutate = (target, original, fn) => {
    const key = slotKey(target);
    const base = edits[key] ?? (original?.elements || []);
    setEdits(prev => ({ ...prev, [key]: fn([...base]) }));
  };

  const removeAt = (target, original, idx) =>
    mutate(target, original, list => list.filter((_, i) => i !== idx));

  const moveEl = (target, original, idx, dir) =>
    mutate(target, original, (list) => {
      const to = idx + dir;
      if (to < 0 || to >= list.length) return list;
      const [item] = list.splice(idx, 1);
      list.splice(to, 0, item);
      return list;
    });

  const addTrait = (row, optionId) => {
    if (!activeSlot) { setStatus('Pick a target slot first.'); return; }
    // The dropdown is what the user sees, so Add writes that option — including
    // when the search landed on one (Cultural Skill › Beast Tracker).
    const option = optionId || undefined;
    const el = {
      kind: 'ref',
      id: row.id,
      option,
      label: row.name,
      text: refText(row.id, option),
    };
    mutate(activeSlot, activeSlot.original, list => [...list, el]);
    const optName = row.options.find((entry) => entry.id === option)?.name;
    setStatus(`Added ${row.name}${optName ? ` (${optName})` : ''}`);
  };

  const addInline = () => {
    if (!activeSlot) { setStatus('Pick a target slot first.'); return; }
    if (!inlineDraft.name.trim()) { setStatus('Inline trait needs a name.'); return; }
    const el = {
      kind: 'inline',
      label: inlineDraft.name,
      points: Number(inlineDraft.points) || 0,
      text: inlineText(inlineDraft),
    };
    mutate(activeSlot, activeSlot.original, list => [...list, el]);
    setInlineDraft({ name: '', points: 0, description: '' });
    setShowInline(false);
    setStatus(`Added inline trait "${el.label}"`);
  };

  const save = async () => {
    if (!dirtyKeys.length) return;
    setSaving(true);
    setStatus('Saving…');
    try {
      for (const key of dirtyKeys) {
        const [file, ancestryId, sublineageId, archetypeId] = key.split('|');
        const res = await fetch('/api/ancestry-source', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file,
            target: {
              ancestryId,
              sublineageId: sublineageId || undefined,
              archetypeId: archetypeId || undefined,
            },
            elements: edits[key].map(e => e.text),
          }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Write failed');
      }
      setStatus(`Saved ${dirtyKeys.length} slot${dirtyKeys.length === 1 ? '' : 's'}. Run \`npm run ancestries\` to rebuild.`);
      reload();
    } catch (err) {
      setStatus(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const visibleTraits = useMemo(() => {
    const q = traitFilter.trim().toLowerCase();
    if (!q) return traitIndex.rows.map((row) => ({ row, matchedOptions: [] }));
    const hits = [];
    for (const row of traitIndex.rows) {
      const matchedOptions = matchedOptionsFor(row, q);
      if (matchedOptions) hits.push({ row, matchedOptions });
    }
    return hits;
  }, [traitIndex.rows, traitFilter]);

  // traits.json is already in category order, so each run of one category is a group.
  const traitGroups = useMemo(() => {
    const groups = [];
    for (const hit of visibleTraits) {
      const key = `${hit.row.type}|${hit.row.category}`;
      const last = groups[groups.length - 1];
      if (last?.key === key) last.hits.push(hit);
      else groups.push({ key, name: hit.row.categoryName, hits: [hit] });
    }
    return groups;
  }, [visibleTraits]);

  // ── render ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="ae-page">
        <p className="ae-error">
          Could not reach the editor API: {error}
          <br />
          This page only works under <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  if (!sources) {
    return <div className="ae-page"><p className="ae-muted">Loading source files…</p></div>;
  }

  const { byId } = traitIndex;

  // ── the selected entry's chain, priced the way the build prices it ──────
  let chain = null;
  if (current) {
    const base = { file: current.file, ancestryId: current.id };
    const parentTarget = current.parent ? { ...base, sublineageId: null } : null;
    const parent = parentTarget
      ? resolveSlot(elementsFor(parentTarget, current.parent.shared), [], byId)
      : null;
    const sharedTarget = { ...base, sublineageId: current.sublineageId };
    const shared = resolveSlot(elementsFor(sharedTarget, current.shared), parent?.keys || [], byId);
    const sharedTotal = (parent?.total || 0) + shared.total;
    const archetypes = (current.archetypes || []).map((arc) => {
      const target = { ...sharedTarget, archetypeId: arc.id };
      const resolved = resolveSlot(elementsFor(target, arc.traits), shared.keys, byId);
      return { arc, target, resolved, total: sharedTotal + resolved.total };
    });
    chain = { parentTarget, parent, sharedTarget, shared, sharedTotal, archetypes };
  }

  // What the picker needs to know about the slot it adds to.
  const activeKey = activeSlot ? slotKey(activeSlot) : null;
  let activeGranted = null;
  let activeTotal = null;
  if (chain && activeKey) {
    if (activeKey === slotKey(chain.sharedTarget)) {
      activeGranted = new Set(chain.shared.keys);
    } else {
      const arc = chain.archetypes.find((a) => slotKey(a.target) === activeKey);
      if (arc) {
        activeGranted = new Set(arc.resolved.keys);
        activeTotal = arc.total;
      }
    }
  }

  const selectEntry = (entry) => {
    setSelected({ file: entry.file, ancestryId: entry.id, sublineageId: entry.sublineageId });
    setActiveSlot(null);
  };

  const renderRows = (target, original, resolved, editable) => {
    if (!resolved.rows.length) return <p className="ae-empty">No traits yet.</p>;
    const last = resolved.rows.length - 1;

    return (
      <ul className="ae-trait-rows">
        {resolved.rows.map(({ el, points, dropped }, idx) => {
          const tip = tooltipTrait(el, byId);
          const ref = el.id ? `${el.id}${el.option ? `:${el.option}` : ''}` : null;
          const label = (
            <span className="ae-row-label">
              <span className="ae-row-name">{displayName(el, byId)}</span>
              {ref && <span className="ae-row-ref" title={ref}>{ref}</span>}
              {el.kind === 'inline' && <span className="ae-tag">inline</span>}
              {el.kind === 'spread' && <span className="ae-tag">spread</span>}
              {el.hasNote && <span className="ae-tag ae-tag-note" title="Carries a provenance note">note</span>}
              {dropped && (
                <span
                  className="ae-tag"
                  title="Already granted higher up the chain. The build drops the repeat, so it costs nothing here."
                >
                  inherited
                </span>
              )}
            </span>
          );

          return (
            <li
              key={`${el.text}-${idx}`}
              className={`ae-trait-row ae-kind-${el.kind}${dropped ? ' ae-trait-row-dropped' : ''}`}
            >
              {tip ? (
                <TraitTooltip
                  trait={tip}
                  selectedOptions={el.option && el.id ? { [el.id]: el.option } : {}}
                  className="ae-row-trigger"
                  pinOnClick
                >
                  {label}
                </TraitTooltip>
              ) : <span className="ae-row-trigger">{label}</span>}
              <span className={`pill cost ae-row-pts${points === 0 ? ' free' : ''}`}>{points}</span>
              {editable && (
                <span className="ae-row-actions">
                  <button type="button" onClick={() => moveEl(target, original, idx, -1)} disabled={idx === 0} aria-label="Move up" title="Move up">
                    <RowIcon name="up" />
                  </button>
                  <button type="button" onClick={() => moveEl(target, original, idx, 1)} disabled={idx === last} aria-label="Move down" title="Move down">
                    <RowIcon name="down" />
                  </button>
                  <button type="button" className="ae-remove" onClick={() => removeAt(target, original, idx)} aria-label="Remove" title="Remove">
                    <RowIcon name="remove" />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderSlot = ({ label, target, original, resolved, extra = null, summary }) => {
    const key = slotKey(target);
    const active = activeKey === key;

    return (
      <section key={key} className={`ae-slot${active ? ' ae-slot-active' : ''}`}>
        <header className="ae-slot-head">
          <label className="ae-slot-target">
            <input
              type="radio"
              name="ae-slot-target"
              className="ae-slot-radio"
              checked={active}
              onChange={() => setActiveSlot({ ...target, original, label })}
            />
            <span className="ae-slot-name">{label}</span>
            {extra}
          </label>
          <span className="ae-slot-meta">
            {isDirty(target) && (
              <>
                <span className="ae-dirty">Edited</span>
                <button type="button" className="ae-linkish" onClick={() => revertSlot(target, label)}>Revert</button>
              </>
            )}
            {summary}
          </span>
        </header>
        {renderRows(target, original, resolved, true)}
      </section>
    );
  };

  // The list, grouped by source file.
  const listGroups = [];
  for (const entry of visibleLineages) {
    const last = listGroups[listGroups.length - 1];
    if (last?.file === entry.file) last.entries.push(entry);
    else listGroups.push({ file: entry.file, entries: [entry] });
  }
  const filtering = Boolean(ancestryFilter.trim());

  return (
    <div className="ae-page">
      <header className="ae-header">
        <div>
          <h1>Ancestry Editor</h1>
          <p className="ae-muted">
            Edits write straight to <code>public/data/ancestries-*.mjs</code>.
            Comments and notes are preserved — only the arrays you change are rewritten.
          </p>
        </div>
        <div className="ae-header-actions">
          <span className="ae-status" role="status">
            {status || (hasEdits ? `${dirtyKeys.length} unsaved slot${dirtyKeys.length === 1 ? '' : 's'}` : '')}
          </span>
          <button type="button" className="btn btn-secondary" onClick={discard} disabled={!hasEdits || saving}>
            Discard
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={!hasEdits || saving}>
            {saving ? 'Saving…' : `Save${hasEdits ? ` (${dirtyKeys.length})` : ''}`}
          </button>
        </div>
      </header>

      <div className="ae-grid">
        {/* ── Column 1: ancestries ─────────────────────────────────────── */}
        <nav className="ae-col ae-col-list" aria-label="Ancestries">
          <input
            type="search"
            className="ae-input"
            placeholder="Filter ancestries…"
            aria-label="Filter ancestries"
            value={ancestryFilter}
            onChange={(e) => setAncestryFilter(e.target.value)}
          />
          {listGroups.map((group) => (
            <section key={group.file} className="ae-ancestry-group">
              <h2 className="ae-ancestry-group-title">{fileLabel(group.file)}</h2>
              <ul className="ae-ancestry-list">
                {group.entries.map((l) => {
                  const isSel = current && current.file === l.file && current.id === l.id &&
                    (current.sublineageId || null) === (l.sublineageId || null);
                  const subCount = (l.sublineages || []).length;
                  const arcCount = (l.archetypes || []).length;
                  return (
                    <li key={`${l.file}-${l.id}-${l.sublineageId || ''}`}>
                      <button
                        type="button"
                        className={`ae-ancestry-btn${l.sublineageId ? ' ae-ancestry-btn-sub' : ''}${isSel ? ' selected' : ''}`}
                        aria-current={isSel ? 'true' : undefined}
                        onClick={() => selectEntry(l)}
                      >
                        <span className="ae-ancestry-name">
                          {l.sublineageId && !filtering ? l.subName : l.name}
                          {entryIsDirty(l) && <span className="ae-ancestry-dirty" title="Unsaved edits" />}
                        </span>
                        <span className="ae-ancestry-sub">
                          {subCount > 0
                            ? `${subCount} sub-lineage${subCount === 1 ? '' : 's'}`
                            : `${arcCount} archetype${arcCount === 1 ? '' : 's'}`}
                        </span>
                        <AncestryWarning issues={issuesById[l.sublineageId || l.id]} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {!listGroups.length && <p className="ae-empty">No ancestries match.</p>}
        </nav>

        {/* ── Column 2: the selected ancestry's slots ──────────────────── */}
        <main className="ae-col ae-col-edit">
          {!current && <p className="ae-muted">Select an ancestry to edit.</p>}

          {current && chain && (
            <>
              <header className="ae-current">
                <h2 className="ae-current-title">{current.name}</h2>
                {current.summary && <p className="ae-muted ae-current-sum">{current.summary}</p>}
              </header>

              {chain.parent && (
                <section className="ae-slot ae-slot-inherited">
                  <header className="ae-slot-head">
                    <span className="ae-slot-target">
                      <span className="ae-slot-name">Inherited from {current.parent.name}</span>
                    </span>
                    <span className="ae-slot-meta">
                      <button
                        type="button"
                        className="ae-linkish"
                        onClick={() => selectEntry({ file: current.file, id: current.id, sublineageId: null })}
                      >
                        Edit
                      </button>
                      <span className="ae-points">{chain.parent.total} pts</span>
                    </span>
                  </header>
                  {renderRows(chain.parentTarget, current.parent.shared, chain.parent, false)}
                </section>
              )}

              {renderSlot({
                label: 'Shared traits',
                target: chain.sharedTarget,
                original: current.shared,
                resolved: chain.shared,
                summary: (
                  <span className="ae-points">
                    {chain.shared.total} pts
                    {chain.parent && ` · ${chain.sharedTotal} with inherited`}
                  </span>
                ),
              })}

              <h3 className="ae-subhead">Archetypes</h3>
              {chain.archetypes.map(({ arc, target, resolved, total }) =>
                renderSlot({
                  label: arc.name,
                  target,
                  original: arc.traits,
                  resolved,
                  extra: arc.designed ? <span className="ae-tag">designed</span> : null,
                  summary: (
                    <>
                      <span className="ae-points" title="Shared traits + this archetype's own">
                        {chain.sharedTotal} + {resolved.total}
                      </span>
                      <BudgetPill total={total} />
                    </>
                  ),
                })
              )}
              {!chain.archetypes.length && (
                <p className="ae-empty">
                  {(current.sublineages || []).length
                    ? 'Archetypes live on the sub-lineages.'
                    : 'No archetypes on this entry.'}
                </p>
              )}
            </>
          )}
        </main>

        {/* ── Column 3: trait picker ──────────────────────────────────── */}
        <aside className="ae-col ae-col-picker" aria-label="Add traits">
          <div className="ae-picker-head">
            <p className={`ae-target${activeSlot ? '' : ' ae-target-none'}`}>
              {activeSlot && current ? (
                <>
                  <span>Adding to <strong>{current.name} › {activeSlot.label}</strong></span>
                  {activeTotal !== null && <BudgetPill total={activeTotal} />}
                </>
              ) : 'Choose a slot on the left to add traits to it.'}
            </p>
            <div className="ae-picker-search">
              <input
                type="search"
                className="ae-input"
                placeholder="Trait, option, or trait > option"
                aria-label="Search traits"
                value={traitFilter}
                onChange={(e) => {
                  setTraitFilter(e.target.value);
                  // A new query picks the matching option itself. A leftover
                  // choice from the previous query would hide that.
                  setPendingOption({});
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                aria-expanded={showInline}
                onClick={() => setShowInline((v) => !v)}
              >
                {showInline ? 'Cancel' : 'New inline'}
              </button>
            </div>
          </div>

          {showInline && (
            <form
              className="ae-inline-form"
              onSubmit={(e) => { e.preventDefault(); addInline(); }}
            >
              <div className="ae-inline-row">
                <label className="ae-field ae-field-grow">
                  <span className="ae-field-label">Name</span>
                  <input
                    className="ae-input"
                    value={inlineDraft.name}
                    onChange={(e) => setInlineDraft((d) => ({ ...d, name: e.target.value }))}
                  />
                </label>
                <label className="ae-field">
                  <span className="ae-field-label">Points</span>
                  <input
                    className="ae-input ae-input-pts"
                    type="number"
                    value={inlineDraft.points}
                    onChange={(e) => setInlineDraft((d) => ({ ...d, points: e.target.value }))}
                  />
                </label>
              </div>
              <label className="ae-field">
                <span className="ae-field-label">Description</span>
                <textarea
                  className="ae-input"
                  rows={3}
                  value={inlineDraft.description}
                  onChange={(e) => setInlineDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </label>
              <button type="submit" className="btn btn-secondary ae-add-inline" disabled={!activeSlot}>
                Add inline trait
              </button>
            </form>
          )}

          {traitGroups.map((group) => (
            <section key={group.key} className="ae-picker-group">
              <h3 className="ae-picker-group-title">{group.name}</h3>
              <ul className="ae-picker-rows">
                {group.hits.map(({ row, matchedOptions }) => {
                  const pending = pendingOption[row.id];
                  const selectedId = row.options.length
                    ? (pending || matchedOptions[0]?.id || row.options[0].id)
                    : undefined;
                  const selectedOption = row.options.find((option) => option.id === selectedId);
                  const shownPoints = selectedOption ? (selectedOption.points ?? 0) : (row.points ?? '—');
                  const granted = activeGranted?.has(selectedId ? `${row.id}:${selectedId}` : row.id);
                  return (
                    <li key={row.id} className="ae-picker-row">
                      <div className="ae-picker-main">
                        <TraitTooltip
                          trait={row.raw}
                          selectedOptions={selectedId ? { [row.id]: selectedId } : {}}
                          className="ae-row-trigger"
                          pinOnClick
                        >
                          <span className="ae-row-label">
                            <span className="ae-row-name">
                              {row.name}
                              {matchedOptions.length > 0 && (
                                <span className="ae-picker-hit"> › {matchedOptions.map((option) => option.name).join(', ')}</span>
                              )}
                            </span>
                            {granted && (
                              <span className="ae-tag" title="Already in this slot or inherited by it">granted</span>
                            )}
                          </span>
                          <span className="ae-row-ref">{row.id}{selectedId ? `:${selectedId}` : ''}</span>
                        </TraitTooltip>
                        {row.options.length > 0 && (
                          <select
                            className="ae-select"
                            aria-label={`${row.name} option`}
                            value={selectedId}
                            onChange={(e) => setPendingOption((p) => ({ ...p, [row.id]: e.target.value }))}
                          >
                            {row.options.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.name} ({o.points ?? 0})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <span className={`pill cost ae-row-pts${shownPoints === 0 ? ' free' : ''}`}>{shownPoints}</span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => addTrait(row, selectedId)}
                        disabled={!activeSlot}
                        title={activeSlot ? `Add to ${activeSlot.label}` : 'Choose a slot first'}
                      >
                        Add
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {!traitGroups.length && <p className="ae-empty">No traits match.</p>}
        </aside>
      </div>
    </div>
  );
}

/** Chain total against the budget: green on it, amber off it. */
function BudgetPill({ total }) {
  const delta = total - POINT_BUDGET;
  return (
    <span
      className={`pill ${delta === 0 ? 'free' : 'requirement'}`}
      title={delta === 0 ? 'On budget' : `${delta > 0 ? '+' : ''}${delta} from the ${POINT_BUDGET}-point budget`}
    >
      {total} / {POINT_BUDGET}
    </span>
  );
}

/**
 * The list's warning for one ancestry: recommended traits still standing in for
 * source text, and archetypes that don't come to the full budget.
 */
function AncestryWarning({ issues }) {
  if (!issues) return null;
  const { recommended, offBudget } = issues;
  if (recommended === 0 && offBudget.length === 0) return null;

  return (
    <span className="ae-ancestry-warning">
      {recommended > 0 && (
        <span
          className="pill requirement"
          title={`${recommended} recommended trait${recommended === 1 ? '' : 's'} standing in for source text`}
        >
          {recommended} recommended
        </span>
      )}
      {offBudget.length > 0 && (
        <span
          className="pill requirement"
          title={`Not ${POINT_BUDGET} points: ${offBudget.map((a) => `${a.name} (${a.total})`).join(', ')}`}
        >
          {offBudget.length} ≠ {POINT_BUDGET}
        </span>
      )}
    </span>
  );
}
