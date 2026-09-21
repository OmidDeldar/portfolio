import { useEffect, useState } from 'react';
import { profile } from '../data/portfolio.data';
import { useTypewriter } from '../hooks/useTypewriter';
import { getApiStatus, onApiStatus, type ApiStatus } from '../lib/api';
import './hero.css';

export function Hero() {
  const role = useTypewriter(profile.roles);
  const [status, setStatus] = useState<ApiStatus>(getApiStatus());
  const [glitch, setGlitch] = useState(false);

  useEffect(() => onApiStatus(setStatus), []);

  // Occasional glitch pass over the name — rare enough to feel like a flicker,
  // not a broken animation.
  useEffect(() => {
    const schedule = () => {
      const delay = 4500 + Math.random() * 6000;
      return setTimeout(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 420);
        timer = schedule();
      }, delay);
    };
    let timer = schedule();
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="shell hero-inner">
        <div className="hero-badge">
          <span className={`hero-dot hero-dot-${status}`} aria-hidden="true" />
          {profile.status}
        </div>

        <p className="hero-greeting">
          <span className="hero-bracket">{'{'}</span> hello, world — my name is{' '}
          <span className="hero-bracket">{'}'}</span>
        </p>

        <h1 className={`hero-name ${glitch ? 'is-glitching' : ''}`} data-text={profile.name}>
          {profile.name}
        </h1>

        <div className="hero-role" aria-live="polite">
          <span className="hero-role-prefix">$</span>
          <span className="hero-role-text">{role}</span>
          <span className="hero-role-caret" aria-hidden="true" />
        </div>

        <p className="hero-summary">{profile.summary}</p>

        <div className="hero-actions">
          <a className="btn btn-primary" href="#terminal">
            <span aria-hidden="true">▸</span> Try the terminal
          </a>
          <a className="btn btn-ghost" href="#projects">
            See my work
          </a>
          <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
            Get in touch
          </a>
        </div>

        <ul className="hero-links">
          {profile.links.map((link) => (
            <li key={link.label}>
              <a href={link.url} target="_blank" rel="noreferrer noopener">
                <Icon name={link.icon} />
                <span>{link.label}</span>
              </a>
            </li>
          ))}
          <li className="hero-location">
            <Icon name="pin" />
            <span>{profile.location}</span>
          </li>
        </ul>
      </div>

      <a className="hero-scroll" href="#about" aria-label="Scroll to about">
        <span className="hero-scroll-line" aria-hidden="true" />
        <span className="hero-scroll-text">scroll</span>
      </a>
    </section>
  );
}

function Icon({ name }: { name: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'github':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.71h.05c.53-.95 1.83-1.96 3.76-1.96 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.19 1.45-2.19 2.96V21h-4V9Z" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
          <path d="m3 7 8.3 6a1.2 1.2 0 0 0 1.4 0L21 7" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...common}>
          <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
      );
    default:
      return null;
  }
}
