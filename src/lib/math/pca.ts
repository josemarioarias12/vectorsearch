import { dot, norm, type Vec } from './vector'

export interface PcaModel {
  mean: Vec
  components: Vec[]
  /** Coordenadas de las filas originales en los componentes (n × k) */
  scores: number[][]
}

/** Proyecta un vector nuevo al espacio del modelo: (x − media)·componente */
export function project(model: PcaModel, x: Vec): number[] {
  const c = x.map((v, i) => v - (model.mean[i] ?? 0))
  return model.components.map((w) => dot(c, w))
}

/**
 * PCA por iteración de potencias sobre XᵀX (sin formar la matriz de covarianza).
 * Cada componente se ortogonaliza contra los anteriores (Gram–Schmidt).
 */
export function pca(rows: Vec[], k: number, iterations = 200): PcaModel {
  const n = rows.length
  const d = rows[0]?.length ?? 0
  const mean = Array.from({ length: d }, (_, j) =>
    n === 0 ? 0 : rows.reduce((s, r) => s + (r[j] ?? 0), 0) / n,
  )
  const X = rows.map((r) => r.map((v, j) => v - (mean[j] ?? 0)))
  const components: Vec[] = []

  for (let c = 0; c < k; c++) {
    let v: Vec = Array.from({ length: d }, (_, j) => 1 + ((j * 7 + c * 3) % 5) / 10)
    let alive = d > 0
    for (let it = 0; it < iterations && alive; it++) {
      const xv = X.map((r) => dot(r, v))
      let w = Array.from({ length: d }, (_, j) =>
        X.reduce((s, r, i) => s + (r[j] ?? 0) * (xv[i] ?? 0), 0),
      )
      for (const u of components) {
        const p = dot(w, u)
        w = w.map((x, j) => x - p * (u[j] ?? 0))
      }
      const nw = norm(w)
      if (nw < 1e-12) {
        alive = false
        break
      }
      v = w.map((x) => x / nw)
    }
    components.push(alive ? v : new Array<number>(d).fill(0))
  }
  return { mean, components, scores: X.map((r) => components.map((w) => dot(r, w))) }
}
