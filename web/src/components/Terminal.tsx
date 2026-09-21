import { useCallback, useEffect, useRef, useState } from 'react';
import { execCommand, getApiStatus, onApiStatus, type ApiStatus } from '../lib/api';
import { complete, welcomeBanner, type TermAction, type TermLine } from '../lib/terminal.engine';
import { useReveal } from '../hooks/useReveal';
import './terminal.css';

interface Block {
  id: number;
  /** The prompt line the visitor typed, if any. */
  input?: string;
  lines: TermLine[];
  offline?: boolean;
  tookMs?: number;
}

const SUGGESTIONS = ['whoami', 'projects', 'skills', 'scan', 'neofetch', 'sudo hire-me'];

let blockId = 0;

export function Terminal({
  onAction,
}: {
  onAction: (action: TermAction) => void;
}) {
  const revealRef = useReveal();
  const [blocks, setBlocks] = useState<Block[]>([
    { id: blockId++, lines: welcomeBanner() },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<ApiStatus>(getApiStatus());
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => onApiStatus(setStatus), []);

  // Keep the newest output in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [blocks, busy]);

  const push = useCallback((block: Omit<Block, 'id'>) => {
    setBlocks((prev) => [...prev, { ...block, id: blockId++ }]);
  }, []);

  const run = useCallback(
    async (raw: string) => {
      const command = raw.trim();

      if (!command) {
        push({ input: '', lines: [] });
        return;
      }

      setHistory((h) => (h[h.length - 1] === command ? h : [...h, command]));
      setHistoryIndex(-1);
      setInput('');
      setBusy(true);

      const result = await execCommand(command);

      if (result.action?.type === 'clear') {
        setBlocks([]);
        setBusy(false);
        return;
      }

      push({
        input: command,
        lines: result.lines,
        offline: result.offline,
        tookMs: result.tookMs,
      });
      setBusy(false);

      if (result.action) onAction(result.action);
    },
    [push, onAction],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+L clears, like a real shell.
    if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setBlocks([]);
      return;
    }

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      push({ input: `${input}^C`, lines: [] });
      setInput('');
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!busy) void run(input);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const { completion, candidates } = complete(input);
      setInput(completion);
      if (candidates.length > 1) {
        push({
          input,
          lines: [
            { kind: 'dim', text: `  ${candidates.join('   ')}` },
          ],
        });
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const next = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    }
  };

  const statusLabel =
    status === 'online' ? 'api: connected' : status === 'offline' ? 'api: local mode' : 'api: …';

  return (
    <section id="terminal">
      <div className="shell">
        <div className="sec-head reveal" ref={revealRef}>
          <span className="sec-kicker">Interactive</span>
          <h2 className="sec-title">
            Don't scroll. <em>Type.</em>
          </h2>
          <p className="sec-sub">
            This is a real shell. Every command you enter is POSTed to the NestJS API at{' '}
            <code>/api/terminal/exec</code> and rendered from its response. Start with{' '}
            <code>help</code> — and yes, <code>sudo hire-me</code> does something.
          </p>
        </div>

        <div
          className={`term ${focused ? 'is-focused' : ''}`}
          onClick={() => inputRef.current?.focus()}
        >
          <header className="term-bar">
            <div className="term-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="term-title">omid@portfolio: ~ — omsh</span>
            <span className={`term-status term-status-${status}`}>
              <i aria-hidden="true" />
              {statusLabel}
            </span>
          </header>

          <div className="term-body" ref={scrollRef}>
            {blocks.map((block) => (
              <div className="term-block" key={block.id}>
                {block.input !== undefined && (
                  <div className="term-echo">
                    <Prompt />
                    <span className="term-echo-text">{block.input}</span>
                  </div>
                )}
                {block.lines.map((line, i) => (
                  <Line key={i} line={line} />
                ))}
                {block.input !== undefined && block.tookMs !== undefined && (
                  <div className="term-meta">
                    {block.offline ? 'local engine' : 'nestjs'} · {block.tookMs}ms
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="term-block term-busy">
                <span className="term-spinner" aria-hidden="true" />
                <span>executing…</span>
              </div>
            )}

            <div className="term-input-row">
              <Prompt />
              <input
                ref={inputRef}
                className="term-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                aria-label="Terminal input. Type a command and press Enter."
                placeholder={blocks.length <= 1 ? "type 'help' and hit enter" : ''}
              />
            </div>
          </div>

          <footer className="term-foot">
            <span className="term-foot-label">try</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="term-chip"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.focus();
                  void run(s);
                }}
              >
                {s}
              </button>
            ))}
            <span className="term-foot-keys">tab · ↑↓ · ctrl+l</span>
          </footer>
        </div>
      </div>
    </section>
  );
}

function Prompt() {
  return (
    <span className="term-prompt" aria-hidden="true">
      <span className="term-user">omid</span>
      <span className="term-at">@</span>
      <span className="term-host">portfolio</span>
      <span className="term-path">:~$</span>
    </span>
  );
}

function Line({ line }: { line: TermLine }) {
  if (line.kind === 'blank') return <div className="term-line term-blank">&nbsp;</div>;

  const className = `term-line term-${line.kind}`;

  if (line.href) {
    return (
      <div className={className}>
        <a href={line.href} target="_blank" rel="noreferrer noopener">
          {line.text}
        </a>
      </div>
    );
  }

  return <div className={className}>{line.text}</div>;
}
