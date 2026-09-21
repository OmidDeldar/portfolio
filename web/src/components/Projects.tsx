import { useEffect, useRef, useState } from 'react';
import { projects as fallback, type Project } from '../data/portfolio.data';
import { fetchOr } from '../lib/api';
import { useReveal } from '../hooks/useReveal';
import './projects.css';

export function Projects() {
  const headRef = useReveal();
  const [items, setItems] = useState<Project[]>(fallback);

  useEffect(() => {
    void fetchOr<Project[]>('/projects', fallback).then(setItems);
  }, []);

  return (
    <section id="projects">
      <div className="shell">
        <div className="sec-head reveal" ref={headRef}>
          <span className="sec-kicker">03 — Projects</span>
          <h2 className="sec-title">
            Things I built <em>because I wanted to</em>
          </h2>
          <p className="sec-sub">
            From a networked Tetris in JavaFX to a microservice crypto aggregator and a pet feeder
            running on an ESP8266. Different stacks, same curiosity.
          </p>
        </div>

        <div className="proj-grid">
          {items.map((project, i) => (
            <Card key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ project, index }: { project: Project; index: number }) {
  const revealRef = useReveal<HTMLElement>(index * 80);
  const cardRef = useRef<HTMLDivElement>(null);

  /** Tilt the card toward the cursor and move the glare with it. */
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    card.style.setProperty('--rx', `${(0.5 - py) * 9}deg`);
    card.style.setProperty('--ry', `${(px - 0.5) * 11}deg`);
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
  };

  const reset = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  return (
    <article className="proj reveal" ref={revealRef} data-accent={project.accent}>
      <div
        className="proj-card panel clip-corner"
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
      >
        <div className="proj-glare" aria-hidden="true" />

        <header className="proj-head">
          <span className="proj-index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <a
            className="proj-repo"
            href={project.repo}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${project.name} source code`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
            </svg>
          </a>
        </header>

        <h3 className="proj-name">{project.name}</h3>
        <p className="proj-tagline">{project.tagline}</p>
        <p className="proj-desc">{project.description}</p>

        <footer className="proj-foot">
          <div className="tag-row">
            {project.stack.map((tech) => (
              <span className="tag" key={tech}>
                {tech}
              </span>
            ))}
          </div>
          <time className="proj-period">{project.period}</time>
        </footer>
      </div>
    </article>
  );
}
