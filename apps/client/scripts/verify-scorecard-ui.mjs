import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/components/Scorecard.tsx', import.meta.url), 'utf8');

// writingScorecard-220 checks
assert.match(source, /score\.score\.toFixed\(1\)/, 'single direct score must be rendered');
assert.match(source, /score\.evaluation/, 'evaluation sentence must render');
assert.match(source, /score\.suggestion/, 'suggestion sentence must render');
assert.doesNotMatch(source, /\(raw\)|calibratedScore|provisionalScore/, 'legacy raw/calibrated UI must be removed');

// writingScorecard-8ar checks
assert.match(source, /Core thesis/, 'core thesis section header must exist');
assert.match(source, /scorecard\.coreThesis/, 'core thesis content must render');
assert.match(source, /aria-label="Key terms"/, 'key terms list should be explicitly labeled');
assert.match(source, /scorecard\.keyTerms\.map/, 'key terms should render from API data');
assert.match(source, /Context: \{scorecard\.contextSufficiency\}/, 'context diagnostic should render');
assert.match(source, /Rhetoric risk:/, 'rhetoric risk diagnostic should render');
assert.match(
  source,
  /Scores are rubric-locked\. Submit revised text to re-score\./,
  'static rubric-lock notice must render',
);

const thesisIndex = source.indexOf('Core thesis');
const summaryIndex = source.indexOf('Summary');
assert.ok(thesisIndex > -1 && summaryIndex > -1 && thesisIndex < summaryIndex, 'core thesis block should appear before summary');

// writingScorecard-ypg checks
assert.match(source, /flex-wrap/, 'key term container should wrap');
assert.match(source, /break-words/, 'long thesis/evaluation/suggestion text should wrap');
assert.match(source, /sm:flex-row/, 'header should switch layouts responsively');

console.log('Scorecard UI verification checks passed.');
