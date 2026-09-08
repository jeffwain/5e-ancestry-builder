/**
 * Read/write access to the ancestry source files for the in-app editor.
 *
 * The source files are hand-maintained JavaScript carrying comments, `note`
 * provenance strings and inline trait definitions. Re-serialising them from
 * parsed data would throw all of that away, so every edit here is a *ranged
 * splice*: acorn gives byte offsets for the exact `shared:` / `traits:` array
 * being changed, and only those bytes are replaced. Elements that the editor
 * did not touch are written back as their original source text, verbatim.
 *
 * Used by the dev-server middleware in vite.config.js. Never runs in a build.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../public/data');

export const SOURCE_FILES = {
  common: 'ancestries-common.mjs',
  uncommon: 'ancestries-uncommon.mjs',
  versatile: 'ancestries-versatile.mjs',
};

function filePath(key) {
  const name = SOURCE_FILES[key];
  if (!name) throw new Error(`Unknown source file "${key}"`);
  return path.join(DATA_DIR, name);
}

function parse(code) {
  return acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', ranges: true });
}

/** Find the `export default [...]` array node. */
function defaultExportArray(ast) {
  for (const node of ast.body) {
    if (node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'ArrayExpression') {
      return node.declaration;
    }
  }
  throw new Error('Source file has no `export default [...]`');
}

const propOf = (obj, key) =>
  obj?.properties?.find(p => !p.computed && (p.key.name === key || p.key.value === key))?.value;

const stringProp = (obj, key) => {
  const v = propOf(obj, key);
  return v && v.type === 'Literal' ? v.value : undefined;
};

/**
 * Summarise one element of a traits array so the editor can show it without
 * re-implementing the source format. `text` is the authoritative value — it is
 * what gets written back if the element survives the edit.
 */
function describeElement(node, code) {
  const text = code.slice(node.start, node.end);
  const base = { text };

  // '...SHARED_CONST' — a spread of a module-level constant
  if (node.type === 'SpreadElement') {
    return { ...base, kind: 'spread', label: code.slice(node.argument.start, node.argument.end) };
  }

  // 'trait-id' or 'trait-id:option'
  if (node.type === 'Literal' && typeof node.value === 'string') {
    const [id, option] = node.value.split(':');
    return { ...base, kind: 'ref', id, option: option || undefined, label: id };
  }

  // ['trait-id', { ...overrides }]  |  [null, { name, points, description }]
  if (node.type === 'ArrayExpression') {
    const [first, second] = node.elements;
    const overrides = second && second.type === 'ObjectExpression' ? second : null;
    const name = overrides ? stringProp(overrides, 'name') : undefined;
    const description = overrides ? stringProp(overrides, 'description') : undefined;
    const points = overrides ? propOf(overrides, 'points') : undefined;
    const pointsValue = points && points.type === 'Literal' ? points.value : undefined;
    const hasNote = overrides ? Boolean(propOf(overrides, 'note')) : false;

    if (first && first.type === 'Literal' && typeof first.value === 'string') {
      const [id, option] = first.value.split(':');
      return {
        ...base, kind: 'override', id, option: option || undefined,
        label: name || id, nameOverride: name, descriptionOverride: description,
        points: pointsValue, hasNote,
      };
    }
    return {
      ...base, kind: 'inline', label: name || '(inline trait)',
      nameOverride: name, description, points: pointsValue, hasNote,
    };
  }

  return { ...base, kind: 'other', label: text.slice(0, 40) };
}

/** Describe a `shared:`/`traits:` array: its byte range plus each element. */
function describeSlot(arrayNode, code) {
  if (!arrayNode || arrayNode.type !== 'ArrayExpression') return null;
  return {
    start: arrayNode.start,
    end: arrayNode.end,
    elements: arrayNode.elements.filter(Boolean).map(el => describeElement(el, code)),
  };
}

function describeArchetype(node, code) {
  return {
    id: stringProp(node, 'id'),
    name: stringProp(node, 'name'),
    designed: Boolean(propOf(node, 'designed')),
    traits: describeSlot(propOf(node, 'traits'), code),
  };
}

function describeLineage(node, code) {
  const archetypesNode = propOf(node, 'archetypes');
  const sublineagesNode = propOf(node, 'sublineages');

  return {
    id: stringProp(node, 'id'),
    name: stringProp(node, 'name'),
    summary: stringProp(node, 'summary'),
    shared: describeSlot(propOf(node, 'shared'), code),
    archetypes: (archetypesNode?.elements || []).filter(Boolean).map(n => describeArchetype(n, code)),
    sublineages: (sublineagesNode?.elements || []).filter(Boolean).map(n => ({
      id: stringProp(n, 'id'),
      name: stringProp(n, 'name'),
      shared: describeSlot(propOf(n, 'shared'), code),
      archetypes: (propOf(n, 'archetypes')?.elements || []).filter(Boolean)
        .map(a => describeArchetype(a, code)),
    })),
  };
}

/** Read every source file and return the editable tree. */
export function readSources() {
  return Object.keys(SOURCE_FILES).map((key) => {
    const code = fs.readFileSync(filePath(key), 'utf8');
    const ast = parse(code);
    return {
      file: key,
      fileName: SOURCE_FILES[key],
      lineages: defaultExportArray(ast).elements.filter(Boolean).map(n => describeLineage(n, code)),
    };
  });
}

/** Walk to the slot named by the target, re-parsing the file fresh. */
function locateSlot(code, target) {
  const ast = parse(code);
  const lineages = defaultExportArray(ast).elements.filter(Boolean);

  const lineage = lineages.find(n => stringProp(n, 'id') === target.ancestryId);
  if (!lineage) throw new Error(`No ancestry "${target.ancestryId}"`);

  let owner = lineage;
  if (target.sublineageId) {
    const subs = (propOf(lineage, 'sublineages')?.elements || []).filter(Boolean);
    owner = subs.find(n => stringProp(n, 'id') === target.sublineageId);
    if (!owner) throw new Error(`No sub-lineage "${target.sublineageId}"`);
  }

  if (target.archetypeId) {
    const arcs = (propOf(owner, 'archetypes')?.elements || []).filter(Boolean);
    const arc = arcs.find(n => stringProp(n, 'id') === target.archetypeId);
    if (!arc) throw new Error(`No archetype "${target.archetypeId}"`);
    const slot = propOf(arc, 'traits');
    if (!slot) throw new Error(`Archetype "${target.archetypeId}" has no traits array`);
    return slot;
  }

  const slot = propOf(owner, 'shared');
  if (!slot) throw new Error(`"${target.ancestryId}" has no shared array`);
  return slot;
}

/** Column of the array's opening bracket, so re-emitted entries line up. */
function indentOf(code, offset) {
  const lineStart = code.lastIndexOf('\n', offset - 1) + 1;
  const line = code.slice(lineStart, offset);
  const match = line.match(/^\s*/);
  return match ? match[0] : '';
}

function renderArray(elements, baseIndent) {
  if (elements.length === 0) return '[]';

  const inner = baseIndent + '  ';
  const oneLine = `[${elements.join(', ')}]`;
  const tooLong = oneLine.length > 110;
  const multiline = elements.some(e => e.includes('\n'));

  if (!tooLong && !multiline) return oneLine;
  return `[\n${elements.map(e => inner + e).join(',\n')},\n${baseIndent}]`;
}

/**
 * Replace one traits array with the supplied element source strings.
 * The rewritten file is re-parsed before it is written; a parse failure aborts
 * the write so a bad edit can never leave a broken source file on disk.
 */
export function writeSlot({ file, target, elements }) {
  if (!Array.isArray(elements)) throw new Error('elements must be an array');
  const fp = filePath(file);
  const code = fs.readFileSync(fp, 'utf8');

  const slot = locateSlot(code, target);
  const baseIndent = indentOf(code, slot.start);
  const rendered = renderArray(elements.map(e => String(e).trim()).filter(Boolean), baseIndent);

  const next = code.slice(0, slot.start) + rendered + code.slice(slot.end);

  try {
    parse(next);
  } catch (err) {
    throw new Error(`Edit would produce invalid JavaScript: ${err.message}`);
  }

  fs.writeFileSync(fp, next);
  return { file, bytes: next.length };
}
