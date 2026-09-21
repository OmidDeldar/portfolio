import { useCallback, useEffect, useRef, useState } from 'react';
import './boot.css';

const SEQUENCE: { text: string; kind: 'info' | 'ok' | 'accent'; delay: number }[] = [
  { text: 'OmidOS 2.0 — purple-void kernel', kind: 'accent', delay: 90 },
  { text: 'Mounting /dev/portfolio ............ ok', kind: 'ok', delay: 130 },
  { text: 'Starting node runtime v22 .......... ok', kind: 'ok', delay: 110 },
  { text: 'Bootstrapping NestJS modules ....... ok', kind: 'ok', delay: 120 },
  { text: 'Loading experience records ......... 3 found', kind: 'info', delay: 100 },
  { text: 'Loading project manifests .......... 5 found', kind: 'info', delay: 100 },
  { text: 'Wazuh agent .......... connected', kind: 'ok', delay: 120 },
  { text: 'Initialising shell (omsh) .......... ready', kind: 'ok', delay: 110 },
  { text: 'Welcome.', kind: 'accent', delay: 260 },
];

const SESSION_KEY = 'omid.booted';

/**
 * A short fake boot log on first visit. Skippable with any key or click, and
 * remembered for the session so it never gets in the way on a second visit.
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem(SESSION_KEY) !== '1';
  });
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode — the boot screen simply plays again next time */
    }
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      onDone();
    }, 520);
  }, [onDone]);

  // Run the log line by line.
  useEffect(() => {
    if (!visible) {
      onDone();
      return;
    }
    if (step >= SEQUENCE.length) {
      const done = setTimeout(finish, 420);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setStep((s) => s + 1), SEQUENCE[step].delay);
    return () => clearTimeout(timer);
  }, [step, visible, finish, onDone]);

  // Any interaction skips straight to the site.
  useEffect(() => {
    if (!visible) return;
    document.body.classList.add('is-locked');
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      document.body.classList.remove('is-locked');
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [visible, finish]);

  if (!visible) return null;

  return (
    <div className={`boot ${closing ? 'is-closing' : ''}`} role="status" aria-label="Loading">
      <div className="boot-inner">
        <pre className="boot-log">
          {SEQUENCE.slice(0, step).map((line, i) => (
            <div key={i} className={`boot-line boot-${line.kind}`}>
              {line.kind === 'ok' ? '[  OK  ] ' : line.kind === 'info' ? '[ INFO ] ' : '>>> '}
              {line.text}
            </div>
          ))}
          <div className="boot-line boot-cursor">
            <span className="boot-caret" />
          </div>
        </pre>
        <div className="boot-bar">
          <div
            className="boot-bar-fill"
            style={{ width: `${Math.min((step / SEQUENCE.length) * 100, 100)}%` }}
          />
        </div>
        <p className="boot-skip">press any key to skip</p>
      </div>
    </div>
  );
}
