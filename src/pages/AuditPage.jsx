import { useState, useEffect, useMemo } from 'react';
import { useConvertedTraits, combineTraitLookups } from '../hooks/useConvertedTraits';
import './AuditPage.css';

// Status codes for a single trait reference within an ancestry/archetype.
const STATUS = {
  OK: 'ok',                  // id resolves cleanly against the lookup
  OVERRIDE: 'override',      // id resolves AND the ancestry overrides name/desc/points
  INLINE: 'inline',          // no id, but inline name/description provided (custom trait)
  BAD_OPTION: 'bad-option',  // id resolves but the referenced option doesn't exist on it
  UNRESOLVED: 'unresolved',  // id present but not found in the lookup
  EMPTY: 'empty',            // neither id nor name — malformed reference
  UNUSED: 'unused'           // trait exists in the vocabulary but no ancestry references it
};

const STATUS_LABEL = {
  [STATUS.OK]: 'Found',
  [STATUS.OVERRIDE]: 'Has override',
  [STATUS.INLINE]: 'Inline custom',
  [STATUS.BAD_OPTION]: 'Bad option',
  [STATUS.UNRESOLVED]: 'Unresolved id',
  [STATUS.EMPTY]: 'Empty ref',
  [STATUS.UNUSED]: 'Not used'
};

const ERROR_STATUSES = new Set([STATUS.BAD_OPTION, STATUS.UNRESOLVED, STATUS.EMPTY]);

// Display labels for where a trait resolved from.
// curated  -> lives in traits.json (the point-buy vocabulary)
// imported -> only in converted-traits.json (raw backlog)
// inline   -> defined inline on the ancestry, no id
const SOURCE_LABEL = {
  curated: 'Trait',
  imported: 'Custom',
  inline: 'Inline'
};

// Classify a single raw trait reference from the ancestry data.
function auditTraitRef(raw, lookup) {
  const id = raw?.id;
  const inlineName = raw?.name;

  if (!id) {
    if (inlineName) {
      return { status: STATUS.INLINE, source: 'inline', originalName: null, newName: inlineName };
    }
    return { status: STATUS.EMPTY, source: null, originalName: null, newName: null };
  }

  const base = lookup[id];
  if (!base) {
    return { status: STATUS.UNRESOLVED, source: null, originalName: null, newName: null };
  }

  const source = base.__source || 'curated';
  // newName is the ancestry's override name if it differs, else the base name.
  const newName = (raw.name && raw.name !== base.name) ? raw.name : base.name;

  // Validate an option reference if one is present.
  if (raw.option) {
    const opt = (base.options || []).find(o => o.id === raw.option);
    if (!opt) {
      return {
        status: STATUS.BAD_OPTION,
        source,
        originalName: base.name,
        newName,
        detail: `option "${raw.option}" not found on ${id}`
      };
    }
  }

  const hasOverride =
    (raw.name && raw.name !== base.name) ||
    (raw.description && raw.description !== base.description) ||
    (raw.summary && raw.summary !== base.summary) ||
    (raw.points !== undefined && raw.points !== base.points);

  return {
    status: hasOverride ? STATUS.OVERRIDE : STATUS.OK,
    source,
    originalName: base.name,
    newName,
    detail: raw.option ? `option: ${raw.option}` : null
  };
}

// Format the trait-name cell: "New name (Original name)" when the ancestry
// renames the trait, otherwise just the name.
function formatTraitName(r) {
  const { newName, originalName } = r;
  if (!newName && !originalName) return '—';
  if (newName && originalName && newName !== originalName) {
    return `${newName} (${originalName})`;
  }
  return newName || originalName;
}

export function AuditPage({ allTraits = {} }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);

  const { convertedTraitsById, loading: traitsLoading } = useConvertedTraits();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/data/converted-ancestries.json');
        if (!res.ok) throw new Error(`Failed to load ancestries: ${res.status}`);
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Combined lookup, tagged with the source each id came from so the audit can
  // show whether a trait resolved against the imported or curated vocabulary.
  const lookup = useMemo(() => {
    const tagged = {};
    for (const [id, t] of Object.entries(convertedTraitsById)) {
      tagged[id] = { ...t, __source: 'imported' };
    }
    for (const [id, t] of Object.entries(allTraits)) {
      tagged[id] = { ...t, __source: 'curated' };
    }
    return combineTraitLookups({}, tagged);
  }, [convertedTraitsById, allTraits]);

  // Flatten every ancestry from categories + subcategories.
  const ancestries = useMemo(() => {
    const out = [];
    for (const c of categories) {
      const groups = [
        ...(c.ancestries || []).map(a => ({ a, category: c.name })),
        ...(c.subcategories || []).flatMap(sc =>
          (sc.ancestries || []).map(a => ({ a, category: `${c.name} › ${sc.name}` }))
        )
      ];
      out.push(...groups);
    }
    return out;
  }, [categories]);

  // Build the audit model: one entry per ancestry, with trait groups + statuses.
  const auditModel = useMemo(() => {
    return ancestries.map(({ a, category }) => {
      const buildGroup = (label, traits) =>
        (traits || []).map((raw, idx) => ({
          key: `${raw?.id || 'ref'}-${idx}`,
          group: label,
          raw,
          ...auditTraitRef(raw, lookup)
        }));

      const refs = [
        ...buildGroup('Shared', a.traits),
        ...(a.archetypes || []).flatMap(arch =>
          buildGroup(arch.name || 'Archetype', arch.traits)
        )
      ];

      const errorCount = refs.filter(r => ERROR_STATUSES.has(r.status)).length;

      return {
        id: a.id,
        name: a.name,
        category,
        refs,
        errorCount,
        archetypeCount: (a.archetypes || []).length
      };
    });
  }, [ancestries, lookup]);

  // Traits that exist in the vocabulary but no ancestry references them.
  const unusedTraits = useMemo(() => {
    const referenced = new Set();
    for (const anc of auditModel) {
      for (const r of anc.refs) {
        if (r.raw?.id) referenced.add(r.raw.id);
      }
    }
    const list = [];
    for (const [id, t] of Object.entries(lookup)) {
      if (!referenced.has(id)) {
        list.push({ id, name: t.name || id, source: t.__source || 'curated' });
      }
    }
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [auditModel, lookup]);

  // Top-level totals.
  const totals = useMemo(() => {
    const t = { ancestries: auditModel.length, refs: 0, errors: 0, byStatus: {} };
    for (const anc of auditModel) {
      for (const r of anc.refs) {
        t.refs += 1;
        t.byStatus[r.status] = (t.byStatus[r.status] || 0) + 1;
        if (ERROR_STATUSES.has(r.status)) t.errors += 1;
      }
    }
    return t;
  }, [auditModel]);

  const visibleModel = showOnlyErrors
    ? auditModel.filter(a => a.errorCount > 0)
    : auditModel;

  const busy = loading || traitsLoading;

  if (busy) {
    return (
      <div className="audit-page">
        <p className="audit-loading">Running audit…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audit-page">
        <p className="audit-error-message">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="audit-page">
      <header className="audit-header">
        <h1>Ancestry &amp; Trait Audit</h1>
        <p className="audit-subtitle">
          Every trait reference in the ancestry pool, resolved against the imported
          (converted-traits) and curated (traits.json) vocabularies.
        </p>

        <div className="audit-stats">
          <StatCard label="Ancestries" value={totals.ancestries} />
          <StatCard label="Trait refs" value={totals.refs} />
          <StatCard
            label="Errors"
            value={totals.errors}
            tone={totals.errors > 0 ? 'bad' : 'good'}
          />
          <StatCard
            label="Resolved"
            value={`${Math.round(((totals.refs - totals.errors) / Math.max(totals.refs, 1)) * 100)}%`}
            tone={totals.errors === 0 ? 'good' : 'warn'}
          />
          <StatCard
            label="Not used"
            value={unusedTraits.length}
            tone={unusedTraits.length > 0 ? 'warn' : 'good'}
          />
        </div>

        <div className="audit-legend">
          {Object.entries(totals.byStatus).map(([status, count]) => (
            <span key={status} className={`audit-chip status-${status}`}>
              {STATUS_LABEL[status] || status}: {count}
            </span>
          ))}
        </div>

        <label className="audit-filter">
          <input
            type="checkbox"
            checked={showOnlyErrors}
            onChange={(e) => setShowOnlyErrors(e.target.checked)}
          />
          Show only ancestries with errors
        </label>
      </header>

      <div className="audit-list">
        {/* Traits defined in the vocabulary that no ancestry references. */}
        {!showOnlyErrors && unusedTraits.length > 0 && (
          <section className="audit-ancestry audit-unused">
            <div className="audit-ancestry-head">
              <h2 className="audit-ancestry-name">No ancestry matches</h2>
              <span className="audit-ancestry-category">
                Traits defined but not referenced by any ancestry
              </span>
              <span className="audit-ancestry-meta">{unusedTraits.length} traits</span>
            </div>
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Trait</th>
                  <th>Name</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {unusedTraits.map((t) => (
                  <tr key={t.id}>
                    <td className="col-ref"><code>{t.id}</code></td>
                    <td className="col-resolved">{t.name}</td>
                    <td className="col-source">
                      <span className={`audit-source src-${t.source}`}>
                        {SOURCE_LABEL[t.source] || t.source}
                      </span>
                    </td>
                    <td className="col-status">
                      <span className="audit-chip status-unused">
                        {STATUS_LABEL[STATUS.UNUSED]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {visibleModel.length === 0 && (
          <p className="audit-empty">
            {showOnlyErrors ? 'No ancestries have errors. 🎉' : 'No ancestries found.'}
          </p>
        )}

        {visibleModel.map((anc) => (
          <section
            key={anc.id}
            className={`audit-ancestry ${anc.errorCount > 0 ? 'has-errors' : ''}`}
          >
            <div className="audit-ancestry-head">
              <h2 className="audit-ancestry-name">{anc.name}</h2>
              <span className="audit-ancestry-category">{anc.category}</span>
              <span className="audit-ancestry-meta">{anc.archetypeCount} archetypes</span>
              <span
                className={`audit-ancestry-status ${anc.errorCount > 0 ? 'bad' : 'good'}`}
              >
                {anc.errorCount > 0 ? `${anc.errorCount} error${anc.errorCount > 1 ? 's' : ''}` : 'clean'}
              </span>
            </div>

            <table className="audit-table">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Trait ref</th>
                  <th>Trait name</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {anc.refs.map((r) => (
                  <tr key={r.key} className={ERROR_STATUSES.has(r.status) ? 'row-error' : ''}>
                    <td className="col-group">{r.group}</td>
                    <td className="col-ref">
                      <code>{r.raw?.id || r.raw?.name || '∅'}</code>
                      {r.detail && <span className="col-detail"> · {r.detail}</span>}
                    </td>
                    <td className="col-resolved">{formatTraitName(r)}</td>
                    <td className="col-source">
                      {r.source ? <span className={`audit-source src-${r.source}`}>{SOURCE_LABEL[r.source] || r.source}</span> : '—'}
                    </td>
                    <td className="col-status">
                      <span className={`audit-chip status-${r.status}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = 'neutral' }) {
  return (
    <div className={`audit-stat tone-${tone}`}>
      <span className="audit-stat-value">{value}</span>
      <span className="audit-stat-label">{label}</span>
    </div>
  );
}
