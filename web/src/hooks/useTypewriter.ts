import { useEffect, useState } from 'react';

/**
 * Cycles through `words`, typing and deleting each one.
 * Pauses longer at the end of a completed word so it stays readable.
 */
export function useTypewriter(
  words: string[],
  { typeMs = 70, deleteMs = 34, holdMs = 1900 } = {},
) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setText(words[0]);
      return;
    }

    const word = words[index % words.length];

    if (!deleting && text === word) {
      const hold = setTimeout(() => setDeleting(true), holdMs);
      return () => clearTimeout(hold);
    }

    if (deleting && text === '') {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }

    const next = deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1);
    const timer = setTimeout(() => setText(next), deleting ? deleteMs : typeMs);
    return () => clearTimeout(timer);
  }, [text, deleting, index, words, typeMs, deleteMs, holdMs]);

  return text;
}
