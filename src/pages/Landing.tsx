import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const HeroCanvas = lazy(() => import('../components/Scene').then((m) => ({ default: m.HeroCanvas })))
// Cambiá esta URL por la de tu repositorio.
const REPO = 'https://github.com/'

const steps = [
  ['Texto', 'Cada documento se limpia: minúsculas, sin tildes ni palabras vacías como “el” o “en”.'],
  ['Vocabulario', 'Las palabras que quedan forman las dimensiones del espacio: una palabra, un eje.'],
  ['Vector', 'Cada documento es una combinación lineal de los ejes, ponderada por TF-IDF.'],
  ['Coseno', 'La consulta se compara con cada documento por el ángulo entre sus vectores.'],
]
const concepts = [
  ['Espacio vectorial', 'Los documentos viven en ℝⁿ, donde n es el tamaño del vocabulario.'],
  ['Base canónica', 'Cada palabra es un vector eᵢ; un documento es Σ aᵢeᵢ.'],
  ['Producto punto', 'q·d suma el peso de las palabras que comparten consulta y documento.'],
  ['Norma', '‖d‖ mide la longitud del vector; dividir por ella compensa textos largos.'],
]

export default function Landing() {
  return (
    <main>
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <Suspense fallback={null}>
            <HeroCanvas />
          </Suspense>
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-6">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl text-5xl font-extrabold leading-[1.05] md:text-7xl">
            Cada texto es un vector. Cada búsqueda, un ángulo.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.7 }} className="mt-6 max-w-xl text-lg text-mut">
            VectorSearch ordena documentos por similitud coseno y te muestra los números reales de cada cálculo, para que puedas comprobarlos.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 flex flex-wrap gap-3">
            <Link to="/app" className="rounded-lg bg-query px-5 py-3 font-semibold text-ink transition hover:brightness-110">Probar la demo</Link>
            <a href={REPO} className="rounded-lg border border-line px-5 py-3 font-semibold transition hover:bg-panel">Ver en GitHub</a>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-3xl font-bold">Cómo funciona</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map(([t, d], i) => (
            <motion.li key={t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="rounded-xl border border-line bg-panel p-5">
              <span className="font-mono text-sm text-query">{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-mut">{d}</p>
            </motion.li>
          ))}
        </ol>
        <p className="mt-10 rounded-xl border border-line bg-panel p-6 text-center font-mono text-lg">
          cos θ = (q · d) / (‖q‖ ‖d‖)
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-3xl font-bold">El álgebra lineal detrás</h2>
        <dl className="mt-8 grid gap-6 md:grid-cols-2">
          {concepts.map(([t, d]) => (
            <div key={t} className="border-l-2 border-doc pl-4">
              <dt className="font-semibold">{t}</dt>
              <dd className="mt-1 text-mut">{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-mut">
          La misma idea sostiene la búsqueda semántica, los sistemas de recomendación y la recuperación de contexto en aplicaciones con IA.
        </p>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-sm text-mut">
        Hecho con React, TypeScript, Three.js y Framer Motion. <Link to="/app" className="text-query underline">Abrir la app</Link>
      </footer>
    </main>
  )
}
