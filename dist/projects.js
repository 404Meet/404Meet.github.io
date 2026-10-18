// Project content stays separate from the visual cards and appears only on demand.
const projects = {
  lexvault: {
    category: 'LOCAL-FIRST CONTRACT INTELLIGENCE',
    title: 'LexVault',
    summary:
      'A multi-agent contract intelligence system that turns legal PDFs and DOCX files into actionable risk analysis, with model inference running locally through Ollama.',
    highlights: [
      'Five specialized agents produce clause risk scores, market benchmarks, and a sign, negotiate, or walk-away assessment.',
      'Parallel risk scoring and benchmarking reduced total runtime by 20%.',
      'An Angular interface streams all five stages through a FastAPI WebSocket connection.',
    ],
    technologies: ['Python', 'FastAPI', 'Angular', 'Agno', 'Ollama'],
    url: 'https://github.com/404Meet/LexVault',
    link: 'Explore the repository ↗',
  },
  karya: {
    category: 'CONTEXT FOR AI DEVELOPERS',
    title: 'Karya',
    summary:
      'A C#/.NET MCP server that gives AI clients structured access to API discovery, architecture, and framework guidance.',
    highlights: [
      'Search across 1,500+ public APIs and 7,000+ OpenAPI specifications.',
      '13 tools, 7 resources, and 4 prompts delivered over stateless HTTP/SSE.',
      'A warmed in-memory cache brings API discovery latency below 10 milliseconds.',
    ],
    technologies: ['C#', '.NET', 'MCP', 'HTTP / SSE', 'OpenAPI'],
    url: 'https://github.com/404Meet/Karya',
    link: 'Explore the repository ↗',
  },
  integrations: {
    category: 'PROFESSIONAL WORK · THOMSON REUTERS',
    title: 'Tax workflow integrations',
    summary:
      'Backend and integration engineering for SurePrep’s tax preparation workflows at Thomson Reuters, from July 2022 to January 2025.',
    highlights: [
      'Built a bidirectional integration between UltraTax CS and SPBinder spanning 8,000+ fields and five tax return types.',
      'Optimized 250+ database queries, cutting W-2 processing latency by 30%.',
      'Modernized document uploads and supported deployments across Azure VMs and App Services.',
    ],
    technologies: ['C# / .NET', 'SQL Server', 'Azure', 'GitHub Actions'],
    url: 'Meet-Popat-Resume.pdf',
    link: 'Read the full experience ↗',
  },
};

const dialog = document.querySelector('#project-dialog');
let activeCard = null;

function openProject(card) {
  const project = projects[card.dataset.project];
  if (!project) return;

  activeCard = card;
  document.querySelector('#project-category').textContent = project.category;
  document.querySelector('#project-title').textContent = project.title;
  document.querySelector('#project-summary').textContent = project.summary;

  const highlights = document.querySelector('#project-highlights');
  highlights.replaceChildren(
    ...project.highlights.map((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }),
  );

  const technologies = document.querySelector('#project-technologies');
  technologies.replaceChildren(
    ...project.technologies.map((text) => {
      const item = document.createElement('span');
      item.textContent = text;
      return item;
    }),
  );

  const link = document.querySelector('#project-link');
  link.href = project.url;
  link.textContent = project.link;
  dialog.showModal();
  document.body.classList.add('dialog-open');
}

document.querySelectorAll('[data-project]').forEach((card) => {
  card.addEventListener('click', () => openProject(card));
});

dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  activeCard?.focus({ preventScroll: true });
});

// Animate only visible cards; honor reduced motion and the existing pause control.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const videos = document.querySelectorAll('.visual-project video');
let animationPaused = motionPreference.matches;
const visibleVideos = new Set();

function syncVideos() {
  videos.forEach((video) => {
    if (animationPaused || document.hidden || !visibleVideos.has(video)) video.pause();
    else
      video.play().catch(() => {
        /* The poster remains visible if autoplay is blocked. */
      });
  });
}

const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) visibleVideos.add(target);
      else visibleVideos.delete(target);
    });
    syncVideos();
  },
  { threshold: 0.05 },
);
videos.forEach((video) => videoObserver.observe(video));

document.querySelector('#motion').addEventListener('click', () => {
  animationPaused = !animationPaused;
  syncVideos();
});
motionPreference.addEventListener('change', (event) => {
  animationPaused = event.matches;
  syncVideos();
});
document.addEventListener('visibilitychange', syncVideos);
