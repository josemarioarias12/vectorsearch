import { cosine, normalize, type Vec } from '../math/vector'
import { tokenize } from './tokenize'

export type Mode = 'binary' | 'tf' | 'tfidf'

export interface Options {
  mode: Mode
  l2: boolean
}

export interface SearchModel {
  vocabulary: string[]
  idf: number[]
  docVectors: Vec[]
  queryVector: Vec
  scores: number[]
}

/** Vocabulario ordenado alfabéticamente, construido solo con los documentos. */
export function buildVocabulary(docs: string[]): string[] {
  return [...new Set(docs.flatMap(tokenize))].sort()
}

/** IDF suavizado: ln((1+n)/(1+df)) + 1 (siempre > 0). */
export function computeIdf(docs: string[], vocabulary: string[]): number[] {
  const n = docs.length
  const sets = docs.map((d) => new Set(tokenize(d)))
  return vocabulary.map((t) => {
    const df = sets.filter((s) => s.has(t)).length
    return Math.log((1 + n) / (1 + df)) + 1
  })
}

export function vectorize(text: string, vocabulary: string[], idf: number[], opts: Options): Vec {
  const counts = new Map<string, number>()
  for (const t of tokenize(text)) counts.set(t, (counts.get(t) ?? 0) + 1)
  const v = vocabulary.map((t, i) => {
    const c = counts.get(t) ?? 0
    if (opts.mode === 'binary') return c > 0 ? 1 : 0
    if (opts.mode === 'tf') return c
    return c * (idf[i] ?? 0)
  })
  return opts.l2 ? normalize(v) : v
}

export function buildSearch(docs: string[], query: string, opts: Options): SearchModel {
  const vocabulary = buildVocabulary(docs)
  const idf = computeIdf(docs, vocabulary)
  const docVectors = docs.map((d) => vectorize(d, vocabulary, idf, opts))
  const queryVector = vectorize(query, vocabulary, idf, opts)
  const scores = docVectors.map((v) => cosine(queryVector, v))
  return { vocabulary, idf, docVectors, queryVector, scores }
}

/** Índices de documentos ordenados por similitud descendente (desempate por posición). */
export function rank(scores: number[]): number[] {
  return scores.map((_, i) => i).sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0) || a - b)
}
