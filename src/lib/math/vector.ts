export type Vec = number[]

/** Producto punto: Σ aᵢ·bᵢ */
export function dot(a: Vec, b: Vec): number {
  if (a.length !== b.length) throw new Error('Dimensiones distintas')
  let s = 0
  for (let i = 0; i < a.length; i++) s += (a[i] ?? 0) * (b[i] ?? 0)
  return s
}

/** Norma euclídea: ‖a‖ = √(a·a) */
export const norm = (a: Vec): number => Math.sqrt(dot(a, a))

/** Normaliza a longitud 1 (L2). El vector cero se devuelve igual. */
export function normalize(a: Vec): Vec {
  const n = norm(a)
  return n === 0 ? [...a] : a.map((x) => x / n)
}

/** Similitud coseno: (a·b)/(‖a‖‖b‖). Devuelve 0 si algún vector es cero. */
export function cosine(a: Vec, b: Vec): number {
  const d = norm(a) * norm(b)
  return d === 0 ? 0 : dot(a, b) / d
}
