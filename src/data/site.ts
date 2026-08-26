export const site = {
  name: 'Shuoyu Chen',
  handle: 'SHUOYU.CHEN',
  role: 'Undergraduate researcher',
  affiliation: 'Sun Yat-sen University · iSEE Lab',
  location: 'Guangzhou, China',
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
  /* Points at an on-request page, not a file. The CV is deliberately not
     published yet; nothing under public/ should carry personal detail
     ahead of application season. */
  cv: '/cv',
  email: 'shuoyu_chen@qq.com',
  description: 'Grounding intelligence in the physical world.',
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
    { label: 'Research', href: '#research' },
    { label: 'Others', href: '#others' },
  ],
} as const;
