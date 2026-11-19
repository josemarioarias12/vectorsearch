const STOPWORDS = new Set(
  (
    'el la los las un una unos unas de del al en y o u a e que se su sus por para con sin ' +
    'es son fue ser lo le les me mi tu como mas pero ya no si the a an and or of to in on is are ' +
    'was for with that this it its at by from'
  ).split(' '),
)

/** Minúsculas, sin tildes ni puntuación, sin stopwords (ES/EN). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t))
}
