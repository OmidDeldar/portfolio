/**
 * The terminal engine.
 *
 * Deliberately framework-free: no Nest decorators, no DI, no node built-ins.
 * That lets the exact same file run server-side (behind POST /api/terminal/exec)
 * and client-side as an offline fallback when the API is unreachable.
 *
 * `scripts/sync-shared.mjs` copies this file into web/src/lib/, so edit it HERE only.
 */

import {
  education,
  experience,
  expertise,
  profile,
  projects,
  skills,
  stats,
} from '../../data/portfolio.data';

export type LineKind = 'out' | 'ok' | 'warn' | 'err' | 'dim' | 'accent' | 'head' | 'blank';

export interface TermLine {
  kind: LineKind;
  text: string;
  /** Optional link target — rendered as an anchor by the client. */
  href?: string;
  /** Client types this line out character-by-character instead of printing it instantly. */
  typed?: boolean;
}

export type TermAction =
  | { type: 'clear' }
  | { type: 'open'; url: string }
  | { type: 'theme'; value: string }
  | { type: 'matrix' }
  | { type: 'scroll'; target: string }
  | { type: 'exit' };

export interface ExecResult {
  command: string;
  args: string[];
  lines: TermLine[];
  action?: TermAction;
  /** Server-measured handling time in ms. */
  tookMs?: number;
  /** True when produced by the browser fallback rather than the API. */
  offline?: boolean;
}

export interface CommandSpec {
  name: string;
  summary: string;
  usage: string;
  hidden?: boolean;
  group: 'info' | 'nav' | 'system' | 'fun';
  run: (args: string[]) => TermLine[] | ExecResultPartial;
}

type ExecResultPartial = { lines: TermLine[]; action?: TermAction };

/* ------------------------------------------------------------------ helpers */

const out = (text = ''): TermLine => ({ kind: text ? 'out' : 'blank', text });
const dim = (text: string): TermLine => ({ kind: 'dim', text });
const ok = (text: string): TermLine => ({ kind: 'ok', text });
const warn = (text: string): TermLine => ({ kind: 'warn', text });
const err = (text: string): TermLine => ({ kind: 'err', text });
const accent = (text: string): TermLine => ({ kind: 'accent', text });
const head = (text: string): TermLine => ({ kind: 'head', text });
const blank = (): TermLine => ({ kind: 'blank', text: '' });
const link = (text: string, href: string): TermLine => ({ kind: 'accent', text, href });

/** Wrap long prose at `width` columns so the terminal never overflows horizontally. */
function wrap(text: string, width = 78, indent = ''): TermLine[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > width) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.map((l) => out(indent + l));
}

function pad(text: string, width: number): string {
  return text.length >= width ? text : text + ' '.repeat(width - text.length);
}

/* --------------------------------------------------- virtual filesystem */

const FILESYSTEM: Record<string, string[]> = {
  '~': [
    'about.txt',
    'experience/',
    'projects/',
    'skills.json',
    'education.txt',
    'contact.md',
    '.secrets',
  ],
  '~/experience': experience.map((e) => `${e.id}.log`),
  '~/projects': projects.map((p) => `${p.id}.md`),
};

/* --------------------------------------------------------- command bodies */

function cmdHelp(): TermLine[] {
  const groups: { key: CommandSpec['group']; title: string }[] = [
    { key: 'info', title: 'ABOUT ME' },
    { key: 'nav', title: 'NAVIGATION' },
    { key: 'system', title: 'SYSTEM' },
    { key: 'fun', title: 'EXTRAS' },
  ];

  const lines: TermLine[] = [
    blank(),
    head('Available commands'),
    dim('Tab completes · ↑/↓ recalls history · Ctrl+L clears'),
    blank(),
  ];

  for (const group of groups) {
    const members = registry.filter((c) => c.group === group.key && !c.hidden);
    if (!members.length) continue;
    lines.push(accent(`  ${group.title}`));
    for (const c of members) {
      lines.push(out(`    ${pad(c.name, 14)} ${c.summary}`));
    }
    lines.push(blank());
  }

  lines.push(dim('  Some commands are not on this list. Curiosity is rewarded.'));
  lines.push(blank());
  return lines;
}

function cmdWhoami(): TermLine[] {
  return [
    blank(),
    accent(`  ${profile.name}`),
    out(`  ${profile.headline}`),
    dim(`  ${profile.location} · ${profile.status}`),
    blank(),
    ...wrap(profile.summary, 76, '  '),
    blank(),
  ];
}

function cmdAbout(): TermLine[] {
  return cmdWhoami();
}

function cmdLs(args: string[]): TermLine[] {
  const raw = (args[0] ?? '~').replace(/\/$/, '');
  const key = raw === '.' || raw === '' ? '~' : raw.startsWith('~') ? raw : `~/${raw}`;
  const entries = FILESYSTEM[key];
  if (!entries) {
    return [err(`ls: cannot access '${args[0]}': No such file or directory`)];
  }
  return [
    blank(),
    dim(`  ${key}`),
    ...entries.map((e) =>
      e.endsWith('/') ? accent(`  ${e}`) : out(`  ${e}`),
    ),
    blank(),
  ];
}

function cmdCat(args: string[]): TermLine[] {
  const file = args[0];
  if (!file) return [err('cat: missing operand'), dim('Try: cat about.txt')];

  const name = file.replace(/^~\//, '').replace(/^\.\//, '');

  switch (name) {
    case 'about.txt':
      return cmdWhoami();
    case 'skills.json':
      return cmdSkills([]);
    case 'education.txt':
      return cmdEducation();
    case 'contact.md':
      return cmdContact();
    case '.secrets':
      return [
        blank(),
        warn('  Nice try. 🔒'),
        dim('  Permission denied — but I respect the instinct.'),
        dim("  (A real pentester would try 'sudo cat .secrets')"),
        blank(),
      ];
    default:
      break;
  }

  const exp = experience.find((e) => `${e.id}.log` === name || e.id === name);
  if (exp) return renderExperience(exp.id);

  const proj = projects.find((p) => `${p.id}.md` === name || p.id === name);
  if (proj) return renderProject(proj.id);

  return [err(`cat: ${file}: No such file or directory`)];
}

function renderExperience(id?: string): TermLine[] {
  const items = id ? experience.filter((e) => e.id === id) : experience;
  if (!items.length) {
    return [
      err(`experience: unknown role '${id}'`),
      dim(`Available: ${experience.map((e) => e.id).join(', ')}`),
    ];
  }

  const lines: TermLine[] = [blank()];
  for (const item of items) {
    lines.push(accent(`  ${item.role} @ ${item.company}`));
    lines.push(
      dim(
        `  ${item.start} — ${item.end}${item.current ? '  [CURRENT]' : ''} · ${item.location}`,
      ),
    );
    lines.push(blank());
    for (const h of item.highlights) {
      const wrapped = wrap(h, 72, '    ');
      wrapped[0] = out(`  • ${wrapped[0].text.trim()}`);
      lines.push(...wrapped);
    }
    lines.push(blank());
    lines.push(dim(`  stack: ${item.skills.join(' · ')}`));
    lines.push(blank());
  }
  return lines;
}

function renderProject(id?: string): TermLine[] {
  const items = id ? projects.filter((p) => p.id === id) : projects;
  if (!items.length) {
    return [
      err(`projects: unknown project '${id}'`),
      dim(`Available: ${projects.map((p) => p.id).join(', ')}`),
    ];
  }

  const lines: TermLine[] = [blank()];
  for (const p of items) {
    lines.push(accent(`  ${p.name}`));
    lines.push(dim(`  ${p.period} · ${p.stack.join(' · ')}`));
    lines.push(blank());
    lines.push(...wrap(p.description, 74, '  '));
    lines.push(blank());
    lines.push(link(`  ${p.repo}`, p.repo));
    lines.push(blank());
  }
  if (!id) lines.push(dim("  Tip: 'projects <name>' for one in detail, e.g. projects tetris"));
  lines.push(blank());
  return lines;
}

function cmdSkills(args: string[]): TermLine[] {
  const filter = args[0]?.toLowerCase();
  const groups = filter
    ? skills.filter((g) => g.category.toLowerCase().includes(filter))
    : skills;

  if (!groups.length) {
    return [
      err(`skills: no category matching '${args[0]}'`),
      dim(`Available: ${skills.map((s) => s.category.toLowerCase()).join(', ')}`),
    ];
  }

  const lines: TermLine[] = [blank()];
  for (const g of groups) {
    lines.push(accent(`  ${g.category}`));
    for (const s of g.skills) {
      const filled = Math.round(s.level / 5);
      const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
      lines.push(out(`    ${pad(s.name, 30)} ${bar} ${s.level}%`));
    }
    lines.push(blank());
  }
  return lines;
}

function cmdEducation(): TermLine[] {
  const lines: TermLine[] = [blank()];
  for (const e of education) {
    lines.push(accent(`  ${e.degree}`));
    lines.push(out(`  ${e.institution} · ${e.location}`));
    lines.push(dim(`  ${e.start} — ${e.end} · ${e.grade}`));
    if (e.honours) lines.push(ok(`  ★ ${e.honours}`));
    lines.push(blank());
  }
  return lines;
}

function cmdContact(): TermLine[] {
  return [
    blank(),
    head('  Get in touch'),
    blank(),
    out(`  email     ${profile.email}`),
    out(`  location  ${profile.location}`),
    blank(),
    ...profile.links.map((l) => link(`  ${pad(l.label.toLowerCase(), 10)}${l.url}`, l.url)),
    blank(),
    ok(`  ${profile.status}`),
    blank(),
  ];
}

function cmdSocial(): TermLine[] {
  return cmdContact();
}

function cmdStack(): TermLine[] {
  const lines: TermLine[] = [blank()];
  for (const group of expertise) {
    lines.push(accent(`  ${pad(group.label, 26)}`));
    lines.push(...wrap(group.items.join(' · '), 70, '    '));
    lines.push(blank());
  }
  return lines;
}

function cmdNeofetch(): TermLine[] {
  const art = [
    '      ▄▄▄▄▄▄▄▄▄▄▄      ',
    '   ▄█████████████▄    ',
    '  ███▀         ▀███   ',
    ' ███   ▄█████▄   ███  ',
    ' ██   ███   ███   ██  ',
    ' ███   ▀█████▀   ███  ',
    '  ███▄         ▄███   ',
    '   ▀█████████████▀    ',
    '      ▀▀▀▀▀▀▀▀▀▀▀     ',
  ];

  const info: [string, string][] = [
    ['user', `${profile.handle}@portfolio`],
    ['os', 'OmidOS 2.0 (purple-void)'],
    ['shell', 'omsh 1.4.0'],
    ['role', 'Backend Developer → Security Engineer'],
    ['runtime', 'Node.js 22 · NestJS 10'],
    ['db', 'PostgreSQL · MongoDB · Redis'],
    ['broker', 'RabbitMQ'],
    ['security', 'Wazuh · ModSecurity · OWASP ZAP'],
    ['location', profile.location],
    ['uptime', `${stats[0].value}+ years in backend`],
    ['status', profile.status],
  ];

  const lines: TermLine[] = [blank()];
  const rows = Math.max(art.length, info.length);
  for (let i = 0; i < rows; i++) {
    const left = art[i] ?? ' '.repeat(22);
    const entry = info[i];
    if (!entry) {
      lines.push(accent(left));
      continue;
    }
    lines.push({
      kind: 'out',
      text: `${left}  ${pad(entry[0], 9)} ${entry[1]}`,
    });
  }
  lines.push(blank());
  return lines;
}

function cmdSudo(args: string[]): ExecResultPartial {
  const sub = args.join(' ').trim();

  if (sub === 'hire-me' || sub === 'hire me') {
    return {
      lines: [
        blank(),
        dim('  [sudo] password for guest: ********'),
        ok('  Authentication successful.'),
        blank(),
        out('  Running pre-flight checks...'),
        ok('  ✓ 2+ years of production Node.js / NestJS'),
        ok('  ✓ Microservices, RabbitMQ, PostgreSQL, Docker'),
        ok('  ✓ SOC / SIEM experience — Wazuh, WAF, incident response'),
        ok('  ✓ Masters in IT, top 5% of cohort'),
        ok('  ✓ Currently available'),
        blank(),
        accent('  All checks passed. Opening your mail client...'),
        dim(`  → ${profile.email}`),
        blank(),
      ],
      action: { type: 'open', url: `mailto:${profile.email}?subject=Let%27s%20talk` },
    };
  }

  if (sub === 'cat .secrets' || sub === 'cat ~/.secrets') {
    return {
      lines: [
        blank(),
        dim('  [sudo] password for guest: ********'),
        ok('  Access granted. Decrypting...'),
        blank(),
        accent('  ── .secrets ──────────────────────────────'),
        out('  1. This whole site is a React + NestJS app.'),
        out('     The terminal you are typing into is a real'),
        out('     POST /api/terminal/exec round-trip.'),
        out('  2. I built a Tetris in JavaFX with online'),
        out('     multiplayer because single-player got boring.'),
        out('  3. I got into security by trying to break the'),
        out('     backends I had just finished building.'),
        out('  4. Try: matrix, scan, coffee'),
        accent('  ──────────────────────────────────────────'),
        blank(),
      ],
    };
  }

  if (!sub) return { lines: [err('sudo: a command is required'), dim('Try: sudo hire-me')] };

  return {
    lines: [
      dim('  [sudo] password for guest: ********'),
      err(`  guest is not in the sudoers file. This incident has been reported.`),
      dim('  (Logged to Wazuh, naturally.)'),
    ],
  };
}

function cmdScan(): TermLine[] {
  return [
    blank(),
    dim('  Starting vulnerability scan against target: you'),
    blank(),
    out('  [*] Enumerating open ports...'),
    ok('  [+] 22/tcp   ssh       curiosity (open)'),
    ok('  [+] 443/tcp  https     hiring-intent (open)'),
    warn('  [!] 8080/tcp http     unpatched-budget (filtered)'),
    blank(),
    out('  [*] Running signature checks...'),
    ok('  [+] CVE-2026-HIRE — Critical: this candidate is available'),
    out('      Severity : 10.0 / CRITICAL'),
    out('      Vector   : NETWORK / LOW-COMPLEXITY / NO-AUTH'),
    out('      Fix      : run `sudo hire-me`'),
    blank(),
    dim('  Scan complete. 1 critical finding. 0 false positives.'),
    blank(),
  ];
}

function cmdPs(): TermLine[] {
  return [
    blank(),
    dim('  PID   USER   %CPU  COMMAND'),
    out('  1     omid    2.1  /sbin/init --backend'),
    out('  142   omid   31.4  node nest-api --watch'),
    out('  287   omid   18.9  wazuh-agentd'),
    out('  411   omid   12.7  docker-compose up'),
    out('  620   omid    9.3  masters-thesis --deadline=nov-2026'),
    out('  777   omid   88.2  coffee-daemon'),
    blank(),
  ];
}

function cmdCoffee(): TermLine[] {
  return [
    blank(),
    accent('      ( ('),
    accent('       ) )'),
    accent('    ┌──────┐'),
    accent('    │      │]'),
    accent('    │      │ '),
    accent('    └──────┘ '),
    blank(),
    out('  HTTP 418 — I\'m a teapot.'),
    dim('  Brewing refused. Backend developers run on this, though.'),
    blank(),
  ];
}

function cmdUptime(): TermLine[] {
  const since = new Date('2021-09-01T00:00:00Z').getTime();
  const years = (Date.now() - since) / (1000 * 60 * 60 * 24 * 365.25);
  return [
    out(
      `  up ${years.toFixed(1)} years,  3 roles,  5 shipped projects,  load average: 0.42, 0.51, 0.47`,
    ),
  ];
}

function cmdDate(): TermLine[] {
  return [out(`  ${new Date().toString()}`)];
}

function cmdEcho(args: string[]): TermLine[] {
  return [out(`  ${args.join(' ')}`)];
}

function cmdBanner(): TermLine[] {
  return [
    blank(),
    accent('   ██████  ███    ███ ██ ██████  '),
    accent('  ██    ██ ████  ████ ██ ██   ██ '),
    accent('  ██    ██ ██ ████ ██ ██ ██   ██ '),
    accent('  ██    ██ ██  ██  ██ ██ ██   ██ '),
    accent('   ██████  ██      ██ ██ ██████  '),
    blank(),
    dim(`  ${profile.headline}`),
    dim("  Type 'help' to get started."),
    blank(),
  ];
}

function cmdMan(args: string[]): TermLine[] {
  const target = args[0];
  if (!target) return [err('What manual page do you want?'), dim('Try: man whoami')];
  const spec = registry.find((c) => c.name === target);
  if (!spec) return [err(`No manual entry for ${target}`)];
  return [
    blank(),
    head(`  ${spec.name.toUpperCase()}(1)`),
    blank(),
    accent('  NAME'),
    out(`    ${spec.name} — ${spec.summary}`),
    blank(),
    accent('  SYNOPSIS'),
    out(`    ${spec.usage}`),
    blank(),
  ];
}

/* ------------------------------------------------------------- the registry */

export const registry: CommandSpec[] = [
  { name: 'help', summary: 'List everything you can run here', usage: 'help', group: 'info', run: cmdHelp },
  { name: 'whoami', summary: 'Who I am, in one screen', usage: 'whoami', group: 'info', run: cmdWhoami },
  { name: 'about', summary: 'Alias for whoami', usage: 'about', group: 'info', hidden: true, run: cmdAbout },
  { name: 'experience', summary: 'Work history and what I actually did', usage: 'experience [role-id]', group: 'info', run: (a) => renderExperience(a[0]) },
  { name: 'projects', summary: 'Things I built, with links', usage: 'projects [project-id]', group: 'info', run: (a) => renderProject(a[0]) },
  { name: 'skills', summary: 'Skill levels as bar charts', usage: 'skills [category]', group: 'info', run: cmdSkills },
  { name: 'stack', summary: 'Full technology stack, by area', usage: 'stack', group: 'info', run: cmdStack },
  { name: 'education', summary: 'Degrees, GPAs and honours', usage: 'education', group: 'info', run: cmdEducation },
  { name: 'contact', summary: 'How to reach me', usage: 'contact', group: 'info', run: cmdContact },
  { name: 'social', summary: 'Alias for contact', usage: 'social', group: 'info', hidden: true, run: cmdSocial },

  { name: 'ls', summary: 'List files in the current directory', usage: 'ls [path]', group: 'nav', run: cmdLs },
  { name: 'cat', summary: 'Print the contents of a file', usage: 'cat <file>', group: 'nav', run: cmdCat },
  { name: 'goto', summary: 'Scroll the page to a section', usage: 'goto <hero|about|work|projects|skills|contact>', group: 'nav', run: cmdGoto },
  { name: 'open', summary: 'Open one of my links in a new tab', usage: 'open <github|linkedin|email>', group: 'nav', run: cmdOpen },

  { name: 'neofetch', summary: 'System info, the way Linux people like it', usage: 'neofetch', group: 'system', run: cmdNeofetch },
  { name: 'ps', summary: 'What I am currently running', usage: 'ps', group: 'system', run: cmdPs },
  { name: 'uptime', summary: 'How long I have been doing this', usage: 'uptime', group: 'system', run: cmdUptime },
  { name: 'date', summary: 'Server time', usage: 'date', group: 'system', run: cmdDate },
  { name: 'echo', summary: 'Say something back', usage: 'echo <text>', group: 'system', run: cmdEcho },
  { name: 'man', summary: 'Manual page for a command', usage: 'man <command>', group: 'system', run: cmdMan },
  { name: 'clear', summary: 'Clear the screen', usage: 'clear', group: 'system', run: () => ({ lines: [], action: { type: 'clear' } }) },
  { name: 'sudo', summary: 'Elevate. Try: sudo hire-me', usage: 'sudo <command>', group: 'system', run: cmdSudo },

  { name: 'scan', summary: 'Run a vulnerability scan (on you)', usage: 'scan', group: 'fun', run: cmdScan },
  { name: 'matrix', summary: 'Enter the void', usage: 'matrix', group: 'fun', run: () => ({ lines: [ok('  Wake up, recruiter...')], action: { type: 'matrix' } }) },
  { name: 'theme', summary: 'Switch the site theme', usage: 'theme <violet|toxic|amber|ice>', group: 'fun', run: cmdTheme },
  { name: 'banner', summary: 'Print the big letters again', usage: 'banner', group: 'fun', run: cmdBanner },
  { name: 'coffee', summary: 'Brew a coffee', usage: 'coffee', group: 'fun', hidden: true, run: cmdCoffee },
  { name: 'exit', summary: 'Close the session', usage: 'exit', group: 'fun', hidden: true, run: () => ({ lines: [dim('  Session closed. (Not really — refresh to come back.)')], action: { type: 'exit' } }) },
];

function cmdGoto(args: string[]): ExecResultPartial {
  const valid = ['hero', 'about', 'work', 'experience', 'projects', 'skills', 'education', 'contact'];
  const target = args[0]?.toLowerCase();
  if (!target || !valid.includes(target)) {
    return {
      lines: [
        err(`goto: unknown section '${args[0] ?? ''}'`),
        dim(`Available: ${valid.join(', ')}`),
      ],
    };
  }
  const normalised = target === 'work' ? 'experience' : target;
  return {
    lines: [dim(`  Navigating to #${normalised}...`)],
    action: { type: 'scroll', target: normalised },
  };
}

function cmdOpen(args: string[]): ExecResultPartial {
  const key = args[0]?.toLowerCase();
  const map: Record<string, string> = {
    github: 'https://github.com/OmidDeldar',
    linkedin: 'https://linkedin.com/in/omiddeldar',
    email: `mailto:${profile.email}`,
    mail: `mailto:${profile.email}`,
  };
  if (!key || !map[key]) {
    return {
      lines: [
        err(`open: don't know how to open '${args[0] ?? ''}'`),
        dim('Available: github, linkedin, email'),
      ],
    };
  }
  return {
    lines: [dim(`  Opening ${key}...`)],
    action: { type: 'open', url: map[key] },
  };
}

function cmdTheme(args: string[]): ExecResultPartial {
  const themes = ['violet', 'toxic', 'amber', 'ice'];
  const value = args[0]?.toLowerCase();
  if (!value || !themes.includes(value)) {
    return {
      lines: [
        err(`theme: unknown theme '${args[0] ?? ''}'`),
        dim(`Available: ${themes.join(', ')}`),
      ],
    };
  }
  return {
    lines: [ok(`  Theme set to ${value}.`)],
    action: { type: 'theme', value },
  };
}

/* ------------------------------------------------------------------ parsing */

export const commandNames = registry.filter((c) => !c.hidden).map((c) => c.name);
export const allCommandNames = registry.map((c) => c.name);

/** Split a raw input line into a command and its arguments, honouring quotes. */
export function parse(input: string): { command: string; args: string[] } {
  const tokens = input.trim().match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  const cleaned = tokens.map((t) => t.replace(/^["']|["']$/g, ''));
  return { command: (cleaned[0] ?? '').toLowerCase(), args: cleaned.slice(1) };
}

function suggest(command: string): string | null {
  // Cheap Levenshtein — good enough for "did you mean" on a 25-command registry.
  const distance = (a: string, b: string): number => {
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] =
          a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[a.length][b.length];
  };

  let best: { name: string; score: number } | null = null;
  for (const name of allCommandNames) {
    const score = distance(command, name);
    if (!best || score < best.score) best = { name, score };
  }
  return best && best.score <= 2 ? best.name : null;
}

/**
 * Execute a raw input line. Pure and synchronous — safe to call from a
 * controller or straight from the browser.
 */
export function execute(input: string): ExecResult {
  const started = Date.now();
  const { command, args } = parse(input);

  if (!command) {
    return { command, args, lines: [], tookMs: 0 };
  }

  const spec = registry.find((c) => c.name === command);

  if (!spec) {
    const hint = suggest(command);
    const lines: TermLine[] = [err(`omsh: command not found: ${command}`)];
    if (hint) lines.push(dim(`Did you mean '${hint}'?`));
    lines.push(dim("Type 'help' for the list of commands."));
    return { command, args, lines, tookMs: Date.now() - started };
  }

  const result = spec.run(args);
  const normalised: ExecResultPartial = Array.isArray(result) ? { lines: result } : result;

  return {
    command,
    args,
    lines: normalised.lines,
    action: normalised.action,
    tookMs: Date.now() - started,
  };
}

/** Longest common prefix completion for the Tab key. */
export function complete(partial: string): { completion: string; candidates: string[] } {
  const value = partial.trimStart();
  if (value.includes(' ')) {
    // Complete arguments for a few commands with known value sets.
    const { command, args } = parse(value);
    const prefix = args[args.length - 1] ?? '';
    const pools: Record<string, string[]> = {
      projects: projects.map((p) => p.id),
      experience: experience.map((e) => e.id),
      skills: skills.map((s) => s.category.toLowerCase()),
      theme: ['violet', 'toxic', 'amber', 'ice'],
      open: ['github', 'linkedin', 'email'],
      goto: ['hero', 'about', 'experience', 'projects', 'skills', 'education', 'contact'],
      man: allCommandNames,
      cat: FILESYSTEM['~'],
      ls: ['~', 'experience', 'projects'],
    };
    const pool = pools[command] ?? [];
    const candidates = pool.filter((c) => c.startsWith(prefix));
    if (candidates.length === 1) {
      const head = value.slice(0, value.length - prefix.length);
      return { completion: head + candidates[0] + ' ', candidates: [] };
    }
    return { completion: value, candidates };
  }

  const candidates = allCommandNames.filter((c) => c.startsWith(value));
  if (candidates.length === 1) return { completion: candidates[0] + ' ', candidates: [] };
  if (candidates.length > 1) {
    let common = candidates[0];
    for (const c of candidates) {
      while (!c.startsWith(common)) common = common.slice(0, -1);
    }
    return { completion: common, candidates };
  }
  return { completion: value, candidates: [] };
}

export const welcomeBanner = (): TermLine[] => [
  ...cmdBanner(),
];
