import { useEffect, useState } from 'react';
import { profile } from '../data/portfolio.data';
import { getApiStatus, onApiStatus, type ApiStatus } from '../lib/api';
import './footer.css';

export function Footer() {
  const [status, setStatus] = useState<ApiStatus>(getApiStatus());
  useEffect(() => onApiStatus(setStatus), []);

  return (
    <footer className="foot">
      <div className="shell foot-inner">
        <div className="foot-left">
          <p className="foot-name">{profile.name}</p>
          <p className="foot-line">{profile.headline}</p>
        </div>

        <div className="foot-mid">
          <p className="foot-built">
            Built with React, Vite and NestJS. The terminal is not a prop.
          </p>
          <p className="foot-api">
            <span className={`foot-dot foot-dot-${status}`} aria-hidden="true" />
            api {status === 'online' ? 'connected' : status === 'offline' ? 'offline — running locally' : 'connecting'}
          </p>
        </div>

        <div className="foot-right">
          <ul className="foot-links">
            {profile.links.map((link) => (
              <li key={link.label}>
                <a href={link.url} target="_blank" rel="noreferrer noopener">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="foot-top" href="#hero">
            back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>

      <p className="foot-copy">© {new Date().getFullYear()} {profile.name}</p>
    </footer>
  );
}
