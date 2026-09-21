/**
 * Single source of truth for every piece of portfolio content.
 * The REST controllers and the terminal command registry both read from here,
 * so updating your CV means editing exactly one file.
 */

export interface Profile {
  name: string;
  handle: string;
  headline: string;
  roles: string[];
  summary: string;
  location: string;
  email: string;
  status: string;
  links: { label: string; url: string; icon: string }[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  companyUrl: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  highlights: string[];
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  period: string;
  repo: string;
  accent: 'violet' | 'cyan' | 'magenta' | 'amber';
}

export interface SkillGroup {
  category: string;
  icon: string;
  skills: { name: string; level: number }[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  grade: string;
  honours: string | null;
}

export interface StatItem {
  label: string;
  value: number;
  suffix: string;
  decimals: number;
  caption: string;
}

export const profile: Profile = {
  name: 'Omid Deldar',
  handle: 'omid',
  headline: 'Backend Developer → Security Engineer',
  roles: [
    'Backend Developer',
    'Node.js / NestJS Engineer',
    'Microservices Architect',
    'SOC & SIEM Analyst',
    'Security Engineer in the making',
  ],
  summary:
    'Backend Developer with 2+ years of experience building scalable Node.js/NestJS microservices ' +
    'and API-based systems using PostgreSQL, MongoDB and RabbitMQ. Currently expanding into security ' +
    'operations through hands-on SIEM and SOC work. Strong problem-solving skills and a focus on ' +
    'clean, maintainable architecture.',
  location: 'Gold Coast, Australia',
  email: 'omiddeldar.om@gmail.com',
  status: 'Open to backend & security engineering roles',
  links: [
    { label: 'GitHub', url: 'https://github.com/OmidDeldar', icon: 'github' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/omiddeldar', icon: 'linkedin' },
    { label: 'Email', url: 'mailto:omiddeldar.om@gmail.com', icon: 'mail' },
  ],
};

export const experience: ExperienceItem[] = [
  {
    id: 'loginet',
    role: 'Security Analyst Intern',
    company: 'Loginet Technologies',
    companyUrl: 'https://www.loginet.com.au',
    location: 'Gold Coast, Australia',
    start: '07/2026',
    end: 'Present',
    current: true,
    highlights: [
      'Built and monitored a Security Operations Center (SOC) lab on VMware ESXi, deploying Wazuh SIEM agents across Windows and Linux endpoints for real-time security event monitoring.',
      'Designed and deployed a Web Application Firewall (WAF) using Apache, ModSecurity and the OWASP Core Rule Set to protect vulnerable web applications (DVWA, bWAPP), tuning rules to reduce false positives.',
      'Conducted controlled penetration testing (SQL injection, XSS, file inclusion) using OWASP ZAP and Kali Linux to validate detection and blocking across the environment.',
      'Built custom Wazuh dashboards for login activity, alert volume and severity trends, and investigated alerts to produce Incident Reports, Daily Monitoring Reports and Weekly Summary Reports.',
      "Authored incident response documentation outlining the team's alert investigation and escalation process.",
    ],
    skills: [
      'Wazuh',
      'SIEM',
      'Incident Response',
      'Penetration Testing',
      'OWASP ZAP',
      'Vulnerability Assessment',
    ],
  },
  {
    id: 'exmodule-backend',
    role: 'Backend Developer',
    company: 'Exmodule Company',
    companyUrl: 'https://www.exmodule.ir',
    location: 'Mashhad, Iran',
    start: '08/2022',
    end: '01/2025',
    current: false,
    highlights: [
      'Developed and maintained backend services using Node.js and NestJS, supporting 2,000+ active users and improving API response reliability.',
      'Designed and implemented databases for storing and retrieving data.',
      'Set up web2 and web3 authentication systems.',
      'Developed microservice-based backend features and integrated RabbitMQ for service communication.',
      'Used Socket.IO/WebSocket to support real-time application features.',
      'Implemented role and level-based authorization.',
    ],
    skills: [
      'Node.js',
      'Microservices',
      'TypeORM',
      'WebSocket',
      'Docker',
      'PostgreSQL',
      'RabbitMQ',
      'MongoDB',
      'Kubernetes',
    ],
  },
  {
    id: 'exmodule-rnd',
    role: 'R&D Apprentice',
    company: 'Exmodule Company',
    companyUrl: 'https://www.exmodule.ir',
    location: 'Mashhad, Iran',
    start: '09/2021',
    end: '01/2022',
    current: false,
    highlights: [
      'Researched emerging backend technologies and evaluated their potential use in internal projects.',
      'Assisted with API testing, data collection and prototype development using Node.js and JavaScript.',
      'Participated in technical discussions and contributed ideas for improving system design.',
      'Tested experimental features and documented results for the development team.',
    ],
    skills: ['Node.js', 'R&D', 'Linux', 'API', 'Redis', 'JavaScript', 'TypeScript', 'SQL'],
  },
];

export const projects: Project[] = [
  {
    id: 'tetris',
    name: 'Tetris',
    tagline: 'Modern JavaFX Tetris with online multiplayer',
    description:
      'A modern take on Tetris built in JavaFX with full single-player, two-player and online support, including networked game sessions and a polished game loop.',
    stack: ['Java', 'JavaFX', 'Sockets'],
    period: '07/2025 – 11/2025',
    repo: 'https://github.com/OmidDeldar',
    accent: 'violet',
  },
  {
    id: 'devwrite',
    name: 'DevWrite',
    tagline: 'Browser code editor with run & save',
    description:
      'A code editor with syntax highlighting, language selection and save/run functionality, backed by a NestJS execution service and a React front end.',
    stack: ['React', 'NestJS', 'TypeScript'],
    period: '02/2024 – 04/2024',
    repo: 'https://github.com/OmidDeldar',
    accent: 'cyan',
  },
  {
    id: 'price-plex',
    name: 'Price Plex',
    tagline: 'Crypto price aggregation across exchanges',
    description:
      'A microservices architecture designed to integrate cryptocurrency prices across various exchanges, normalising feeds behind a single API with message-based service communication.',
    stack: ['NestJS', 'Microservices', 'RabbitMQ'],
    period: '04/2023 – 07/2023',
    repo: 'https://github.com/OmidDeldar',
    accent: 'magenta',
  },
  {
    id: 'smart-feeder',
    name: 'Smart Feeder',
    tagline: 'IoT pet feeder with a web dashboard',
    description:
      'A smart pet feeder powered by an ESP8266 microcontroller and servo motor, automating scheduled feeding with remote monitoring and adjustment through a web interface.',
    stack: ['ESP8266', 'C++', 'JavaScript'],
    period: '10/2023 – 12/2023',
    repo: 'https://github.com/OmidDeldar',
    accent: 'amber',
  },
  {
    id: 'digit-recognizer',
    name: 'Handwritten Digit Recognizer',
    tagline: 'Real-time MNIST inference from a webcam',
    description:
      'Real-time handwritten digit recognition: captures digits via webcam, processes the images against the MNIST dataset and predicts the digit on the fly.',
    stack: ['Python', 'Machine Learning', 'OpenCV'],
    period: '12/2023 – 01/2024',
    repo: 'https://github.com/OmidDeldar',
    accent: 'cyan',
  },
];

export const skills: SkillGroup[] = [
  {
    category: 'Languages',
    icon: 'code',
    skills: [
      { name: 'TypeScript', level: 95 },
      { name: 'JavaScript', level: 95 },
      { name: 'Python', level: 78 },
      { name: 'Java', level: 74 },
      { name: 'C#', level: 68 },
      { name: 'C++', level: 65 },
    ],
  },
  {
    category: 'Backend',
    icon: 'server',
    skills: [
      { name: 'Node.js', level: 95 },
      { name: 'NestJS', level: 93 },
      { name: 'REST APIs', level: 92 },
      { name: 'Microservices', level: 88 },
      { name: 'WebSocket / Socket.IO', level: 85 },
      { name: 'GraphQL', level: 70 },
    ],
  },
  {
    category: 'Databases',
    icon: 'database',
    skills: [
      { name: 'PostgreSQL', level: 90 },
      { name: 'MongoDB', level: 85 },
      { name: 'Redis', level: 80 },
      { name: 'TypeORM', level: 88 },
    ],
  },
  {
    category: 'DevOps & Tools',
    icon: 'terminal',
    skills: [
      { name: 'Docker', level: 87 },
      { name: 'Linux', level: 88 },
      { name: 'Git', level: 92 },
      { name: 'RabbitMQ', level: 84 },
      { name: 'Kubernetes', level: 70 },
      { name: 'Swagger', level: 85 },
    ],
  },
  {
    category: 'Security',
    icon: 'shield',
    skills: [
      { name: 'Wazuh / SIEM', level: 82 },
      { name: 'SOC Operations', level: 78 },
      { name: 'WAF (ModSecurity / OWASP CRS)', level: 80 },
      { name: 'OWASP ZAP', level: 78 },
      { name: 'Kali Linux', level: 75 },
      { name: 'Incident Response', level: 76 },
    ],
  },
  {
    category: 'Frontend',
    icon: 'layout',
    skills: [
      { name: 'React', level: 82 },
      { name: 'TypeScript (UI)', level: 85 },
      { name: 'HTML / CSS', level: 84 },
    ],
  },
];

export const education: EducationItem[] = [
  {
    id: 'griffith',
    degree: "Master's degree in Information Technology",
    institution: 'Griffith University',
    location: 'Gold Coast, Australia',
    start: 'Mar 2025',
    end: 'Nov 2026',
    grade: 'GPA 6.5 / 7',
    honours: 'Griffith Award for Academic Excellence — Top 5% of students',
  },
  {
    id: 'iau',
    degree: "Bachelor's degree in Professional Computer Engineering — Software",
    institution: 'Islamic Azad University (IAU)',
    location: 'Mashhad, Iran',
    start: 'Sep 2022',
    end: 'Jul 2024',
    grade: 'GPA 18.30 / 20',
    honours: 'Ranked among the top 10 students in field',
  },
  {
    id: 'sadjad',
    degree: "Associate's degree in Computer Software Engineering",
    institution: 'Sadjad University of Technology',
    location: 'Mashhad, Iran',
    start: 'Sep 2019',
    end: 'Feb 2022',
    grade: 'GPA 16.96 / 20',
    honours: null,
  },
];

export const stats: StatItem[] = [
  { label: 'Years building backends', value: 2, suffix: '+', decimals: 0, caption: 'Node.js & NestJS in production' },
  { label: 'Active users served', value: 2000, suffix: '+', decimals: 0, caption: 'On systems I built and maintained' },
  { label: 'Masters GPA', value: 6.5, suffix: '/7', decimals: 1, caption: 'Top 5% — Griffith University' },
  { label: 'Shipped projects', value: 5, suffix: '', decimals: 0, caption: 'From IoT to microservices' },
];

export const expertise: { label: string; items: string[] }[] = [
  { label: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'C#', 'C++', 'Java'] },
  { label: 'Backend', items: ['Node.js', 'NestJS', 'REST APIs', 'WebSocket', 'Socket.IO', 'Microservices'] },
  { label: 'Databases', items: ['PostgreSQL', 'MongoDB', 'Redis', 'SQL'] },
  { label: 'DevOps & Tools', items: ['Docker', 'Kubernetes', 'Git', 'RabbitMQ', 'Linux', 'Swagger', 'GraphQL'] },
  { label: 'Security', items: ['Wazuh', 'SIEM', 'SOC', 'WAF', 'OWASP ZAP', 'Kali Linux'] },
  { label: 'Frontend', items: ['React', 'JavaScript', 'TypeScript'] },
  { label: 'AI-Assisted Development', items: ['Claude Code', 'Claude', 'ChatGPT', 'Debugging', 'Testing', 'Documentation'] },
  { label: 'Other', items: ['R&D', 'API Design', 'Authentication & Authorization'] },
];
