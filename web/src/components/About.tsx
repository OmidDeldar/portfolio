import { expertise, profile } from '../data/portfolio.data';
import { useReveal } from '../hooks/useReveal';
import './about.css';

/** The two tracks that define where Omid is right now. */
const TRACKS = [
  {
    key: 'backend',
    title: 'Building backends',
    blurb:
      'Two and a half years of production Node.js and NestJS — microservices talking over RabbitMQ, ' +
      'PostgreSQL and MongoDB behind them, Socket.IO on top, all of it containerised. The thing I ' +
      'care about most is architecture that the next person can actually read.',
    points: ['NestJS microservices', 'PostgreSQL & TypeORM', 'RabbitMQ messaging', 'Docker & Kubernetes'],
  },
  {
    key: 'security',
    title: 'Breaking them on purpose',
    blurb:
      'I got into security by attacking the systems I had just finished building. Now I run a SOC lab ' +
      'on ESXi with Wazuh agents across Windows and Linux, tune ModSecurity rules against the OWASP CRS, ' +
      'and write up the incidents afterwards.',
    points: ['Wazuh SIEM & SOC', 'WAF tuning (OWASP CRS)', 'OWASP ZAP & Kali', 'Incident response'],
  },
];

export function About() {
  const headRef = useReveal();
  const codeRef = useReveal<HTMLDivElement>(120);

  return (
    <section id="about">
      <div className="shell">
        <div className="sec-head reveal" ref={headRef}>
          <span className="sec-kicker">01 — About</span>
          <h2 className="sec-title">
            Backend engineer who kept <em>asking how to break in</em>
          </h2>
          <p className="sec-sub">{profile.summary}</p>
        </div>

        <div className="about-grid">
          <div className="about-tracks">
            {TRACKS.map((track, i) => (
              <Track key={track.key} track={track} delay={i * 130} />
            ))}
          </div>

          <div className="about-code panel clip-corner reveal" ref={codeRef}>
            <div className="about-code-bar">
              <span className="about-code-file">omid.config.ts</span>
            </div>
            <pre className="about-code-body">
              <code>
                <Ln>
                  <K>export const</K> <V>omid</V> <O>=</O> {'{'}
                </Ln>
                <Ln i={1}>
                  <P>role</P>
                  <O>:</O> <S>'Backend Developer'</S>
                  <O>,</O>
                </Ln>
                <Ln i={1}>
                  <P>nextRole</P>
                  <O>:</O> <S>'Security Engineer'</S>
                  <O>,</O>
                </Ln>
                <Ln i={1}>
                  <P>location</P>
                  <O>:</O> <S>'Gold Coast, AU'</S>
                  <O>,</O>
                </Ln>
                <Ln i={1}>
                  <P>runtime</P>
                  <O>:</O> [<S>'node'</S>
                  <O>,</O> <S>'nestjs'</S>
                  <O>,</O> <S>'docker'</S>]<O>,</O>
                </Ln>
                <Ln i={1}>
                  <P>studying</P>
                  <O>:</O> <S>'MSc IT @ Griffith'</S>
                  <O>,</O>
                </Ln>
                <Ln i={1}>
                  <P>gpa</P>
                  <O>:</O> <N>6.5</N>
                  <O>,</O> <C>// top 5%</C>
                </Ln>
                <Ln i={1}>
                  <P>available</P>
                  <O>:</O> <B>true</B>
                  <O>,</O>
                </Ln>
                <Ln i={1}>
                  <F>hire</F>
                  <O>:</O> <K>async</K> <O>{'() =>'}</O> <V>mail</V>
                  <O>(</O>
                  <S>'omiddeldar.om@gmail.com'</S>
                  <O>),</O>
                </Ln>
                <Ln>{'};'}</Ln>
              </code>
            </pre>
          </div>
        </div>

        <ExpertiseGrid />
      </div>
    </section>
  );
}

function Track({
  track,
  delay,
}: {
  track: (typeof TRACKS)[number];
  delay: number;
}) {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <article className={`track panel clip-corner reveal track-${track.key}`} ref={ref}>
      <h3 className="track-title">{track.title}</h3>
      <p className="track-blurb">{track.blurb}</p>
      <ul className="track-points">
        {track.points.map((p) => (
          <li key={p}>
            <span aria-hidden="true">▹</span>
            {p}
          </li>
        ))}
      </ul>
    </article>
  );
}

function ExpertiseGrid() {
  const ref = useReveal<HTMLDivElement>(80);
  return (
    <div className="expertise reveal" ref={ref}>
      {expertise.map((group) => (
        <div className="expertise-group" key={group.label}>
          <h4 className="expertise-label">{group.label}</h4>
          <div className="tag-row">
            {group.items.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Tiny syntax-highlight primitives for the code card. */
const Ln = ({ children, i = 0 }: { children: React.ReactNode; i?: number }) => (
  <div className="about-code-line" style={{ paddingLeft: `${i * 1.4}rem` }}>
    {children}
  </div>
);
const K = ({ children }: { children: React.ReactNode }) => <span className="tok-key">{children}</span>;
const V = ({ children }: { children: React.ReactNode }) => <span className="tok-var">{children}</span>;
const P = ({ children }: { children: React.ReactNode }) => <span className="tok-prop">{children}</span>;
const S = ({ children }: { children: React.ReactNode }) => <span className="tok-str">{children}</span>;
const N = ({ children }: { children: React.ReactNode }) => <span className="tok-num">{children}</span>;
const B = ({ children }: { children: React.ReactNode }) => <span className="tok-bool">{children}</span>;
const F = ({ children }: { children: React.ReactNode }) => <span className="tok-fn">{children}</span>;
const C = ({ children }: { children: React.ReactNode }) => <span className="tok-com">{children}</span>;
const O = ({ children }: { children: React.ReactNode }) => <span className="tok-op">{children}</span>;
