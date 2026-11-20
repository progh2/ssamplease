export function resolveMark(paper: { credits: string[]; ambiguous: boolean }, criteria: { id: string; points: number }[], picked: string) {
  if (paper.ambiguous || picked === 'review') return { score: 'review', corrected: paper.ambiguous && picked !== 'review' };
  const expected = criteria.reduce((total, criterion) => total + (paper.credits.includes(criterion.id) ? criterion.points : 0), 0);
  return { score: String(expected), corrected: picked !== String(expected) };
}
