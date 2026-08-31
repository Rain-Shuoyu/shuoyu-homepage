import type { IconLink } from '../lib/link-icon';

/* A teaser video or figure shown above the write-up.
   Self-host these: put the file in public/media/ and reference it as
   "/media/<file>". Hotlinking a video from another site is fragile —
   it can move, get rate-limited, or block cross-origin requests. */
/* 'first' marks equal contribution / co-first authorship, 'corresponding'
   the corresponding author. An author can hold both. */
export type AuthorRole = 'first' | 'corresponding';

export type Author = {
  name: string;
  roles?: AuthorRole[];
};

export type ProjectMedia = {
  kind: 'video' | 'image';
  src: string;
  /* Describes the content for anyone who cannot see it. Required. */
  alt: string;
  /* Videos only: still frame shown before playback starts. */
  poster?: string;
  /* Intrinsic pixel size. Drives the frame's aspect ratio, so a 4:3
     clip is letterboxed rather than cropped to a fixed 16:9, and
     reserves height before the file loads so nothing below it jumps. */
  width: number;
  height: number;
};

/* Extra material shown only on a research project's own page at
   /research/<slug>. Every field is optional: the page renders from the
   base Project fields alone, and each section appears once filled in.

   `intro` describes the project itself — what it is, what problem it
   addresses, roughly how it works. It is deliberately not a list of
   personal contributions.

     detail: {
       venueFull: 'IEEE International Conference on ... (ICRA), 2026',
       media: {
         kind: 'video',
         src: '/media/omnidexgrasp.mp4',
         poster: '/media/omnidexgrasp.jpg',
         alt: 'A robot hand grasping a series of household objects.',
       },
       intro: [
         'What the project is and the problem it addresses.',
         'How the approach works, in plain terms.',
       ],
       links: [{ label: 'Paper (PDF)', href: 'https://...' }],
     }
*/
export type ProjectDetail = {
  /* Acronym spelled out, e.g. "IEEE International Conference on ...". */
  venueFull?: string;
  /* Short first-person summary of Shuoyu's confirmed contribution. */
  contribution?: string;
  /* Full author list in publication order. Roles carry the meaning;
     the symbols and the legend are derived from them, because the three
     source pages disagree on notation (one uses † for equal
     contribution, another uses * for it) and the site should be
     internally consistent. */
  authors?: Author[];
  /* Verbatim BibTeX entry, shown in a copyable block. */
  bibtex?: string;
  media?: ProjectMedia;
  /* One string per paragraph. */
  intro?: string[];
  /* Extra links beyond the project page, which comes from `href`.
     Each gets an icon inferred from its href and label; set `icon` to
     override — see LinkIconName in ../lib/link-icon. */
  links?: IconLink[];
};

export type Project = {
  slug: string;
  name: string;
  section: 'research' | 'lab';
  meta: string;
  description: string;
  tags: string[];
  /* Canonical external page. Research cards link to the internal
     detail page instead; the detail page links out to this. */
  href: string;
  detail?: ProjectDetail;
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
    detail: {
      venueFull: 'IEEE International Conference on Robotics and Automation (ICRA), 2026',
      contribution:
        'I contributed to implementing parts of the tooling, evaluating model performance, and filming the project videos.',
      /* Page marks Wei and Luo † (equal contribution) and Zheng *
         (corresponding). */
      authors: [
        { name: 'Yi-Lin Wei', roles: ['first'] },
        { name: 'Zhexi Luo', roles: ['first'] },
        { name: 'Yuhao Lin' },
        { name: 'Mu Lin' },
        { name: 'Zhizhao Liang' },
        { name: 'Shuoyu Chen' },
        { name: 'Wei-Shi Zheng', roles: ['corresponding'] },
      ],
      media: {
        kind: 'video',
        src: '/media/omnidexgrasp.mp4',
        poster: '/media/omnidexgrasp.jpg',
        alt: 'A dexterous robot hand grasping a series of household objects, adjusting its fingers as it makes contact.',
        width: 960,
        height: 720,
      },
      bibtex: `@article{wei2025omnidexgrasp,
  title={OmniDexGrasp: Generalizable Dexterous Grasping via Foundation Model and Force Feedback},
  author={Yi-Lin Wei and Zhexi Luo and Yuhao Lin and Mu Lin and Zhizhao Liang and Shuoyu Chen and Wei-Shi Zheng},
  journal={arXiv preprint arXiv:2510.23119},
  year={2025},
}`,
      intro: [
        'OmniDexGrasp is a unified framework for generalizable dexterous grasping, driven entirely by grasp demonstrations that foundation generative models produce. It requires no robot data and no additional training.',
        'Instead of training a dedicated network to predict grasp poses, it aims for omni-ability across user prompts, embodiments, scenes, and tasks. Six functional settings are covered: semantic grasping, region and point grasping, cluttered scenes, one-shot demonstration grasping, human–robot handover, and fragile objects — taking language, visual prompts, or demonstration images as input.',
        'The framework runs in three stages. A generative model synthesizes a human grasp image from the instruction and the initial scene. A human-image-to-robot-action module then reconstructs the 3D hand–object interaction using only foundation visual models, retargets the human grasp onto the robot hand, and aligns it with the object’s real-world 6D pose. Finally, a force-sensing adaptive strategy executes the grasp, adjusting finger motions according to force feedback.',
      ],
      links: [
        { label: 'Paper (PDF)', href: 'https://arxiv.org/pdf/2510.23119' },
        { label: 'arXiv', href: 'https://arxiv.org/abs/2510.23119' },
        { label: 'Code', href: 'https://github.com/iSEE-Laboratory/OmniDexGrasp' },
      ],
    },
  },
  {
    slug: 'bidexgrasp',
    name: 'BiDexGrasp',
    section: 'research',
    meta: 'Research Project',
    description: 'Coordinated bimanual dexterous grasping across objects with diverse geometries and sizes.',
    tags: ['Bimanual Manipulation', 'Data Generation'],
    href: 'https://frenkielm.github.io/BiDexGrasp.github.io/',
    detail: {
      contribution: 'I handled real-robot deployment and experimental evaluation.',
      /* From the project page, which lists 13 authors — three more than
         its own BibTeX entry, and in a different order. The page is the
         fuller list and the one carrying the symbols, so it is used
         here; the BibTeX below stays verbatim as published. */
      authors: [
        { name: 'Mu Lin', roles: ['first'] },
        { name: 'Yi-Lin Wei', roles: ['first'] },
        { name: 'Jiaxuan Chen' },
        { name: 'Yuhao Lin' },
        { name: 'Shuoyu Chen' },
        { name: 'Zhizhao Liang' },
        { name: 'Jiangran Lyu' },
        { name: 'Jiayi Chen' },
        { name: 'Xiaoyi Fan' },
        { name: 'Chengyi Xing' },
        { name: 'Yansong Tang' },
        { name: 'He Wang' },
        { name: 'Wei-Shi Zheng', roles: ['corresponding'] },
      ],
      media: {
        kind: 'video',
        src: '/media/bidexgrasp.mp4',
        poster: '/media/bidexgrasp.jpg',
        alt: 'Two robot hands coordinating to grasp and lift objects of varying size and geometry.',
        width: 1280,
        height: 720,
      },
      bibtex: `@misc{lin2026bidexgraspcoordinatedbimanualdexterous,
  title={BiDexGrasp: Coordinated Bimanual Dexterous Grasps across Object Geometries and Sizes},
  author={Mu Lin and Yi-Lin Wei and Jiaxuan Chen and Yuhao Lin and Shuoyu Chen and Jiangran Lyu and Jiayi Chen and Yansong Tang and He Wang and Wei-Shi Zheng},
  year={2026},
  eprint={2604.06589},
  archivePrefix={arXiv},
  primaryClass={cs.RO},
  url={https://arxiv.org/abs/2604.06589},
}`,
      intro: [
        'BiDexGrasp pairs a large-scale bimanual dexterous grasp dataset with a generation model. Two-handed dexterous grasping is promising but constrained by the lack of comprehensive datasets and powerful generation models, compounded by the difficulty of high-dimensional bimanual grasping.',
        'The dataset is built by a bimanual grasp synthesis pipeline that efficiently annotates physically feasible data, using a two-stage strategy: region-based grasp initialization followed by decoupled force-closure grasp optimization. It spans 6,351 objects from 30 to 80 cm, with 9.7 million annotated grasps.',
        'The generation framework is bimanual-coordinated and geometry-size-adaptive, resting on a bimanual coordination module and a geometry-size-adaptive grasp generation strategy, so it produces coordinated, high-quality grasps on objects not seen during training. Results are validated in both simulation and the real world.',
      ],
      links: [{ label: 'arXiv', href: 'https://arxiv.org/abs/2604.06589' }],
    },
  },
  {
    slug: 'dynamicmanip',
    name: 'DynamicManip',
    section: 'research',
    meta: 'Research Project',
    description: 'A static-to-dynamic augmentation pipeline and adaptive policy for responsive dynamic manipulation.',
    tags: ['Dynamic Manipulation', 'Adaptive Policy'],
    href: 'https://liaohr9.github.io/DynamicManip/',
    detail: {
      contribution:
        'I worked on simulation setup, model training, and model performance evaluation.',
      /* Page marks Liao, Wang and Chen * (equal contribution) and names
         no corresponding author, so none is claimed here. */
      authors: [
        { name: 'Haoran Liao', roles: ['first'] },
        { name: 'Pengyue Wang', roles: ['first'] },
        { name: 'Shuoyu Chen', roles: ['first'] },
        { name: 'Kehan Cheng' },
        { name: 'Xuhang Chen' },
        { name: 'Yuhao Lin' },
        { name: 'Mu Lin' },
        { name: 'Zhizhao Liang' },
        { name: 'Xiaoyi Fan' },
        { name: 'Chengyi Xing' },
        { name: 'Dan Niu' },
        { name: 'Yi-Lin Wei' },
        { name: 'Wei-Shi Zheng' },
      ],
      media: {
        kind: 'video',
        src: '/media/dynamicmanip.mp4',
        poster: '/media/dynamicmanip.jpg',
        alt: 'A robot arm tracking and manipulating a moving object, correcting mid-motion as the target shifts.',
        width: 1280,
        height: 720,
      },
      bibtex: `@inproceedings{liao2026dynamicmanip,
  title     = {DynamicManip: Enabling Dynamic Manipulation from a Single Static Demonstration},
  author    = {Haoran Liao and Pengyue Wang and Shuoyu Chen and Kehan Cheng and Xuhang Chen and Yuhao Lin and Mu Lin and Zhizhao Liang and Xiaoyi Fan and Chengyi Xing and Dan Niu and Yi-Lin Wei and Wei-Shi Zheng},
  year      = {2026}
}`,
      intro: [
        'DynamicManip enables dynamic manipulation from a single static demonstration: it augments varied dynamic data from one static real-world demo, then trains a dynamic-aware policy for generalized execution.',
        'Robots need dynamic manipulation for moving objects and fast corrections, but two obstacles stand in the way. The combinatorial complexity of dynamic scenarios leads to substantial data requirements, and rapid variations in dynamics require real-time, accurate policy execution.',
        'The static-to-dynamic augmentation pipeline synthesizes diverse dynamic demonstrations from one static demo — localizing object and target, reconstructing geometry by aligning object meshes to observed point clouds, extracting action-based keyframes to split the source motion into reusable phases, then editing trajectories to vary object motion and anchors. The dynamic-aware policy uses stage labels from the augmented data as auxiliary supervision, and at deployment adjusts its inference frequency according to task dynamics for low-latency closed-loop control. The work also contributes a dynamic task manipulation benchmark extending RoboTwin 2.0.',
      ],
    },
  },
];

/* How many side projects the home page lists. Exported so LabList and
   the content tests read the same number — a test comparing against a
   hardcoded copy would pass while the page silently dropped an entry. */
export const LAB_LIMIT = 3;

export const labProjects: Project[] = [
  {
    slug: 'deep-sneak',
    name: 'DeepSneak',
    section: 'lab',
    meta: 'Plugin · JavaScript',
    description: 'A DeepSeek Harness plugin that pauses video playback when an agent needs attention.',
    tags: ['Agent Tools', 'Browser Automation'],
    href: 'https://github.com/Rain-Shuoyu/dsh-client-deep-sneak',
    detail: {
      intro: [
        'A floating mini-window Bilibili player for DeepSeek Harness. It auto-pauses and reminds you when the agent needs you, then resumes at the exact position when you are back — the premise being that DeepSeek does the work while you watch.',
        'It carries a real Bilibili recommendation feed without login, a native player with seek and speed control, danmaku synced to playback, a comment section, keyword video search, light and dark themes, and slack-time statistics for today, the week, and all time. There is nothing to configure; preferences persist to localStorage and no data is uploaded.',
        'On the host side, same-origin proxy routes serve JSON for recommendations and comments, gzip-decompressed danmaku XML, and the video stream with Range support so seeking works. Agent linkage reads session snapshots to sense state — approval, question, done, blocked — and triggers the pause, overlay, and toast. Exact resume comes from calling pause() on the video element while keeping it mounted, so progress is never lost, then play() to continue in place.',
      ],
    },
  },
  {
    slug: 'truth-forge',
    name: 'TruthForge',
    section: 'lab',
    meta: 'Course project · Python',
    description: 'An open-source multi-agent fact-checking system built around traceable evidence and bounded retrieval.',
    tags: ['Multi-agent Systems', 'Retrieval'],
    href: 'https://github.com/Rain-Shuoyu/TruthForge-Public',
    detail: {
      intro: [
        'A multi-agent fact-checking system for internet rumours, built as the term project for an artificial intelligence course. It uses LangGraph to orchestrate claim decomposition, RAG-first evidence retrieval, source and timeline review, red-team re-checking, citation validation, and traceable report generation.',
        'The pipeline is deliberately RAG-first: if a manifest-backed local snapshot already supports a claim, the evidence agent is right not to call any web tool. Live search through Tavily runs only when the agent decides it is needed. Retrieved web content cannot support a conclusion until its main text has been extracted, saved as a local snapshot, registered in the evidence registry, and passed the citation guard — a search summary alone is never enough for a confident verdict.',
        'Responsibilities are split across separate agents so a judgment can be traced back through the steps that produced it: claim decomposition, evidence gathering and admission, source credibility, contradiction detection, timeline review, verdict, red team, and explanation. A Streamlit workbench runs the same graph interactively, and JSONL run logs record which tools fired on each pass.',
      ],
    },
  },
  {
    slug: 'polygo',
    name: 'PolyGo',
    section: 'lab',
    meta: 'Course project · Python',
    description: 'A collaborative travel-planning app for availability, meeting-point recommendations, and itineraries.',
    tags: ['Web Applications', 'AI Assistance'],
    href: 'https://github.com/Rain-Shuoyu/PolyGo-Public',
    detail: {
      intro: [
        'PolyGo turns a group trip from a long back-and-forth in a chat thread into a clear, participatory, executable shared plan. Built as the term project for a software engineering course, it helps every member state their availability, departure point, and travel preferences, then turns that scattered information into transparent recommendations and a joint decision.',
        'Organising a trip is rarely just about where to go. Times are hard to coordinate when people reply piecemeal and the organiser keeps re-tallying. Meeting points are hard to keep fair when members set out from different places. Even once an area is settled, restaurants and routes can start the discussion over. And if the recommendation is unexplainable, the result is hard for the group to accept.',
        'The app runs six connected steps: create a plan, invite members by code or link, submit preferences, receive recommendations, confirm together by vote, and settle an itinerary. Recommendations weigh how many people can attend each slot alongside departure points and transport modes, and are presented with their reasoning rather than as a verdict — the vote and the editable itinerary keep the final decision with the group. The backend is FastAPI over PocketBase, and the AI travel assistant degrades to stable rule-based suggestions when external services are unavailable, so the workflow never stalls.',
      ],
      links: [{ label: 'Project showcase', href: 'https://rain-shuoyu.github.io/PolyGo-Public/' }],
    },
  },
];
