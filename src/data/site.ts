export const site = {
  name: 'Shuoyu Chen',
  handle: 'SHUOYU.CHEN',
  role: 'Undergraduate researcher',
  affiliation: 'Sun Yat-sen University · iSEE Lab',
  location: 'Guangzhou, China',
  expectedGraduation: '2028',
  /* Structured counterparts to the two display strings above. The
     display strings stay human-readable; these carry the parts that
     JSON-LD needs as separate entities, so nothing has to parse a
     "A · B" string back apart at build time. */
  university: 'Sun Yat-sen University',
  school: 'School of Computer Science',
  lab: 'iSEE Lab',
  city: 'Guangzhou',
  countryCode: 'CN',
  github: 'https://github.com/Rain-Shuoyu',
  blog: 'https://blog.shuoyu.me/',
  /* Points at an on-request page, not a file. The CV is deliberately not
     published yet; nothing under public/ should carry personal detail
     ahead of application season. */
  cv: '/cv',
  email: 'shuoyu_chen@qq.com',
  description: 'Grounding intelligence in the physical world.',
  news: [
    {
      date: '2026.09',
      type: 'Research',
      title: 'BiDexGrasp accepted by CoRL 2026',
      description: 'Our work on coordinated bimanual dexterous grasping was accepted by CoRL 2026.',
    },
    {
      date: '2026.05',
      type: 'Research',
      title: 'DynamicManip submitted to NeurIPS 2026',
      description: 'Submitted our work on dynamic manipulation from a single static demonstration.',
    },
    {
      date: '2026.01',
      type: 'Research',
      title: 'OmniDexGrasp accepted by ICRA 2026',
      description: 'Our work on generalizable dexterous grasping was accepted by ICRA 2026.',
    },
    {
      date: '2025.07',
      type: 'Milestone',
      title: 'Joined the iSEE Lab',
      description: 'Started conducting undergraduate research at the iSEE Laboratory of Sun Yat-sen University.',
    },
  ],
  about: [
    'I am Shuoyu Chen, an undergraduate student at the School of Computer Science, Sun Yat-sen University, majoring in Computer Science and Technology.',
    'Currently, I am conducting undergraduate research at the iSEE Laboratory of Sun Yat-sen University.',
  ],
  researchFocus: [
    'Embodied Intelligence',
    'Robotic Dexterous Manipulation',
    'Computer Vision',
  ],
  navigation: [
    { label: 'About', href: '#about' },
    { label: 'News', href: '#news' },
    { label: 'Research', href: '#research' },
    { label: 'Others', href: '#others' },
    { label: 'Blog', href: 'https://blog.shuoyu.me/' },
  ],
} as const;
