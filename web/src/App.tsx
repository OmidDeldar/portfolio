import { useCallback, useEffect, useState } from 'react';
import { About } from './components/About';
import { Background } from './components/Background';
import { BootScreen } from './components/BootScreen';
import { Contact } from './components/Contact';
import { Education } from './components/Education';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { MatrixRain } from './components/MatrixRain';
import { Nav } from './components/Nav';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Stats } from './components/Stats';
import { Terminal } from './components/Terminal';
import { probe, registerVisit } from './lib/api';
import type { TermAction } from './lib/terminal.engine';

const THEME_KEY = 'omid.theme';
const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export default function App() {
  const [booted, setBooted] = useState(false);
  const [matrix, setMatrix] = useState(false);

  // Restore the last theme the visitor picked with `theme <name>`.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch {
      /* storage unavailable — the default violet theme applies */
    }
  }, []);

  // Wake the API and count the visit once the boot screen is out of the way.
  useEffect(() => {
    if (!booted) return;
    void probe().then((online) => {
      if (online) void registerVisit();
    });
  }, [booted]);

  // Konami code -> matrix rain. Because of course.
  useEffect(() => {
    let position = 0;
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack the arrow keys while someone is using the terminal.
      if (document.activeElement instanceof HTMLInputElement) return;
      const expected = KONAMI[position];
      if (e.key.toLowerCase() === expected.toLowerCase()) {
        position++;
        if (position === KONAMI.length) {
          position = 0;
          setMatrix(true);
        }
      } else {
        position = e.key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /** Terminal commands can drive the page — this is where that happens. */
  const handleAction = useCallback((action: TermAction) => {
    switch (action.type) {
      case 'open':
        window.open(action.url, action.url.startsWith('mailto:') ? '_self' : '_blank', 'noopener');
        break;

      case 'theme':
        document.documentElement.setAttribute('data-theme', action.value);
        try {
          localStorage.setItem(THEME_KEY, action.value);
        } catch {
          /* not fatal — the theme just won't persist */
        }
        break;

      case 'matrix':
        setMatrix(true);
        break;

      case 'scroll':
        document.getElementById(action.target)?.scrollIntoView({ behavior: 'smooth' });
        break;

      case 'exit':
        document.documentElement.classList.add('is-exiting');
        setTimeout(() => document.documentElement.classList.remove('is-exiting'), 1400);
        break;

      case 'clear':
        // Handled inside the terminal itself.
        break;
    }
  }, []);

  return (
    <>
      <BootScreen onDone={() => setBooted(true)} />
      <Background />

      <Nav />

      <main>
        <Hero />
        <Stats />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Terminal onAction={handleAction} />
        <Contact />
      </main>

      <Footer />

      {matrix && <MatrixRain onEnd={() => setMatrix(false)} />}
    </>
  );
}
