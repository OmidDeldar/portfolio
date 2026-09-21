import { useEffect, useState } from 'react';
import { experience as fallback, type ExperienceItem } from '../data/portfolio.data';
import { fetchOr } from '../lib/api';
import { useReveal } from '../hooks/useReveal';
import './experience.css';

export function Experience() {
  const headRef = useReveal();
  const [items, setItems] = useState<ExperienceItem[]>(fallback);

  useEffect(() => {
    void fetchOr<ExperienceItem[]>('/experience', fallback).then(setItems);
  }, []);

  return (
    <section id="experience">
      <div className="shell">
        <div className="sec-head reveal" ref={headRef}>
          <span className="sec-kicker">02 — Experience</span>
          <h2 className="sec-title">
            Where I've <em>shipped things</em>
          </h2>
          <p className="sec-sub">
            Three roles, two countries, one throughline: building systems and then making sure
            they hold up under pressure.
          </p>
        </div>

        <ol className="timeline">
          {items.map((item, i) => (
            <Entry key={item.id} item={item} delay={i * 110} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Entry({ item, delay }: { item: ExperienceItem; delay: number }) {
  const ref = useReveal<HTMLLIElement>(delay);
  const [open, setOpen] = useState(item.current);

  return (
    <li className={`tl-item reveal ${item.current ? 'is-current' : ''}`} ref={ref}>
      <div className="tl-marker" aria-hidden="true">
        <span className="tl-dot" />
      </div>

      <article className="tl-card panel clip-corner">
        <header className="tl-head">
          <div>
            <h3 className="tl-role">
              {item.role}
              {item.current && <span className="tl-badge">current</span>}
            </h3>
            <p className="tl-company">
              <a href={item.companyUrl} target="_blank" rel="noreferrer noopener">
                {item.company}
              </a>
              <span className="tl-sep">·</span>
              <span className="tl-location">{item.location}</span>
            </p>
          </div>
          <time className="tl-dates">
            {item.start} — {item.end}
          </time>
        </header>

        <button
          className="tl-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`tl-body-${item.id}`}
        >
          <span className={`tl-chevron ${open ? 'is-open' : ''}`} aria-hidden="true" />
          {open ? 'Hide details' : `${item.highlights.length} highlights`}
        </button>

        <div id={`tl-body-${item.id}`} className={`tl-body ${open ? 'is-open' : ''}`}>
          <ul className="tl-highlights">
            {item.highlights.map((h, i) => (
              <li key={i}>
                <span className="tl-bullet" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="tag-row tl-skills">
          {item.skills.map((skill) => (
            <span className="tag" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      </article>
    </li>
  );
}
