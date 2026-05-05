/**
 * build-content.js — Academic AI Lab Content Builder
 *
 * Reads Markdown files from content/ folders, parses frontmatter,
 * generates HTML pages, and updates index JSON files.
 *
 * Usage: node scripts/build-content.js
 */

const fs = require('fs');
const path = require('path');

// ── Simple YAML frontmatter parser ──────────────────────────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const yamlStr = match[1];
  const content = match[2];
  const data = {};
  const lines = yamlStr.split('\n');
  let currentKey = null;
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kvMatch = line.match(/^(\w[\w_-]*)\s*:\s*(.*)/);
    const listMatch = line.match(/^\s+-\s+(.*)/);

    if (listMatch && currentKey) {
      if (!data[currentKey]) data[currentKey] = [];
      data[currentKey].push(listMatch[1].trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    if (kvMatch) {
      currentKey = kvMatch[1];
      let value = kvMatch[2].trim();
      if (value === '') {
        // Could be a multiline string
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.match(/^\s\s\S/)) {
          currentKey = kvMatch[1];
          data[currentKey] = '';
          continue;
        }
      }
      if (value === '>' || value === '|' || value === '>-' || value === '|-' || value === '>+' || value === '|+') {
        // Multiline block scalar (>, >-, >+, |, |-, |+)
        const blockLines = [];
        let j = i + 1;
        while (j < lines.length && lines[j].match(/^\s{2,}/)) {
          blockLines.push(lines[j].trim());
          j++;
        }
        i = j - 1;
        data[currentKey] = blockLines.join(' ');
        continue;
      }
      if (value === 'true') { data[currentKey] = true; continue; }
      if (value === 'false') { data[currentKey] = false; continue; }
      // Remove quotes
      data[currentKey] = value.replace(/^["']|["']$/g, '');
      continue;
    }

    // Continuation of multiline
    if (currentKey && line.match(/^\s{2,}\S/)) {
      data[currentKey] = (data[currentKey] ? data[currentKey] + ' ' : '') + line.trim();
    }
  }
  return { data, content };
}

// ── Simple Markdown to HTML converter ──────────────────────
function markdownToHTML(md) {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (any line not starting with <)
    .replace(/^(?!<[a-z/]|$)(.+)$/gm, '<p>$1</p>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>\n$1</ul>\n')
    // Tables
    .replace(/\|(.+)\|\n\|[-| :]+\|\n(\|.+\|\n?)+/g, (match) => {
      const rows = match.split('\n').filter(r => r.startsWith('|') && !r.match(/^[-| :]+$/));
      const headerCells = rows[0].split('|').filter(c => c.trim());
      const dataRows = rows.slice(1);
      let table = '<table><thead><tr>';
      headerCells.forEach(c => { table += `<th>${c.trim()}</th>`; });
      table += '</tr></thead><tbody>';
      dataRows.forEach(row => {
        const cells = row.split('|').filter(c => c.trim());
        table += '<tr>';
        cells.forEach(c => { table += `<td>${c.trim()}</td>`; });
        table += '</tr>';
      });
      table += '</tbody></table>';
      return table;
    });

  return html;
}

// ── Escape HTML ─────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Page template (matches site design) ─────────────────────
function pageTemplate({ title, description, category, date, body, ctaLabel, ctaUrl, ogType }) {
  const displayDate = date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : '';
  const ogTypeVal = ogType || 'article';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — Academic AI Lab</title>
  <meta name="description" content="${esc(description || title)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description || title)}">
  <meta property="og:type" content="${esc(ogTypeVal)}">
  <meta name="theme-color" content="#0B1120">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/academic-ai-lab-mark.webp" type="image/webp">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header">
    <a class="brand" href="/index.html" aria-label="Academic AI Lab — Home">
      <img src="/assets/academic-ai-lab-mark-light.webp" alt="" class="brand-mark" width="38" height="38">
      <span class="brand-text">
        <span class="brand-name">Academic AI Lab</span>
        <span class="brand-tagline">Expert-Reviewed Academic &amp; Digital Support</span>
      </span>
    </a>
    <nav class="site-nav" aria-label="Primary navigation">
      <a href="/services.html">Services</a>
      <a href="/resources.html">Resources</a>
      <a href="/join-experts.html">Join Network</a>
      <a href="/order-access.html">Order Access</a>
    </nav>
    <div class="header-actions">
      <a class="btn btn-primary btn-sm" href="/submit-task.html">Submit Task</a>
    </div>
    <button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false">
      <svg viewBox="0 0 24 24">
        <line x1="4" y1="7" x2="20" y2="7"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
        <line x1="4" y1="17" x2="20" y2="17"/>
      </svg>
    </button>
  </header>

  <div class="nav-overlay" aria-hidden="true"></div>
  <aside class="mobile-drawer" aria-label="Navigation menu">
    <div class="drawer-header">
      <span class="brand-name" style="color:#fff;font-family:var(--font-display);font-size:1.1rem;">Academic AI Lab</span>
      <button class="drawer-close" type="button" aria-label="Close menu">✕</button>
    </div>
    <nav class="drawer-nav">
      <a href="/index.html">Home</a>
      <a href="/services.html">Services</a>
      <a href="/resources.html">Resources &amp; Guides</a>
      <a href="/join-experts.html">Join Expert Network</a>
      <a href="/order-access.html">Order Access</a>
      <a href="/feedback.html">Verified Feedback</a>
      <a href="/privacy-security-ethics.html">Privacy &amp; Ethics</a>
      <a class="btn btn-primary" href="/submit-task.html">Submit Task</a>
    </nav>
  </aside>

  <main id="main-content">
    <section class="page-hero">
      <div class="container">
        <p class="label light">${esc(category || '')}</p>
        <h1>${esc(title)}</h1>
        ${displayDate ? `<p class="hero-sub">${displayDate}</p>` : ''}
      </div>
    </section>

    <section class="section-white section-padding">
      <div class="container">
        <div class="content-body" style="max-width:800px;margin:0 auto;line-height:1.8;font-size:1.05rem;">
          ${body}
        </div>
        ${ctaLabel ? `
        <div style="text-align:center;margin-top:var(--space-12);">
          <a class="btn btn-primary" href="${esc(ctaUrl)}">${esc(ctaLabel)} <span class="arrow">→</span></a>
        </div>` : ''}
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="brand-name" style="color:#fff;">Academic AI Lab</span>
          <p>Expert-reviewed academic, research, AI, and digital support with transparent quoting and secure delivery.</p>
        </div>
        <div class="footer-col">
          <h4>Services</h4>
          <a href="/services.html#research">Research &amp; Academic</a>
          <a href="/services.html#digital-studio">Digital Studio</a>
          <a href="/services.html#training">Training &amp; Workshops</a>
          <a href="/services.html#ai-tools">AI Tools &amp; Authorial Editing</a>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <a href="/resources.html">Insights &amp; Guides</a>
          <a href="/order-access.html">Order Access</a>
          <a href="/feedback.html">Verified Feedback</a>
        </div>
        <div class="footer-col">
          <h4>Connect</h4>
          <a href="/join-experts.html">Join Expert Network</a>
          <a href="/privacy-security-ethics.html">Privacy, Security &amp; Ethics</a>
          <a href="/index.html#academic-advisory">Academic Advisory</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Academic AI Lab. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="/script.js"></script>
</body>
</html>`;
}

// ── Collection config ───────────────────────────────────────
const collections = [
  {
    name: 'blog',
    folder: 'content/blog',
    outputDir: 'blog',
    label: 'Insights & Guides',
    ctaLabelKey: 'service_cta_label',
    ctaUrlKey: 'service_cta_url',
  },
  {
    name: 'templates',
    folder: 'content/templates',
    outputDir: 'templates',
    label: 'Templates & Downloads',
    ctaLabelKey: 'service_cta_label',
    ctaUrlKey: 'service_cta_url',
  },
  {
    name: 'workshops',
    folder: 'content/workshops',
    outputDir: 'workshops',
    label: 'Workshop Announcements',
    ctaLabelKey: 'registration_cta_label',
    ctaUrlKey: 'registration_cta_url',
  },
  {
    name: 'case_notes',
    folder: 'content/case-notes',
    outputDir: 'case-notes',
    label: 'Case Notes / Work Samples',
    ctaLabelKey: 'service_cta_label',
    ctaUrlKey: 'service_cta_url',
  },
];

// ── Main build ──────────────────────────────────────────────
const allItems = [];

collections.forEach(col => {
  const contentDir = path.join(__dirname, '..', col.folder);
  const outputDir = path.join(__dirname, '..', col.outputDir);

  if (!fs.existsSync(contentDir)) {
    console.log(`  Skipping ${col.name}: content folder not found (${col.folder})`);
    return;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  const collectionItems = [];

  files.forEach(file => {
    const filePath = path.join(contentDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = parseFrontmatter(raw);

    if (data.status !== 'published') {
      console.log(`  Skipping draft: ${col.name}/${file}`);
      return;
    }

    const slug = data.slug || file.replace('.md', '');
    const htmlBody = markdownToHTML(content);
    const ctaLabel = data[col.ctaLabelKey] || '';
    const ctaUrl = data[col.ctaUrlKey] || '';

    const description = data.excerpt || data.problem_summary || '';

    const html = pageTemplate({
      title: data.title || slug,
      description: description,
      category: data.category || data.service_type || col.label,
      date: data.date,
      body: htmlBody,
      ctaLabel: ctaLabel,
      ctaUrl: ctaUrl,
    });

    const outPath = path.join(outputDir, `${slug}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`  Generated: ${col.outputDir}/${slug}.html`);

    const item = {
      collection: col.name,
      title: data.title || slug,
      slug: slug,
      date: data.date || '',
      category: data.category || data.service_type || '',
      tags: data.tags || [],
      excerpt: description,
      featured_image: data.featured_image || '',
      service_cta_label: ctaLabel,
      service_cta_url: ctaUrl,
      // Workshop-specific
      workshop_date: data.workshop_date || '',
      mode: data.mode || '',
      audience: data.audience || '',
      registration_cta_label: data.registration_cta_label || '',
      registration_cta_url: data.registration_cta_url || '',
      // Templates-specific
      file_label: data.file_label || '',
      download_url: data.download_url || '',
      // Case-notes-specific
      service_type: data.service_type || '',
      client_type: data.client_type || '',
      problem_summary: data.problem_summary || '',
      solution_summary: data.solution_summary || '',
      outcome_summary: data.outcome_summary || '',
    };

    collectionItems.push(item);
    allItems.push(item);
  });

  // Sort collection items newest first
  collectionItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Write collection index
  const indexPath = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(collectionItems, null, 2), 'utf-8');
  console.log(`  Index: ${col.outputDir}/index.json (${collectionItems.length} items)`);
});

// Sort all items newest first
allItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

// Write master index
const masterIndexPath = path.join(__dirname, '..', 'data', 'blog-index.json');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(masterIndexPath, JSON.stringify(allItems, null, 2), 'utf-8');
console.log(`\n  Master index: data/blog-index.json (${allItems.length} total items)`);

console.log('\n✅ Content build complete.');
