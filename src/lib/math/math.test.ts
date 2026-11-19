import { describe, expect, it } from 'vitest'
import { cosine, dot, norm, normalize } from './vector'
import { pca, project } from './pca'
import { tokenize } from '../nlp/tokenize'
import { buildSearch, computeIdf, buildVocabulary, rank } from '../nlp/vectorize'

describe('vector', () => {
  it('dot y norm', () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32)
    expect(norm([3, 4])).toBe(5)
  })
  it('normalize da norma 1 y respeta el vector cero', () => {
    expect(norm(normalize([3, 4]))).toBeCloseTo(1)
    expect(normalize([0, 0])).toEqual([0, 0])
  })
  it('cosine: paralelos, ortogonales y vector cero', () => {
    expect(cosine([1, 2], [2, 4])).toBeCloseTo(1)
    expect(cosine([1, 0], [0, 1])).toBe(0)
    expect(cosine([0, 0], [1, 1])).toBe(0)
  })
})

describe('tokenize', () => {
  it('quita tildes, puntuación y stopwords', () => {
    expect(tokenize('El gato duerme en el sofá.')).toEqual(['gato', 'duerme', 'sofa'])
  })
})

const docs = ['el gato come pescado', 'el perro come carne', 'el gato duerme en el sofá']

describe('búsqueda', () => {
  it('ejemplo del enunciado en modo binario: 0.816, 0.408, 0.408', () => {
    const m = buildSearch(docs, 'gato come', { mode: 'binary', l2: false })
    expect(m.vocabulary).toEqual(['carne', 'come', 'duerme', 'gato', 'perro', 'pescado', 'sofa'])
    expect(m.scores[0]).toBeCloseTo(0.816, 3)
    expect(m.scores[1]).toBeCloseTo(0.408, 3)
    expect(m.scores[2]).toBeCloseTo(0.408, 3)
    expect(rank(m.scores)).toEqual([0, 1, 2])
  })
  it('tf cuenta repeticiones', () => {
    const m = buildSearch(['gato gato perro'], 'gato', { mode: 'tf', l2: false })
    expect(m.docVectors[0]).toEqual([2, 1])
  })
  it('idf suavizado: término raro pesa más que uno común', () => {
    const v = buildVocabulary(docs)
    const idf = computeIdf(docs, v)
    expect(idf[v.indexOf('pescado')]).toBeGreaterThan(idf[v.indexOf('come')] ?? 0)
    expect(idf.every((x) => x > 0)).toBe(true)
  })
  it('casos borde: consulta vacía y sin documentos', () => {
    expect(buildSearch(docs, '', { mode: 'tfidf', l2: true }).scores).toEqual([0, 0, 0])
    expect(buildSearch([], 'hola', { mode: 'tfidf', l2: true }).scores).toEqual([])
  })
})

describe('pca', () => {
  it('encuentra la dirección dominante de puntos sobre y = 2x', () => {
    const rows = [[0, 0], [1, 2], [2, 4], [3, 6]]
    const m = pca(rows, 2)
    const [c1] = m.components
    expect(Math.abs(c1![0]!)).toBeCloseTo(1 / Math.sqrt(5), 3)
    expect(Math.abs(c1![1]!)).toBeCloseTo(2 / Math.sqrt(5), 3)
    expect(m.scores.every((s) => Math.abs(s[1]!) < 1e-6)).toBe(true)
  })
  it('project coincide con los scores de las filas originales', () => {
    const rows = [[1, 0, 2], [0, 1, 3], [2, 2, 0]]
    const m = pca(rows, 2)
    const p = project(m, rows[1]!)
    expect(p[0]).toBeCloseTo(m.scores[1]![0]!, 6)
    expect(p[1]).toBeCloseTo(m.scores[1]![1]!, 6)
  })
})
