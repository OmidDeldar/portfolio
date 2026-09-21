import { useEffect, useState } from 'react';
import { stats as fallbackStats, type StatItem } from '../data/portfolio.data';
import { fetchOr, fetchStats } from '../lib/api';
import { useCountUp } from '../hooks/useCountUp';
import { useReveal } from '../hooks/useReveal';
import './stats.css';

export function Stats() {
  const [items, setItems] = useState<StatItem[]>(fallbackStats);
  const [live, setLive] = useState<{ visits: number; unique: number } | null>(null);

  useEffect(() => {
    void fetchOr<StatItem[]>('/profile/stats', fallbackStats).then(setItems);
    void fetchStats().then((snapshot) => {
      if (snapshot) setLive({ visits: snapshot.visits, unique: snapshot.unique });
    });
  }, []);

  return (
    <section id="stats" className="stats">
      <div className="shell">
        <div className="stats-grid">
          {items.map((item, i) => (
            <StatCard key={item.label} item={item} delay={i * 90} />
          ))}
        </div>

        {live && (
          <p className="stats-live">
            <span className="stats-live-dot" aria-hidden="true" />
            live from the API — {live.visits} view{live.visits === 1 ? '' : 's'} this session,{' '}
            {live.unique} unique visitor{live.unique === 1 ? '' : 's'}
          </p>
        )}
      </div>
    </section>
  );
}

function StatCard({ item, delay }: { item: StatItem; delay: number }) {
  const { ref, value } = useCountUp(item.value, item.decimals);
  const revealRef = useReveal<HTMLDivElement>(delay);

  const display =
    item.value >= 1000 && item.decimals === 0
      ? Math.round(value).toLocaleString()
      : value.toFixed(item.decimals);

  return (
    <div className="stat-card panel clip-corner reveal" ref={revealRef}>
      <div className="stat-value" ref={ref}>
        {display}
        <span className="stat-suffix">{item.suffix}</span>
      </div>
      <div className="stat-label">{item.label}</div>
      <div className="stat-caption">{item.caption}</div>
    </div>
  );
}
