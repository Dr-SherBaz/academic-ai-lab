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
| Database | Cloudflare D1 (SQLite) — schema in `migrations/0001_initial.sql` and `migrations/0002_blog_engagement.sql` |
| File Storage | Cloudflare R2 (S3-compatible) — `aal-private-storage` |
| Admin Dashboard | `/admin/dashboard.html` — order management, feedback, experts |
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
├── wrangler.toml                   # Cloudflare Pages + D1 + R2 config
├── migrations/
│   └── 0001_initial.sql            # D1 schema (orders, tokens, experts, etc.)
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
│   ├── dashboard.html             # Admin dashboard (D1-backed order mgmt)
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
│   ├── _shared.js                 # Shared utilities (JSON, tokens, validation, D1 helpers, CORS)
│   ├── api/
│   │   ├── submit-task.js         # POST /api/submit-task → D1 insert
│   │   ├── request-magic-link.js  # POST /api/request-magic-link → D1 token insert
│   │   ├── order-status.js        # GET /api/order-status → D1 lookup by token
│   │   ├── upload-file.js         # POST /api/upload-file → R2 signed URL + D1 record
│   │   ├── join-expert-network.js # POST /api/join-expert-network → D1 insert
│   │   ├── feedback.js            # POST /api/feedback → D1 insert
│   │   ├── create-price-estimate.js # POST /api/create-price-estimate
│   │   ├── whatsapp-webhook.js    # GET/POST /api/whatsapp-webhook → D1 message log
│   │   ├── whatsapp/
│   │   │   └── send-template.js   # POST /api/whatsapp/send-template → WhatsApp Cloud API call
│   │   └── admin/
│   │   ├── blog/
│   │   │   ├── comment.js      # POST /api/blog/comment/:slug → submit pending comment
│   │   │   ├── comments.js     # GET /api/blog/comments/:slug → approved comments
│   │   │   ├── view.js         # GET+POST /api/blog/view/:slug → read count
│   │   │   ├── vote.js         # POST /api/blog/vote/:slug → like/dislike
│   │   │   └── share.js        # POST /api/blog/share/:slug → share count
│   │   └── admin/
│   │       └── [[catchall]].js    # GET/POST /api/admin/* → dashboard backend (orders, feedback, experts, blog comments)
│
├── content-output (generated):
│ ├── blog/                      # Generated HTML pages + index.json + blog images
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

## Cloudflare Pages Functions

All functions are ES modules. They use D1 bindings (`env.DB`) for persistence and R2 bindings (`env.R2`) for signed upload URLs.

### Shared Utilities (`functions/_shared.js`)

| Export | Purpose |
|--------|---------|
| `json(data, status, extraHeaders)` | JSON response helper with optional CORS headers |
| `readJson(request)` | Parse request body safely |
| `makeOrderId(date)` | Generate `AAL-YYYY-XXXX` order IDs |
| `makeToken()` | Generate 32-byte hex token |
| `hashToken(token)` | SHA-256 hex digest |
| `validateRequired(body, fields)` | Return missing field names |
| `validateUpload({filename, size})` | Extension/size validation |
| `insertOrder(db, data)` | Insert order into D1, return order_id |
| `getOrderByToken(db, token_hash)` | Lookup order by valid magic-link token |
| `recordStatusHistory(db, order_id, status)` | Log status changes to `order_status_history` |
| `corsHeaders(origin)` | Standard CORS headers |
| `corsPreflight(request)` | Handle OPTIONS preflight |

### Blog Engagement Endpoints

| Endpoint | Method | D1 | Purpose |
|----------|--------|-----|---------|
| `/api/blog/comment/:slug` | POST | D1 | Submit a comment (status: pending) |
| `/api/blog/comments/:slug` | GET | D1 | Get approved comments for a blog |
| `/api/blog/view/:slug` | GET | D1 | Get read count |
| `/api/blog/view/:slug` | POST | D1 | Increment read count |
| `/api/blog/vote/:slug` | POST | D1 | Like or dislike a blog |
| `/api/blog/share/:slug` | POST | D1 | Increment share count |
| `/api/admin/blog-comments` | GET | D1 | List all blog comments (admin) |
| `/api/admin/blog-comments/:id/approve` | POST | D1 | Approve a pending comment |
| `/api/admin/blog-comments/:id/reject` | POST | D1 | Reject a pending comment |

### API Endpoints

| Endpoint | Method | D1/R2 | Purpose |
|----------|--------|-------|---------|
| `/api/submit-task` | POST | D1 | Insert order → return order_id |
| `/api/request-magic-link` | POST | D1 | Generate + store magic-link token |
| `/api/order-status` | GET | D1 | Lookup order by valid token hash |
| `/api/upload-file` | POST | D1+R2 | Validate file, generate signed R2 upload URL |
| `/api/join-expert-network` | POST | D1 | Insert expert application |
| `/api/feedback` | POST | D1 | Insert feedback (pending approval) |
| `/api/create-price-estimate` | POST | D1 | Price estimate with optional template lookup |
| `/api/whatsapp-webhook` | GET | — | WhatsApp webhook verification |
| `/api/whatsapp-webhook` | POST | D1 | Log incoming messages + statuses |
| `/api/whatsapp/send-template` | POST | — | Send WhatsApp template via Cloud API |
| `/api/admin/*` | GET/POST | D1 | Dashboard: orders, feedback, experts, stats |

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
- Skips non-published items (`status !== 'published'`)
- Converts Markdown body to HTML (links, images, blockquotes, callout boxes, headings with slug IDs, TOC extraction, ordered/unordered lists)
- Wraps in a full page template with header, nav, footer, Tawk.to, and `script.js`
- Computes reading time, word count, and extracts Table of Contents
- Injects related posts filtered by category
- Generates `{collection}/{slug}.html`
- Writes `{collection}/index.json` (per-collection)
- Writes `data/blog-index.json` (master index, consumed by `resources.html`)

Cloudflare Pages build command: `npm run build` → runs content build automatically on deploy.

---

## Deployment

1. Push to `main` branch on GitHub
2. Cloudflare Pages auto-deploys (connected via GitHub integration)
3. Domain `academicailab.com` served via Cloudflare DNS

### Build Settings (Cloudflare Pages)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `.` (root) |
| Root directory | `/` |
| Node.js version | 18 or later |

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

## Database (D1)

Schema in `migrations/0001_initial.sql` and `migrations/0002_blog_engagement.sql`. Tables:

| Table | Purpose |
|-------|---------|
| `orders` | Order records with status, payment, expert assignment |
| `magic_tokens` | Magic-link auth tokens with expiry |
| `uploads` | File metadata pointing to R2 paths |
| `order_status_history` | Status change audit trail |
| `experts` | Expert network applications |
| `feedback` | Verified client feedback |
| `incoming_messages` | WhatsApp message log |
| `message_status` | WhatsApp delivery receipts |
| `price_templates` | Cached price estimate templates |
| `blog_comments` | Anonymous blog comments with moderation (pending/approved/rejected) |
| `blog_metrics` | Blog engagement stats (reads, likes, dislikes, shares per slug) |

### Apply migrations

```bash
npx wrangler d1 migrations apply aal-d1 --local    # test locally
npx wrangler d1 migrations apply aal-d1 --remote   # deploy
```

### Blog Engagement Setup

**Requires:** D1 database (`aal-d1`) with `DB` binding configured in Cloudflare Pages dashboard.

1. Create the D1 database (if not already done):
   ```bash
   npx wrangler d1 create aal-d1
   ```
   Copy the returned `database_id` into `wrangler.toml`.

2. Apply the blog engagement migration:
   ```bash
   npx wrangler d1 migrations apply aal-d1 --remote
   ```

3. Bind D1 in Cloudflare Pages dashboard:
   - Go to Cloudflare Dashboard → Pages → `academic-ai-lab` → Settings → Functions → D1 Database Bindings
   - Variable name: `DB`
   - D1 Database: `aal-d1`

4. The blog page at `/blog/supervisor-comments-thesis-correction.html` includes:
   - **Read counter:** records one view per session
   - **Like/Dislike buttons:** one vote per visitor (stored in localStorage)
   - **Share button:** uses Web Share API with clipboard fallback
   - **Comment form:** anonymous, with honeypot spam protection, character limits
   - Comments are stored with `status: 'pending'` by default

5. **Moderation workflow:**
   - Visit `/admin/dashboard.html` → "Blog Comments" tab
   - Pending comments appear with Approve/Reject buttons
   - Only approved comments are shown publicly
   - Alternatively, query D1 directly via the Cloudflare Dashboard:
     ```sql
     -- View pending comments
     SELECT * FROM blog_comments WHERE status = 'pending' ORDER BY created_at DESC;

     -- Approve a comment
     UPDATE blog_comments SET status = 'approved', approved_at = datetime('now') WHERE id = ?;

     -- Reject a comment
     UPDATE blog_comments SET status = 'rejected' WHERE id = ?;
     ```

## File Storage (R2)

Bucket: `aal-private-storage`

Structure:
```
client-uploads/{order_id}/{filename}     # Client uploads (signed URL)
deliveries/{order_id}/{filename}         # Expert deliveries (signed URL)
```

R2 must remain private. All access via signed URLs with expiry.

## Payment Model

- Quote-first: client submits task → admin reviews → quote issued
- Advance payment required before work starts
- Balance payment before final delivery
- Payoneer recommended for international clients
- Local Pakistani options (bank transfer, JazzCash — manual)
- `payment_status` field on orders tracks the flow (unpaid → advance_paid → balance_paid → settled)

No payment gateway API is integrated yet. Payment is handled via manual verification on the admin dashboard.

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

- [x] Schema written (`migrations/0001_initial.sql`)
- [x] Functions rewritten to use D1 bindings
- [x] R2 signed-URL upload flow implemented
- [x] WhatsApp webhook with message logging
- [x] Admin dashboard built (`/admin/dashboard.html`)
- [x] Build command set (`npm run build` → `node scripts/build-content.js`)
- [ ] **Run `wranger login`**
- [ ] **Create D1 database: `wrangler d1 create aal-d1`** → paste `database_id` into `wrangler.toml`
- [ ] **Bind D1 in Cloudflare Pages dashboard** (binding name: `DB`)
- [ ] **Run migrations: `wrangler d1 migrations apply aal-d1 --remote`**
- [ ] **Create R2 bucket: `wrangler r2 bucket create aal-private-storage`**
- [ ] **Bind R2 in Cloudflare Pages dashboard** (binding name: `R2`)
- [ ] **Set WhatsApp env vars** in Cloudflare Pages dashboard (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_BUSINESS_ACCOUNT_ID`)
- [ ] Configure webhook URL `https://academicailab.com/api/whatsapp-webhook` in Facebook App Dashboard
- [ ] Add payment instructions or payment provider links
- [ ] Add admin access control (Cloudflare Access or simple password)
- [ ] Configure GitHub OAuth for Decap CMS browser editing (optional)
- [ ] Review security headers, retention policies, and privacy policy
- [x] Blog engagement schema written (`migrations/0002_blog_engagement.sql`)
- [x] Blog engagement functions created (`functions/api/blog/*.js`)
- [x] Blog moderation added to admin dashboard
- [ ] **Run migration: `npx wrangler d1 migrations apply aal-d1 --remote`**
- [ ] **Bind D1 in Cloudflare Pages dashboard** (if not already done)
