import { lazy, Suspense, useDeferredValue, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { SAMPLE } from '../data'
import { buildSearch, rank, type Mode } from '../lib/nlp/vectorize'
import { tokenize } from '../lib/nlp/tokenize'
import { dot, norm } from '../lib/math/vector'
import { pca, project } from '../lib/math/pca'

const VectorSpace = lazy(() => import('../components/Scene').then((m) => ({ default: m.VectorSpace })))
const MODES: [Mode, string][] = [['binary', 'Binario'], ['tf', 'TF'], ['tfidf', 'TF-IDF']]
const f = (x: number, d = 3) => x.toFixed(d)

export default function AppPage() {
  const { docs, query, mode, l2, sel, patch } = useStore()
  const q = useDeferredValue(query)
  const m = useMemo(() => buildSearch(docs, q, { mode, l2 }), [docs, q, mode, l2])
  const order = rank(m.scores)
  const s = Math.min(sel, docs.length - 1)
  const qTokens = useMemo(() => new Set(tokenize(q)), [q])

  const space = useMemo(() => {
    if (docs.length < 2 || m.vocabulary.length === 0) return null
    const model = pca(m.docVectors, 3)
    const pts = [...model.scores, project(model, m.queryVector)]
    const max = Math.max(1e-9, ...pts.flat().map(Math.abs))
    return pts.map((p) => p.map((x) => (x / max) * 3) as [number, number, number])
  }, [m, docs.length])

  const setDoc = (i: number, v: string) => patch({ docs: docs.map((d, j) => (j === i ? v : d)) })
  const highlight = (text: string): ReactNode =>
    text.split(/(\s+)/).map((w, i) =>
      qTokens.has(tokenize(w)[0] ?? '') ? <mark key={i} className="rounded bg-query/25 px-0.5 text-query">{w}</mark> : w,
    )

  const qv = m.queryVector
  const dv = m.docVectors[s] ?? []
  const parts = m.vocabulary.map((t, j) => ({ t, p: (qv[j] ?? 0) * (dv[j] ?? 0) })).filter((x) => x.p !== 0)
  const nq = norm(qv)
  const nd = norm(dv)
  const maxCell = Math.max(1e-9, ...m.docVectors.flat(), ...qv)

  const exportJson = () => {
    const data = { mode, l2, query, vocabulary: m.vocabulary, ranking: order.map((i) => ({ doc: i + 1, text: docs[i], cosine: m.scores[i] })) }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = 'resultados.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const card = 'rounded-xl border border-line bg-panel p-5'
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold">VectorSearch</Link>
        <button onClick={exportJson} className="rounded-lg border border-line px-3 py-2 text-sm hover:bg-panel">Exportar JSON</button>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <section className={card}>
            <label htmlFor="q" className="text-sm font-semibold text-query">Consulta</label>
            <input id="q" value={query} onChange={(e) => patch({ query: e.target.value })} placeholder="Escribí algo para buscar…" className="mt-2 w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-query" />
            <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Representación">
              {MODES.map(([k, label]) => (
                <button key={k} aria-pressed={mode === k} onClick={() => patch({ mode: k })} className={`rounded-lg border px-3 py-1.5 text-sm ${mode === k ? 'border-doc bg-doc/15 text-doc' : 'border-line text-mut hover:bg-ink'}`}>{label}</button>
              ))}
              <label className="ml-auto flex items-center gap-2 text-sm text-mut">
                <input type="checkbox" checked={l2} onChange={(e) => patch({ l2: e.target.checked })} /> Normalizar L2
              </label>
            </div>
          </section>

          <section className={card}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Documentos ({docs.length})</h2>
              <div className="flex gap-2 text-sm">
                <button onClick={() => patch({ docs: SAMPLE, sel: 0 })} className="rounded border border-line px-2 py-1 hover:bg-ink">Cargar ejemplo</button>
                <button onClick={() => patch({ docs: [...docs, ''] })} className="rounded border border-line px-2 py-1 hover:bg-ink">Agregar</button>
              </div>
            </div>
            {docs.length === 0 && <p className="text-mut">No hay documentos. Agregá uno o cargá el ejemplo.</p>}
            <ul className="space-y-2">
              {docs.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-8 pt-2 font-mono text-xs text-mut">D{i + 1}</span>
                  <textarea aria-label={`Documento ${i + 1}`} value={d} rows={2} onChange={(e) => setDoc(i, e.target.value)} className="flex-1 resize-y rounded-lg border border-line bg-ink px-2 py-1.5 text-sm outline-none focus:border-doc" />
                  <button aria-label={`Eliminar documento ${i + 1}`} onClick={() => patch({ docs: docs.filter((_, j) => j !== i) })} className="px-2 text-mut hover:text-query">✕</button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-5">
          <section className={card}>
            <h2 className="mb-3 font-semibold">Ranking por similitud coseno</h2>
            {qTokens.size === 0 && <p className="mb-3 text-sm text-mut">La consulta no tiene palabras útiles: todas las similitudes son 0.</p>}
            <ul className="space-y-2">
              {order.map((i) => (
                <motion.li layout key={i} transition={{ type: 'spring', stiffness: 400, damping: 36 }}>
                  <button onClick={() => patch({ sel: i })} aria-pressed={i === s} className={`w-full rounded-lg border p-3 text-left ${i === s ? 'border-doc bg-doc/10' : 'border-line hover:bg-ink'}`}>
                    <div className="flex justify-between text-sm"><span className="font-mono">D{i + 1}</span><span className="font-mono text-doc">{f(m.scores[i] ?? 0)}</span></div>
                    <div className="my-2 h-1.5 rounded bg-line"><motion.div className="h-full rounded bg-doc" animate={{ width: `${Math.max(0, m.scores[i] ?? 0) * 100}%` }} /></div>
                    <p className="line-clamp-2 text-sm text-mut">{highlight(docs[i] ?? '')}</p>
                  </button>
                </motion.li>
              ))}
            </ul>
          </section>

          <section className={card} aria-live="polite">
            <h2 className="mb-3 font-semibold">Verificación matemática: D{s + 1}</h2>
            {docs.length === 0 ? <p className="text-mut">Sin documentos.</p> : (
              <div className="space-y-1 font-mono text-sm">
                <p>q · d = {parts.length ? parts.map((x) => `${x.t}: ${f(x.p)}`).join(' + ') + ' = ' : ''}{f(dot(qv, dv))}</p>
                <p>‖q‖ = {f(nq)} &nbsp; ‖d‖ = {f(nd)}</p>
                <p className="text-doc">cos θ = {f(dot(qv, dv))} / ({f(nq)} × {f(nd)}) = {nq * nd === 0 ? '0 (vector cero)' : f(dot(qv, dv) / (nq * nd))}</p>
              </div>
            )}
          </section>

          <section className={`${card} h-80 !p-0 overflow-hidden`}>
            {space ? (
              <Suspense fallback={<p className="p-5 text-mut">Cargando escena 3D…</p>}>
                <VectorSpace pts={space} scores={m.scores} />
              </Suspense>
            ) : <p className="p-5 text-mut">Se necesitan al menos 2 documentos con texto para proyectar el espacio.</p>}
          </section>
        </div>
      </div>

      <section className={`${card} mt-5`}>
        <h2 className="mb-1 font-semibold">Representación numérica</h2>
        <p className="mb-3 text-sm text-mut">Cada fila es un vector en ℝ^{m.vocabulary.length}. Pasá el cursor por una celda para ver su valor exacto.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0.5 font-mono text-xs">
            <thead><tr><th className="px-2 text-left text-mut" />{m.vocabulary.map((t) => <th key={t} className="px-1 pb-1 text-mut [writing-mode:vertical-rl]">{t}</th>)}</tr></thead>
            <tbody>
              {[{ label: 'Q', v: qv, c: '242,184,75' }, ...m.docVectors.map((v, i) => ({ label: `D${i + 1}`, v, c: '90,209,197' }))].map((r) => (
                <tr key={r.label}>
                  <th className="px-2 text-left">{r.label}</th>
                  {r.v.map((x, j) => <td key={j} title={`${r.label} · ${m.vocabulary[j]} = ${x}`} className="h-7 min-w-9 rounded text-center" style={{ background: `rgba(${r.c},${Math.min(1, x / maxCell) * 0.85})` }}>{x ? f(x, 2) : ''}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
