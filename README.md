# Academic AI Lab

**Domain:** https://academicailab.com  
**Cloudflare Pages:** `academic-ai-lab`  
**GitHub:** `Dr-SherBaz/academic-ai-lab`  
**Deployment:** Auto-deploy from `main` branch via Cloudflare Pages

WhatsApp-first managed academic, research, AI, and digital-workflow support platform. Static HTML/CSS/JS frontend with Cloudflare Pages Functions scaffolding and Decap CMS for public content management.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Hosting | Cloudflare Pages (CDN, auto-deploy from GitHub) |
| Frontend | Plain HTML, CSS (custom properties), Vanilla JS |
| Functions | Cloudflare Pages Functions (ES modules) |
| Content CMS | Decap CMS (Git-based, `/admin`) |
| Content Build | Node.js script (`scripts/build-content.js`) |
| Database (future) | Cloudflare D1 (SQLite) |
| File Storage (future) | Cloudflare R2 (S3-compatible) |
| Chat | Tawk.to (`index.html`) |
| Analytics | None (privacy-first, no GA or 3rd-party trackers) |
| Fonts | Inter (body), Fraunces (display) — Google Fonts |

---

## Directory Structure

```
/
├── index.html                     # Homepage
├── services.html                  # Service pathways
├── submit-task.html               # Task intake form
├── order-access.html              # Magic-link request form
├── join-experts.html              # Expert network application
├── resources.html                 # Dynamic resources listing (JS-fetched index)
├── feedback.html                  # Verified feedback form
├── privacy-security-ethics.html   # Privacy & ethics page
├── guide-thesis-proposal-correction.html  # Standalone guide page
├── styles.css                     # Global stylesheet (2059 lines)
├── script.js                      # Global JavaScript (312 lines)
├── favicon.ico                    # Favicon
│
├── _headers                       # Cloudflare security headers
├── _redirects                     # Cloudflare redirect rules
├── package.json                   # Build scripts
├── .env.example                   # Environment variable template
├── .gitignore
│
├── assets/
│   ├── academic-ai-lab-mark.webp           # Logo mark (favicon)
│   ├── academic-ai-lab-mark-light.webp     # Logo mark (light variant)
│   ├── academic-ai-lab-mark.png            # PNG fallback
│   ├── academic-ai-lab-logo-square.webp    # Square logo
│   ├── academic-ai-lab-logo-square.png
│   ├── academic-ai-lab-logo-wide.webp      # Wide/horizontal logo
│   ├── academic-ai-lab-logo-wide.png
│   └── academic-ai-lab-wordmark.webp       # Wordmark only
│
├── admin/
│   ├── index.html                 # Decap CMS entry point (CDN-loaded)
│   └── config.yml                 # CMS collections & backend config
│
├── content/
│   ├── blog/                      # Markdown source for Insights & Guides
│   ├── templates/                 # Markdown source for Templates & Downloads
│   ├── workshops/                 # Markdown source for Workshop Announcements
│   └── case-notes/                # Markdown source for Case Notes
│
├── scripts/
│   └── build-content.js           # Markdown → HTML build pipeline
│
├── functions/
│   ├── _shared.js                 # Shared utilities (JSON responses, tokens, validation)
│   └── api/
│       ├── submit-task.js         # POST /api/submit-task
│       ├── request-magic-link.js  # POST /api/request-magic-link
│       ├── order-status.js        # GET /api/order-status
│       ├── upload-file.js         # POST /api/upload-file
│       ├── join-expert-network.js # POST /api/join-expert-network
│       ├── feedback.js            # POST /api/feedback
│       ├── create-price-estimate.js # POST /api/create-price-estimate
│       ├── whatsapp-webhook.js    # GET/POST /api/whatsapp-webhook
│       └── whatsapp/
│           └── send-template.js   # POST /api/whatsapp/send-template
│
├── content-output (generated):
│   ├── blog/                      # Generated HTML pages + index.json
│   ├── templates/                 # Generated HTML pages + index.json
│   ├── workshops/                 # Generated HTML pages + index.json
│   └── case-notes/                # Generated HTML pages + index.json
│
├── data/
│   └── blog-index.json            # Master content index (consumed by resources.html)
│
├── docs/
│   └── manual-r2-rclone-sync.md   # R2 → local PC sync workflow
│
├── resources/                     # (Empty — reserved for future static resources)
│
└── _backup_before_redesign/       # Pre-redesign backup (not deployed)
```

---

## Frontend Pages

### Core Pages

| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` or `index.html` | Hero, stats strip, service pathways, workflow, pricing, FAQ, CTA |
| Services | `/services.html` | 6 service wings with descriptions and CTAs |
| Submit Task | `/submit-task.html` | Task intake form (name, email, WhatsApp, category, files, description) |
| Order Access | `/order-access.html` | Magic-link request by email/WhatsApp + Order ID |
| Join Network | `/join-experts.html` | Expert application form (expertise, qualifications, rates) |
| Resources | `/resources.html` | Dynamic content listing with collection filters |
| Feedback | `/feedback.html` | Post-delivery feedback form |
| Privacy & Ethics | `/privacy-security-ethics.html` | Privacy, security, and ethics policy |
| Thesis Guide | `/guide-thesis-proposal-correction.html` | Standalone guide page |

### Homepage Sections (in order)

1. **Header** — Brand, nav, desktop CTA, mobile hamburger drawer
2. **Hero** — Headline, tagline, CTA buttons, order preview card, metrics
3. **Stats Strip** — Animated counters (50+ PhD-Level Experts, 15+ Domains, 200+ Projects, 95% Satisfaction)
4. **Service Pathways** — 4 pathway cards linking to services.html anchors
5. **Delivery Workflow** — 6-stage process visual
6. **Trust Principles** — 4 commitment cards (Expert Validation, Confidential Files, Transparent Pricing, Quality Verified)
7. **Common Tasks** — Tag cloud of frequent request types
8. **Academic Advisory** — Dark section with demo chat bubbles and CTA
9. **Pricing Model** — 3-tier pricing cards (Fixed, Estimated, Expert Review)
10. **FAQ** — Expandable details sections
11. **About** — Lab description with credentials
12. **Resources** — Links to guide, templates, workshops
13. **Expert Network CTA** — Apply link
14. **Final CTA** — Bottom call-to-action
15. **Footer** — 4-column grid with links, copyright, social icons
16. **Floating Actions** — Share and Back-to-top buttons (right side, above Tawk.to)
17. **Tawk.to Chat** — Live chat widget (bottom-right)

### JavaScript Features (`script.js`)

1. Mobile drawer toggle (hamburger menu)
2. Mobile drawer auto-close on resize
3. Smooth scroll-to-top (floating button visibility)
4. Site share API (navigator.share with fallback)
5. **Stat counter** — IntersectionObserver-triggered animated count-up with `data-count` and `data-suffix` support
6. Smooth scroll for anchor links
7. Form handler — Intercepts `data-api-form` forms, sends JSON POST to the API endpoint, displays response

### CSS Architecture (`styles.css`)

- Custom properties for colors, spacing, typography (`:root` section)
- Dark navy/white/gold/stone palette
- Inter + Fraunces font stack
- Responsive grid system (`.card-grid.col-2`, `.col-3`, etc.)
- Utility classes (`.section-light`, `.section-dark`, `.section-white`, `.section-gradient`, `.section-padding`, etc.)
- Components: hero, page-hero, cards, stats-strip, workflow steps, trust grid, FAQ, chat bubbles, forms, footer, floating buttons
- Mobile-first with media queries at bottom

---

## Cloudflare Pages Functions (Scaffolds)

All functions are ES modules in `functions/api/`. They return JSON responses with scaffold data — no real persistence.

### Shared Utilities (`functions/_shared.js`)

| Export | Purpose |
|--------|---------|
| `json(data, status)` | JSON response helper |
| `readJson(request)` | Parse request body safely |
| `makeOrderId(date)` | Generate `AAL-YYYY-XXXX` order IDs |
| `makeToken()` | Generate 32-byte hex token |
| `hashToken(token)` | SHA-256 hex digest |
| `validateRequired(body, fields)` | Return missing field names |
| `validateUpload({filename, size})` | Extension/size validation |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/submit-task` | POST | Accept task intake, return order ID |
| `/api/request-magic-link` | POST | Accept contact + order ID, return token placeholder |
| `/api/order-status` | GET | Return mock order status |
| `/api/upload-file` | POST | Validate upload metadata (no R2 yet) |
| `/api/join-expert-network` | POST | Accept expert application |
| `/api/feedback` | POST | Accept feedback (no D1 yet) |
| `/api/create-price-estimate` | POST | Accept task description, return mock estimate |
| `/api/whatsapp-webhook` | GET | Webhook verification for WhatsApp Cloud API |
| `/api/whatsapp-webhook` | POST | Receive incoming WhatsApp messages |
| `/api/whatsapp/send-template` | POST | Edge function to send WhatsApp template messages |

To run locally:
```bash
npx wrangler pages dev .
```

---

## Content Management (Decap CMS)

### Two Methods

**Method A — Git Folder (no auth needed, works now):**
1. Create/edit a `.md` file in `content/blog/`, `content/templates/`, `content/workshops/`, or `content/case-notes/`
2. Set `status: published` in frontmatter when ready
3. Run `node scripts/build-content.js`
4. Commit and push — Cloudflare Pages redeploys

**Method B — Decap CMS Web UI (requires GitHub OAuth):**
1. Visit `/admin` on the live site
2. Authenticate via GitHub OAuth (must configure an OAuth provider first — see Decap CMS docs for `netlify-cms-github-oauth-provider`)
3. Create/edit posts through the visual editor
4. Publish — changes commit to GitHub automatically

### CMS Collections (`admin/config.yml`)

| Collection | Folder | Fields |
|-----------|--------|--------|
| Insights & Guides | `content/blog/` | title, slug, date, category, tags, excerpt, featured_image, body, CTA, status |
| Templates & Downloads | `content/templates/` | title, slug, date, category, excerpt, file_label, download_url, body, CTA, status |
| Workshop Announcements | `content/workshops/` | title, slug, date, workshop_date, mode, audience, excerpt, body, registration CTA, status |
| Case Notes / Work Samples | `content/case-notes/` | title, slug, date, service_type, client_type, problem_summary, solution_summary, outcome_summary, body, CTA, status |

### Security Boundaries

- Decap CMS manages **public website content only**
- Client order data, uploaded files, payment info, tokens, and secrets must never pass through Decap CMS
- The `assets/uploads/` media folder is for public images only

---

## Build Pipeline

```bash
# Install dependencies (none required — pure Node.js)
npm install

# Build content: Markdown → HTML
npm run build:content

# Alias (same command)
npm run dev:content
```

The build script (`scripts/build-content.js`):
- Scans `content/*/` for `.md` files
- Parses YAML frontmatter (custom parser, no dependencies)
- Skips drafts (`status: draft`)
- Converts Markdown body to HTML
- Wraps in a full page template with header, nav, footer, Tawk.to, and `script.js`
- Generates `{collection}/{slug}.html`
- Writes `{collection}/index.json` (per-collection)
- Writes `data/blog-index.json` (master index, consumed by `resources.html`)

Currently no build step runs automatically on Cloudflare Pages. Run the command before committing, or configure a Pages build command: `npm run build:content`.

---

## Deployment

1. Push to `main` branch on GitHub
2. Cloudflare Pages auto-deploys (connected via GitHub integration)
3. Domain `academicailab.com` served via Cloudflare DNS

### Build Settings (Cloudflare Pages)

| Setting | Value |
|---------|-------|
| Build command | (none currently — static HTML) |
| Build output directory | `/` (root) |
| Root directory | `/` |

---

## Environment Variables

Configure in Cloudflare Pages → `academic-ai-lab` → Settings → Environment variables.

```env
# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_BUSINESS_ACCOUNT_ID=

# Payment (future)
PAYONEER_PAYMENT_LINK=
LOCAL_PAYMENT_INSTRUCTIONS=
```

### Future Cloudflare Bindings

These are configured in the Cloudflare dashboard (not in this repo):

```env
# D1 Database
DB=AAL_D1_DATABASE

# R2 Bucket
R2_BUCKET=AAL_PRIVATE_STORAGE
```

See `.env.example` for the template.

---

## Security

### HTTP Headers (`_headers`)

```http
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### Assets & Admin

- `/admin` has `<meta name="robots" content="noindex, nofollow">`
- No secrets or credentials are committed
- `.env` and `.env.*` files (except `.env.example`) are gitignored
- R2 bucket must remain private (signed URLs only)
- No Google Analytics or 3rd-party trackers

---

## Chat Widget

Tawk.to live chat is embedded in all main pages before `</body>`.

**Widget configuration (set in Tawk.to dashboard):**
- Widget name: Academic AI Lab Front Desk
- Welcome message and suggested replies
- Pre-chat form: Name, Email, WhatsApp, Service needed, Deadline, Short description
- Canned replies for common topics (submit task, supervisor comments, data analysis, etc.)

---

## Future Architecture

### Cloudflare D1 Database (planned tables)

| Table | Purpose |
|-------|---------|
| `orders` | Order records with status, pricing, assignment |
| `clients` | Client profiles and contact info |
| `magic_tokens` | Authentication tokens with expiry |
| `file_uploads` | File metadata pointing to R2 paths |
| `payments` | Payment records and proof links |
| `status_logs` | Order status change audit trail |
| `expert_applications` | Expert network applications |
| `feedback` | Verified client feedback |
| `pricing_estimates` | Generated price estimates |

### Cloudflare R2 Bucket (planned structure)

```
client-uploads/{order_id}/
deliveries/{order_id}/
payment-proof/{order_id}/
```

R2 must remain private. Use signed/temporary URLs for upload and delivery.

### Payment Model

- Quote-first: client submits task → admin reviews → quote issued
- Advance payment required before work starts
- Balance payment before final delivery
- Payoneer for international clients
- Local Pakistani payment options (manual)

### WhatsApp Integration

- WhatsApp Cloud API webhook for incoming messages
- Edge function for sending template messages
- Future: WhatsApp as primary front-desk communication channel
- No client secrets or credentials in the codebase

---

## Payment Model

The site supports the model at content and scaffold level only:

- Quote-first
- Advance payment before work starts
- Balance payment before final delivery
- Payoneer/payment links for international clients
- Local Pakistani payment options can remain manual

No checkout is implemented yet.

---

## Activation Checklist

Before enabling production backend behavior:

- [ ] Configure D1 bindings and run schema migrations
- [ ] Configure private R2 bucket and signed upload/delivery URLs
- [ ] Add WhatsApp credentials in Cloudflare environment settings
- [ ] Add payment instructions or payment provider links
- [ ] Add admin authentication and private admin views (separate from Decap CMS)
- [ ] Review security headers, retention policies, and privacy policy
- [ ] Configure GitHub OAuth for Decap CMS browser editing
- [ ] Remove scaffold-only responses from functions when real backends are connected
