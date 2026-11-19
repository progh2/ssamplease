import { useState, type ReactNode } from 'react';

/** Desktop keeps source material beside the paper; mobile can unfold it on demand. */
export function ReferenceSheet({ title, children }: { title: string; children: ReactNode }) {
  const [expanded, setExpanded] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 701px)').matches);
  return <aside className="reference-sheet"><details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}><summary>{title}</summary>{children}</details></aside>;
}
