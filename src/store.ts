import { create } from 'zustand'
import { SAMPLE } from './data'
import type { Mode } from './lib/nlp/vectorize'

interface State {
  docs: string[]
  query: string
  mode: Mode
  l2: boolean
  sel: number
  patch: (p: Partial<Omit<State, 'patch'>>) => void
}

export const useStore = create<State>((set) => ({
  docs: SAMPLE,
  query: 'contrato de arrendamiento',
  mode: 'tfidf',
  l2: true,
  sel: 0,
  patch: (p) => set(p),
}))
