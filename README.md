# VectorSearch

Buscador de documentos basado en vectores. Cada texto se representa como un vector (binario, TF o TF-IDF), se ordena por similitud coseno y la app muestra los números de cada cálculo para poder verificarlos.

## Características
- Núcleo matemático escrito a mano en TypeScript: producto punto, norma, coseno, TF-IDF suavizado y PCA por iteración de potencias.
- Resultados en vivo, ranking animado y palabras coincidentes resaltadas.
- Tabla documentos × términos con mapa de calor y panel de verificación del coseno.
- Visualización 3D interactiva de los documentos y la consulta.
- Landing page, exportación a JSON y pruebas unitarias.

## Fórmulas
- IDF suavizado: `idf(t) = ln((1 + n) / (1 + df(t))) + 1`
- Coseno: `cos θ = (q · d) / (‖q‖ ‖d‖)`

## Uso
```bash
npm install
npm run dev      # desarrollo
npm test         # pruebas
npm run lint     # ESLint
npm run build    # compilación de producción
```

## Despliegue
Importá el repositorio en Vercel (preset Vite). `vercel.json` ya incluye el rewrite para la SPA.

## Estructura
`src/lib/math` (vectores, PCA) · `src/lib/nlp` (tokenizador, vectorización) · `src/pages` · `src/components` · `src/store.ts`

## Licencia
MIT
