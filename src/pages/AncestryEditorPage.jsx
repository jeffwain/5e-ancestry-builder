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
            summary: lineage.summary,
            shared: sub.shared,
            archetypes: sub.archetypes,
            sublineages: [],
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

  const renderSlot = (label, target, original, extra = null) => {
    const els = elementsFor(target, original);
    const key = slotKey(target);
    const active = activeSlot && slotKey(activeSlot) === key;
    const total = els.reduce((n, e) => n + pointsOf(e, traitIndex.byId), 0);

    return (
      <section key={key} className={`ae-slot${active ? ' ae-slot-active' : ''}`}>
        <header className="ae-slot-head">
          <button
            type="button"
            className="ae-slot-target"
            onClick={() => setActiveSlot({ ...target, original })}
            title="Make this the target for added traits"
          >
            {active ? '● ' : '○ '}{label}
          </button>
          <span className="ae-slot-meta">
            {extra}
            <span className="ae-points">{total} pts</span>
            {isDirty(target) && <span className="ae-dirty">edited</span>}
          </span>
        </header>

        {els.length === 0 && <p className="ae-muted ae-empty">No traits.</p>}

        <ul className="ae-trait-rows">
          {els.map((el, idx) => {
            const tip = tooltipTrait(el, traitIndex.byId);
            const label = (
              <span className="ae-row-label">
                <span className="ae-row-name">{displayName(el, traitIndex.byId)}</span>
                {el.kind !== 'spread' && <span className="ae-row-ref">{el.id ? `${el.id}${el.option ? `:${el.option}` : ''}` : 'inline'}</span>}
                {el.kind === 'inline' && <span className="ae-tag">inline</span>}
                {el.kind === 'spread' && <span className="ae-tag">spread</span>}
                {el.hasNote && <span className="ae-tag ae-tag-note" title="Carries a provenance note">note</span>}
              </span>
            );

            return (
            <li key={`${el.text}-${idx}`} className={`ae-trait-row ae-kind-${el.kind}`}>
              {tip ? (
                <TraitTooltip
                  trait={tip}
                  selectedOptions={el.option && el.id ? { [el.id]: el.option } : {}}
                  className="ae-row-trigger"
                  pinOnClick
                >
                  {label}
                </TraitTooltip>
              ) : label}
              <span className="ae-row-pts">{pointsOf(el, traitIndex.byId)}</span>
              <span className="ae-row-actions">
                <button type="button" onClick={() => moveEl(target, original, idx, -1)} title="Move up">↑</button>
                <button type="button" onClick={() => moveEl(target, original, idx, 1)} title="Move down">↓</button>
                <button type="button" className="ae-remove" onClick={() => removeAt(target, original, idx)} title="Remove">×</button>
              </span>
            </li>
            );
          })}
        </ul>
      </section>
    );
  };

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
          <span className="ae-status">{status}</span>
          <button
            type="button"
            className="ae-save"
            onClick={save}
            disabled={!dirtyKeys.length || saving}
          >
            {saving ? 'Saving…' : `Save${dirtyKeys.length ? ` (${dirtyKeys.length})` : ''}`}
          </button>
        </div>
      </header>

      <div className="ae-grid">
        {/* ── Column 1: ancestries ─────────────────────────────────────── */}
        <aside className="ae-col ae-col-list">
          <input
            className="ae-input"
            placeholder="Filter ancestries…"
            value={ancestryFilter}
            onChange={(e) => setAncestryFilter(e.target.value)}
          />
          <ul className="ae-ancestry-list">
            {visibleLineages.map((l) => {
              const isSel = current && current.id === l.id &&
                (current.sublineageId || null) === (l.sublineageId || null);
              return (
                <li key={`${l.file}-${l.id}-${l.sublineageId || ''}`}>
                  <button
                    type="button"
                    className={`ae-ancestry-btn${isSel ? ' selected' : ''}`}
                    onClick={() => {
                      setSelected({ file: l.file, ancestryId: l.id, sublineageId: l.sublineageId });
                      setActiveSlot(null);
                    }}
                  >
                    <span className="ae-ancestry-name">{l.name}</span>
                    <span className="ae-ancestry-sub">
                      {l.file} · {(l.archetypes || []).length} arch
                      <AncestryWarning issues={issuesById[l.sublineageId || l.id]} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Column 2: the selected ancestry's slots ──────────────────── */}
        <main className="ae-col ae-col-edit">
          {!current && <p className="ae-muted">Select an ancestry to edit.</p>}

          {current && (
            <>
              <h2 className="ae-current-title">{current.name}</h2>
              {current.summary && <p className="ae-muted ae-current-sum">{current.summary}</p>}

              {renderSlot(
                'Shared traits',
                { file: current.file, ancestryId: current.id, sublineageId: current.sublineageId },
                current.shared
              )}

              <h3 className="ae-subhead">Archetypes</h3>
              {(current.archetypes || []).map((arc) =>
                renderSlot(
                  arc.name,
                  {
                    file: current.file,
                    ancestryId: current.id,
                    sublineageId: current.sublineageId,
                    archetypeId: arc.id,
                  },
                  arc.traits,
                  arc.designed ? <span className="ae-tag">designed</span> : null
                )
              )}
              {!(current.archetypes || []).length && (
                <p className="ae-muted">No archetypes on this entry.</p>
              )}
            </>
          )}
        </main>

        {/* ── Column 3: trait picker ──────────────────────────────────── */}
        <aside className="ae-col ae-col-picker">
          <div className="ae-picker-head">
            <input
              className="ae-input"
              placeholder="Trait, option, or trait > option"
              value={traitFilter}
              onChange={(e) => {
                setTraitFilter(e.target.value);
                // A new query picks the matching option itself. A leftover
                // choice from the previous query would hide that.
                setPendingOption({});
              }}
            />
            <p className="ae-muted ae-target-line">
              {activeSlot
                ? <>Adding to <strong>{activeSlot.archetypeId || 'shared traits'}</strong></>
                : 'Pick a target slot on the left'}
            </p>
          </div>

          <div className="ae-table-wrap">
            <table className="ae-table">
              <thead>
                <tr>
                  <th>Trait</th>
                  <th>Category</th>
                  <th className="ae-num">Pts</th>
                  <th>Option</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibleTraits.map(({ row, matchedOptions }) => {
                  const pending = pendingOption[row.id];
                  const selectedId = row.options.length
                    ? (pending || matchedOptions[0]?.id || row.options[0].id)
                    : undefined;
                  const selectedOption = row.options.find((option) => option.id === selectedId);
                  const shownPoints = selectedOption ? (selectedOption.points ?? 0) : (row.points ?? '—');
                  return (
                  <tr key={row.id}>
                    <td>
                      <span className="ae-t-name">
                        {row.name}
                        {matchedOptions.length > 0 && (
                          <span className="ae-t-hit"> › {matchedOptions.map((option) => option.name).join(', ')}</span>
                        )}
                      </span>
                      <span className="ae-t-id">{row.id}{selectedId ? `:${selectedId}` : ''}</span>
                    </td>
                    <td className="ae-t-cat">{row.categoryName}</td>
                    <td className="ae-num">{shownPoints}</td>
                    <td>
                      {row.options.length > 0 ? (
                        <select
                          className="ae-select"
                          value={selectedId}
                          onChange={(e) => setPendingOption(p => ({ ...p, [row.id]: e.target.value }))}
                        >
                          {row.options.map(o => (
                            <option key={o.id} value={o.id}>
                              {o.name} ({o.points ?? 0})
                            </option>
                          ))}
                        </select>
                      ) : <span className="ae-muted">—</span>}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="ae-add"
                        onClick={() => addTrait(row, selectedId)}
                        disabled={!activeSlot}
                        title={activeSlot ? 'Add to target slot' : 'Pick a target slot first'}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="ae-inline-box">
            <button type="button" className="ae-linkish" onClick={() => setShowInline(v => !v)}>
              {showInline ? '− Hide inline trait' : '+ New inline trait'}
            </button>
            {showInline && (
              <div className="ae-inline-form">
                <input
                  className="ae-input"
                  placeholder="Name"
                  value={inlineDraft.name}
                  onChange={(e) => setInlineDraft(d => ({ ...d, name: e.target.value }))}
                />
                <input
                  className="ae-input ae-input-pts"
                  type="number"
                  placeholder="Points"
                  value={inlineDraft.points}
                  onChange={(e) => setInlineDraft(d => ({ ...d, points: e.target.value }))}
                />
                <textarea
                  className="ae-input"
                  rows={3}
                  placeholder="Description"
                  value={inlineDraft.description}
                  onChange={(e) => setInlineDraft(d => ({ ...d, description: e.target.value }))}
                />
                <button type="button" className="ae-add-inline" onClick={addInline} disabled={!activeSlot}>
                  Add inline trait
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
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

  const parts = [];
  if (recommended > 0) parts.push(`${recommended} recommended`);
  if (offBudget.length > 0) parts.push(`${offBudget.length} ≠ ${POINT_BUDGET} pts`);

  const detail = [
    recommended > 0 && `${recommended} recommended trait${recommended === 1 ? '' : 's'}`,
    offBudget.length > 0 &&
      `Not ${POINT_BUDGET} points: ${offBudget.map((a) => `${a.name} (${a.total})`).join(', ')}`,
  ].filter(Boolean).join('\n');

  return (
    <span className="ae-ancestry-warning" title={detail}>
      <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1.5 15 14H1z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {parts.join(' · ')}
    </span>
  );
}
