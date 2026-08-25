export type Project = {
  slug: string;
  name: string;
  section: 'research' | 'lab';
  meta: string;
  description: string;
  tags: string[];
  href: string;
};

export const researchProjects: Project[] = [
  {
    slug: 'omnidexgrasp',
    name: 'OmniDexGrasp',
    section: 'research',
    meta: 'ICRA 2026',
    description: 'A framework for generalizable dexterous grasping that combines foundation models with force feedback.',
    tags: ['Dexterous Grasping', 'Force Feedback'],
    href: 'https://isee-laboratory.github.io/OmniDexGrasp/',
  },
  {
    slug: 'bidexgrasp',
    name: 'BiDexGrasp',
    section: 'research',
    meta: 'Research Project',
    description: 'Coordinated bimanual dexterous grasping across objects with diverse geometries and sizes.',
    tags: ['Bimanual Manipulation', 'Data Generation'],
    href: 'https://frenkielm.github.io/BiDexGrasp.github.io/',
  },
  {
    slug: 'dynamicmanip',
    name: 'DynamicManip',
    section: 'research',
    meta: 'Research Project',
    description: 'A static-to-dynamic augmentation pipeline and adaptive policy for responsive dynamic manipulation.',
    tags: ['Dynamic Manipulation', 'Adaptive Policy'],
    href: 'https://liaohr9.github.io/DynamicManip/',
  },
];

export const labProjects: Project[] = [
  {
    slug: 'deep-sneak',
    name: 'DeepSneak',
    section: 'lab',
    meta: 'Plugin · JavaScript',
    description: 'A DeepSeek Harness plugin that pauses video playback when an agent needs attention.',
    tags: ['Agent Tools', 'Browser Automation'],
    href: 'https://github.com/Rain-Shuoyu/dsh-client-deep-sneak',
  },
  {
    slug: 'truth-forge',
    name: 'TruthForge',
    section: 'lab',
    meta: 'System · Python',
    description: 'An open-source multi-agent fact-checking system built around traceable evidence and bounded retrieval.',
    tags: ['Multi-agent Systems', 'Retrieval'],
    href: 'https://github.com/Rain-Shuoyu/TruthForge-Public',
  },
  {
    slug: 'poly-go',
    name: 'PolyGo',
    section: 'lab',
    meta: 'Web App · Python',
    description: 'A collaborative travel-planning app for availability, meeting-point recommendations, and itineraries.',
    tags: ['Web Applications', 'AI Assistance'],
    href: 'https://github.com/Rain-Shuoyu/PolyGo-Public',
  },
  {
    slug: 'after-glow',
    name: 'AfterGlow',
    section: 'lab',
    meta: 'App · Swift / Python',
    description: 'A reflective journal tool with a shared Markdown diary format across macOS and terminal interfaces.',
    tags: ['Personal Tools', 'Textual UI'],
    href: 'https://github.com/Rain-Shuoyu/AfterGlow-AI-Powered-Reflective-Journal-Manager',
  },
  {
    slug: 'neural-block',
    name: 'NeuralBlock',
    section: 'lab',
    meta: 'Tool · JavaScript',
    description: 'A visual tool for designing and inspecting neural network architectures with React Flow.',
    tags: ['Visualization', 'React Flow'],
    href: 'https://github.com/Rain-Shuoyu/NeuralBlock',
  },
];
