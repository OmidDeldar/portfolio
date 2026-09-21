import { useEffect, useState } from 'react';
import { skills as fallback, type SkillGroup } from '../data/portfolio.data';
import { fetchOr } from '../lib/api';
import { useReveal } from '../hooks/useReveal';
import './skills.css';

export function Skills() {
  const headRef = useReveal();
  const [groups, setGroups] = useState<SkillGroup[]>(fallback);

  useEffect(() => {
    void fetchOr<SkillGroup[]>('/skills', fallback).then(setGroups);
  }, []);

  return (
    <section id="skills">
      <div className="shell">
        <div className="sec-head reveal" ref={headRef}>
          <span className="sec-kicker">04 — Skills</span>
          <h2 className="sec-title">
            The <em>toolkit</em>
          </h2>
          <p className="sec-sub">
            Honest levels, not marketing. The bars fill as you scroll — or run{' '}
            <code>skills</code> in the terminal for the same data as ASCII charts.
          </p>
        </div>

        <div className="skills-grid">
          {groups.map((group, i) => (
            <Group key={group.category} group={group} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Group({ group, delay }: { group: SkillGroup; delay: number }) {
  const ref = useReveal<HTMLDivElement>(delay);

  return (
    <div className="skill-group panel clip-corner reveal" ref={ref}>
      <header className="skill-head">
        <GroupIcon name={group.icon} />
        <h3 className="skill-cat">{group.category}</h3>
      </header>

      <ul className="skill-list">
        {group.skills.map((skill, i) => (
          <li className="skill" key={skill.name}>
            <div className="skill-row">
              <span className="skill-name">{skill.name}</span>
              <span className="skill-pct">{skill.level}%</span>
            </div>
            <div
              className="skill-track"
              role="meter"
              aria-valuenow={skill.level}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={skill.name}
            >
              <span
                className="skill-fill"
                style={
                  {
                    '--level': `${skill.level}%`,
                    '--fill-delay': `${delay + i * 70}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GroupIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'code':
      return (
        <svg {...common}>
          <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
        </svg>
      );
    case 'server':
      return (
        <svg {...common}>
          <rect x="3" y="3.5" width="18" height="7" rx="2" />
          <rect x="3" y="13.5" width="18" height="7" rx="2" />
          <path d="M7 7h.01M7 17h.01" />
        </svg>
      );
    case 'database':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5.5" rx="8" ry="3.2" />
          <path d="M4 5.5v13c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2v-13" />
          <path d="M4 12c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2" />
        </svg>
      );
    case 'terminal':
      return (
        <svg {...common}>
          <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
          <path d="m7 9 3 3-3 3M13 15h4" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 2.5 4.5 5.8v5.5c0 4.7 3.2 9 7.5 10.2 4.3-1.2 7.5-5.5 7.5-10.2V5.8L12 2.5Z" />
          <path d="m9 12 2.2 2.2L15.5 10" />
        </svg>
      );
    case 'layout':
      return (
        <svg {...common}>
          <rect x="3" y="3.5" width="18" height="17" rx="2.5" />
          <path d="M3 9h18M9 9v11.5" />
        </svg>
      );
    default:
      return null;
  }
}
