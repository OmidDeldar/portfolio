import { useState } from 'react';
import { profile } from '../data/portfolio.data';
import { useReveal } from '../hooks/useReveal';
import './contact.css';

export function Contact() {
  const headRef = useReveal();
  const cardRef = useReveal<HTMLDivElement>(120);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked — the value is still selectable on screen */
    }
  };

  return (
    <section id="contact">
      <div className="shell">
        <div className="sec-head reveal" ref={headRef}>
          <span className="sec-kicker">06 — Contact</span>
          <h2 className="sec-title">
            Let's build <em>something</em>
          </h2>
          <p className="sec-sub">
            I'm looking for backend and security engineering roles. If that's what you're hiring
            for — or you just want to argue about microservice boundaries — say hello.
          </p>
        </div>

        <div className="contact-card panel clip-corner reveal" ref={cardRef}>
          <div className="contact-main">
            <p className="contact-status">
              <span className="contact-pulse" aria-hidden="true" />
              {profile.status}
            </p>

            <a className="contact-email" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>

            <div className="contact-actions">
              <a className="btn btn-primary" href={`mailto:${profile.email}?subject=Hello%20Omid`}>
                Send an email
              </a>
              <button className="btn btn-ghost" onClick={() => copy(profile.email, 'email')}>
                {copied === 'email' ? '✓ copied' : 'Copy address'}
              </button>
            </div>
          </div>

          <ul className="contact-rows">
            <Row label="email" value={profile.email} onCopy={() => copy(profile.email, 'email-row')} copied={copied === 'email-row'} />
            <Row label="location" value={profile.location} />
            {profile.links
              .filter((l) => l.icon !== 'mail')
              .map((link) => (
                <Row key={link.label} label={link.label.toLowerCase()} value={link.url} href={link.url} />
              ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  href,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  href?: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <li className="contact-row">
      <span className="contact-label">{label}</span>
      {href ? (
        <a className="contact-value" href={href} target="_blank" rel="noreferrer noopener">
          {value.replace(/^https?:\/\//, '')}
        </a>
      ) : (
        <span className="contact-value">{value}</span>
      )}
      {onCopy && (
        <button className="contact-copy" onClick={onCopy} aria-label={`Copy ${label}`}>
          {copied ? '✓' : 'copy'}
        </button>
      )}
    </li>
  );
}
