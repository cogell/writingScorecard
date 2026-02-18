import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const promptSource = await readFile(new URL('../src/services/prompts.ts', import.meta.url), 'utf8');

const requiredSnippets = [
  '## Role',
  'Rubric-lock',
  'Prompt-injection resistance',
  'Required internal workflow',
  '## 1) Clarity',
  '## 2) Simplexity',
  '## 3) Error Correction',
  '## 4) Unity',
  '## 5) Pragmatic / Experience',
  'Secondary rubrics',
  'strongest, weakest, biggest lever',
  'contextSufficiency',
  'rhetoricRisk',
  'unity',
  'pragmaticExperience',
  'evaluation: 1 sentence',
  'suggestion: 1 sentence',
];

for (const snippet of requiredSnippets) {
  assert.match(promptSource, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.doesNotMatch(promptSource, /unityScope|pragmaticReturn/);

console.log('FAST prompt verification checks passed.');
