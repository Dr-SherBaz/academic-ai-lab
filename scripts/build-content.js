const fs = require('fs');
const path = require('path');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const yamlStr = match[1];
  const content = match[2];
  const data = {};
  const lines = yamlStr.split('\n');
  let currentKey = null;

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
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.match(/^\s\s\S/)) {
          currentKey = kvMatch[1];
          data[currentKey] = '';
          continue;
        }
      }
      if (value === '>' || value === '|' || value === '>-' || value === '|-' || value === '>+' || value === '|+') {
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
      data[currentKey] = value.replace(/^["']|["']$/g, '');
      continue;
    }

    if (currentKey && line.match(/^\s{2,}\S/)) {
      data[currentKey] = (data[currentKey] ? data[currentKey] + ' ' : '') + line.trim();
    }
  }
  return { data, content };
}

function slugify(str) {
  return String(str).toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

function convertTable(mdTable) {
  const rows = mdTable.split('\n').filter(r => r.startsWith('|') && !r.match(/^[-| :]+$/));
  if (rows.length === 0) return '';
  const headerCells = rows[0].split('|').filter(c => c.trim());
  const dataRows = rows.slice(1);
  let table = '<div class="table-wrap"><table><thead><tr>';
  headerCells.forEach(c => { table += `<th>${c.trim()}</th>`; });
  table += '</tr></thead><tbody>';
  dataRows.forEach(row => {
    const cells = row.split('|').filter(c => c.trim());
    table += '<tr>';
    cells.forEach(c => { table += `<td>${c.trim()}</td>`; });
    table += '</tr>';
  });
  table += '</tbody></table></div>';
  return table;
}

function markdownToHTML(md) {
  const headings = [];

  // Protect code blocks
  const codeBlocks = [];
  md = md.replace(/```[\s\S]*?```/g, m => {
    codeBlocks.push(m);
    return `%%CB${codeBlocks.length - 1}%%`;
  });

  // Blockquotes
  md = md.replace(/^(> .+(?:\n> .+)*)$/gm, (match) => {
    const content = match.replace(/^> /gm, '');
    return `<blockquote>\n${content}\n</blockquote>`;
  });

  // Callout boxes
  md = md.replace(/:::(\w+)(?:\s+\{([^}]+)\})?\n([\s\S]*?):::/g, (_, type, title, content) => {
    const labels = { tip: 'Tip', info: 'Note', warning: 'Important', success: 'Success' };
    const icons = { tip: 'bulb', info: 'info', warning: 'alert', success: 'check' };
    return [
      `<div class="callout callout-${type}">`,
      `<strong class="callout-title" data-icon="${icons[type] || 'info'}">${title || labels[type] || 'Note'}</strong>`,
      `${content.trim()}`,
      `</div>`
    ].join('\n');
  });

  // Word count
  const wordCount = md.split(/\s+/).filter(w => w.length > 0).length;

  // Extract headings for TOC
  md.replace(/^## (.+)$/gm, (_, h) => {
    headings.push({ text: h, id: slugify(h) });
    return '';
  });

  // Headings with IDs
  md = md
    .replace(/^### (.+)$/gm, (_, h) => `<h3 id="${slugify(h)}">${h}</h3>`)
    .replace(/^## (.+)$/gm, (_, h) => `<h2 id="${slugify(h)}">${h}</h2>`)
    .replace(/^# (.+)$/gm, (_, h) => `<h1 id="${slugify(h)}">${h}</h1>`);

  // Inline formatting
  md = md
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const isExternal = url.startsWith('http') || url.startsWith('//');
    const target = isExternal ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${url}"${target}>${text}</a>`;
  });

  // Images
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

  // Horizontal rules
  md = md.replace(/^---+$/gm, '<hr>');

  // Unordered list items
  md = md.replace(/^[-*] (.+)$/gm, '<li>$1</li>');

  // Ordered list items
  md = md.replace(/^\d+\. (.+)$/gm, '<li class="ol-item">$1</li>');

  // Paragraphs (lines not starting with HTML tags and not empty)
  md = md.replace(/^(?!<[a-z\/]|$)(.+)$/gm, '<p>$1</p>');

  // Wrap consecutive <li> in <ul> (only bare <li>, not <li class="ol-item">)
  md = md.replace(/((?:<li>(?!\s)[\s\S]*?<\/li>\n?)+)/g, '<ul>\n$1</ul>\n');

  // Wrap consecutive ordered list items in <ol>
  md = md.replace(/((?:<li class="ol-item">[\s\S]*?<\/li>\n?)+)/g, (match, group1) => {
    const items = group1.replace(/ class="ol-item"/g, '');
    return '<ol>\n' + items + '</ol>\n';
  });

  // Restore code blocks
  codeBlocks.forEach((cb, i) => { md = md.replace(`%%CB${i}%%`, cb); });

  // Clean up empty paragraphs
  md = md.replace(/<p>\s*<\/p>\n?/g, '');
  md = md.replace(/\n{3,}/g, '\n\n');

  return { html: md, headings, wordCount };
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pageTemplate({ title, description, category, date, body, headings, readingTime, relatedPosts, ctaLabel, ctaUrl, ogType }) {
  const displayDate = date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : '';
  const rtText = readingTime ? `${readingTime} min read` : '';
  const ogTypeVal = ogType || 'article';

  const tocHTML = headings.length > 0 ? `
      <details class="toc" open>
        <summary class="toc-title">Contents</summary>
        <nav>
          <ul class="toc-list">
            ${headings.map(h => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('\n            ')}
          </ul>
        </nav>
      </details>` : '';

  const relatedHTML = relatedPosts && relatedPosts.length > 0 ? `
    <section class="related-posts">
      <hr class="section-divider">
      <h2>Related Resources</h2>
      <div class="card-grid col-3">
        ${relatedPosts.map(p => `
        <a class="card" href="/${p.collection === 'blog' ? 'blog' : p.collection === 'templates' ? 'templates' : p.collection === 'workshops' ? 'workshops' : 'case-notes'}/${esc(p.slug)}.html">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.excerpt || p.problem_summary || '').substring(0, 120)}${(p.excerpt || p.problem_summary || '').length > 120 ? '…' : ''}</p>
          <span class="card-link">${p.collection === 'templates' ? 'Download' : 'Read'} <span class="arrow">→</span></span>
        </a>`).join('\n        ')}
      </div>
    </section>` : '';

  const shareText = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(`https://academicailab.com/blog/${slugify(title)}.html`);

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
      <button class="drawer-close" type="button" aria-label="Close menu">\u2715</button>
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
        <div class="blog-meta">
          ${displayDate ? `<span class="blog-meta-item">${displayDate}</span>` : ''}
          ${rtText ? `<span class="blog-meta-item">${rtText}</span>` : ''}
          <span class="blog-meta-item">
            <button class="share-btn" data-share="${esc(title)}" data-url="https://academicailab.com/blog/${slugify(title)}.html" title="Share this guide">Share \u2197</button>
          </span>
        </div>
        ${description ? `<p class="hero-sub blog-excerpt">${esc(description)}</p>` : ''}
      </div>
    </section>

    <section class="section-white section-padding">
      <div class="container blog-layout">
        ${tocHTML}
        <div class="content-body">
          ${body}
        </div>
      </div>
    </section>

    ${relatedHTML}

    ${ctaLabel ? `
    <section class="cta-section">
      <div class="container">
        <h2>Ready to get started?</h2>
        <div class="cta-actions">
          <a class="btn btn-primary" href="${esc(ctaUrl)}">${esc(ctaLabel)} <span class="arrow">\u2192</span></a>
          <a class="btn btn-secondary" href="/submit-task.html">Submit a Task</a>
        </div>
      </div>
    </section>` : ''}
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
  <script>
    document.querySelector('.share-btn')?.addEventListener('click', function() {
      const title = this.dataset.share;
      const url = this.dataset.url;
      if (navigator.share) {
        navigator.share({ title: title, url: url });
      } else {
        navigator.clipboard.writeText(url).then(() => {
          const orig = this.textContent;
          this.textContent = 'Copied!';
          setTimeout(() => { this.textContent = orig; }, 2000);
        });
      }
    });
  </script>
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

  files.forEach(file => {
    const filePath = path.join(contentDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = parseFrontmatter(raw);

    if (data.status !== 'published') {
      console.log(`  Skipping draft: ${col.name}/${file}`);
      return;
    }

    const slug = data.slug || file.replace('.md', '');
    const description = data.excerpt || data.problem_summary || '';

    const item = {
      collection: col.name,
      title: data.title || slug,
      slug: slug,
      date: data.date || '',
      category: data.category || data.service_type || '',
      tags: data.tags || [],
      excerpt: description,
      featured_image: data.featured_image || '',
      service_cta_label: data.service_cta_label || '',
      service_cta_url: data.service_cta_url || '',
      workshop_date: data.workshop_date || '',
      mode: data.mode || '',
      audience: data.audience || '',
      registration_cta_label: data.registration_cta_label || '',
      registration_cta_url: data.registration_cta_url || '',
      file_label: data.file_label || '',
      download_url: data.download_url || '',
      service_type: data.service_type || '',
      client_type: data.client_type || '',
      problem_summary: data.problem_summary || '',
      solution_summary: data.solution_summary || '',
      outcome_summary: data.outcome_summary || '',
      ctaLabel: data[col.ctaLabelKey] || '',
      ctaUrl: data[col.ctaUrlKey] || '',
    };

    allItems.push(item);
  });
});

// Sort all items newest first
allItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

// Write master index
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(path.join(dataDir, 'blog-index.json'), JSON.stringify(allItems, null, 2), 'utf-8');
console.log(`\n  Master index: data/blog-index.json (${allItems.length} total items)`);

// Write collection indices and generate pages
collections.forEach(col => {
  const colItems = allItems.filter(i => i.collection === col.name);
  colItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Write collection index
  const indexPath = path.join(__dirname, '..', col.outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(colItems, null, 2), 'utf-8');
  console.log(`  Index: ${col.outputDir}/index.json (${colItems.length} items)`);

  // Generate pages
  colItems.forEach(item => {
    const filePath = path.join(__dirname, '..', col.folder, `${item.slug}.md`);
    if (!fs.existsSync(filePath)) {
      console.log(`  Warning: source file not found for ${col.name}/${item.slug}`);
      return;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = parseFrontmatter(raw);

    const { html, headings, wordCount } = markdownToHTML(content);
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    // Related posts: same category, same collection, exclude self
    const relatedPosts = allItems
      .filter(other =>
        other.slug !== item.slug &&
        other.collection === item.collection &&
        (other.category === item.category || other.category === '' || item.category === '')
      )
      .slice(0, 3);

    const htmlPage = pageTemplate({
      title: item.title,
      description: item.excerpt || item.problem_summary || '',
      category: data.category || data.service_type || col.label,
      date: item.date,
      body: html,
      headings,
      readingTime,
      relatedPosts,
      ctaLabel: item.ctaLabel,
      ctaUrl: item.ctaUrl,
    });

    const outPath = path.join(__dirname, '..', col.outputDir, `${item.slug}.html`);
    fs.writeFileSync(outPath, htmlPage, 'utf-8');
    console.log(`  Generated: ${col.outputDir}/${item.slug}.html`);
  });
});

console.log('\n\u2705 Content build complete.');
