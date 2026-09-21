import { useEffect, useState } from 'react';
import { useActiveSection } from '../hooks/useActiveSection';
import './nav.css';

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'contact', label: 'Contact' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(LINKS.map((l) => l.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu when a link is used or the viewport grows.
  useEffect(() => {
    if (!open) return;
    const onResize = () => window.innerWidth > 880 && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner shell">
        <a href="#hero" className="nav-brand" aria-label="Back to top">
          <span className="nav-brand-mark" aria-hidden="true">
            &lt;/&gt;
          </span>
          <span className="nav-brand-text">
            omid<span>.deldar</span>
          </span>
        </a>

        <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Sections">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? 'is-active' : ''}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a className="nav-cta" href="#terminal">
          <span aria-hidden="true">▸</span> open shell
        </a>

        <button
          className={`nav-burger ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
