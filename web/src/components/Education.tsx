import { useEffect, useState } from 'react';
import { education as fallback, type EducationItem } from '../data/portfolio.data';
import { fetchOr } from '../lib/api';
import { useReveal } from '../hooks/useReveal';
import './education.css';

export function Education() {
  const headRef = useReveal();
  const [items, setItems] = useState<EducationItem[]>(fallback);

  useEffect(() => {
    void fetchOr<EducationItem[]>('/education', fallback).then(setItems);
  }, []);

  return (
    <section id="education">
      <div className="shell">
        <div className="sec-head reveal" ref={headRef}>
          <span className="sec-kicker">05 — Education</span>
          <h2 className="sec-title">
            Three degrees, <em>still going</em>
          </h2>
        </div>

        <div className="edu-grid">
          {items.map((item, i) => (
            <Card key={item.id} item={item} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ item, delay }: { item: EducationItem; delay: number }) {
  const ref = useReveal<HTMLElement>(delay);

  return (
    <article className="edu panel clip-corner reveal" ref={ref}>
      <div className="edu-cap" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 1.5 8.5 12 14l10.5-5.5L12 3Z" />
          <path d="M5.5 10.8v4.7c0 1.9 2.9 3.5 6.5 3.5s6.5-1.6 6.5-3.5v-4.7" />
          <path d="M22.5 8.5v6" />
        </svg>
      </div>

      <h3 className="edu-degree">{item.degree}</h3>
      <p className="edu-inst">{item.institution}</p>
      <p className="edu-meta">
        {item.start} — {item.end}
        <span className="edu-sep">·</span>
        {item.location}
      </p>

      <div className="edu-grade">{item.grade}</div>

      {item.honours && (
        <p className="edu-honours">
          <span aria-hidden="true">★</span>
          {item.honours}
        </p>
      )}
    </article>
  );
}
