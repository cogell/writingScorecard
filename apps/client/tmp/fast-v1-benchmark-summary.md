# FAST v1.0 Benchmark Summary (fresh-eyes audit)

Generated 2026-02-18 from `apps/client/scripts/benchmark-fast-v1.ts`.

## Fixture corpus
- Source: `apps/client/scripts/fixtures/fast-benchmark.json`
- Runs per fixture: 3

## Mode A — cache-enabled responses (`FAST_BENCHMARK_BYPASS_CACHE=0`)
- Overall deltas: 0.0 across all fixtures
- Criterion deltas: 0.0 across all fixtures
- Latency (ms): min 1, p50 1, p95 10533, max 10533
- Cost (USD): min 0.007211, median 0.007489, max 0.007985

Interpretation: deterministic in-process repeat behavior is achieved via request-level cache keyed by title+text. First uncached sample per fixture dominates p95 latency; subsequent repeated samples return in ~1ms.

## Mode B — uncached model sampling (`FAST_BENCHMARK_BYPASS_CACHE=1`)
- Latency (ms): min 8411, p50 9521, p95 18087, max 18087
- Cost (USD): min 0.007239, median 0.007464, max 0.008100
- Variance threshold: **failed**
  - weak: simplexity/unity/pragmaticExperience each Δ1
  - short_context: simplexity Δ2
  - injection_like: errorCorrection Δ1, unity Δ1, pragmaticExperience Δ2

Interpretation: raw model variance remains elevated without cache mediation. Follow-up bead opened:
- `writingScorecard-b8n` — Reduce uncached FAST model variance without relying on response cache.
