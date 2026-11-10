# RU Insiders 2 — Complete Project Knowledge Base, MCP, Supabase & Agent Handoff

> **Purpose of this file:** Single-source-of-truth architectural & operational handoff document for any future coding agent or developer working on **RU Insiders 2**. Every URL, schema, endpoint, password flow, MCP protocol detail, AI routing architecture, and deployment constraint documented below matches the live verified codebase.

---

## 1. Repository & Deployment Overview

- **Project Name:** `ru-insiders` (`v1.0.0`)
- **Framework:** Next.js `15.x` (App Router), React `19`, TypeScript `5.6`, Tailwind CSS `3.4`, Lucide Icons
- **GitHub Repository:** `https://github.com/kmmahim123-png/RU-Insiders-2.git` (Primary branch: `main`)
- **Production Website (Vercel):** `https://ruinsider-2.vercel.app`
- **Companion Docs Already in Repo Root:**
  - `MAP_SYSTEM_SPECIFICATION.md` — Full 3-stage Interactive Map & Certificate architecture
  - `ALL_MAPS_SEPARATED_SOURCE_CODES.md` — Separated map datasets & SVG logic
  - `README.md` — Basic quickstart

---

## 2. Supabase ("সুপার বেস" / BaaS, Cloud Sync, Auth & Storage)

Supabase powers **4 distinct subsystems** across `src/lib/supabase.ts`, `src/lib/supabaseBrowser.ts`, `src/lib/db.ts`, `src/app/api/upload/route.ts`, and `src/components/NavbarAndAuth.tsx`:

### 2.1 Project Credentials & Environment Variables
- **Supabase Project Reference:** `skqtcsoovtnxxbhtracp`
- **Supabase URL:** `https://skqtcsoovtnxxbhtracp.supabase.co`
- **Supabase Dashboard Auth Providers URL:** `https://supabase.com/dashboard/project/skqtcsoovtnxxbhtracp/auth/providers`
- **Public Publishable / Anon Key (fallback in code & `.env.example`):** `sb_publishable_3WeNoqocvLIlLT0xkUZPng_CwIgpFIt`
- **Required `.env.local` / Vercel Environment Variable Names:**
  ```env
  SUPABASE_URL=https://skqtcsoovtnxxbhtracp.supabase.co
  SUPABASE_PUBLISHABLE_KEY=sb_publishable_3WeNoqocvLIlLT0xkUZPng_CwIgpFIt
  SUPABASE_SECRET_KEY=<private-service-role-key-in-vercel-and-env-local>
  SUPABASE_JWKS_URL=https://skqtcsoovtnxxbhtracp.supabase.co/auth/v1/.well-known/jwks.json
  NEXT_PUBLIC_SUPABASE_URL=https://skqtcsoovtnxxbhtracp.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_3WeNoqocvLIlLT0xkUZPng_CwIgpFIt
  ```
- **Note on `SUPABASE_SECRET_KEY` (`src/lib/supabase.ts`):** Server code checks `secretKey.length > 20 && !secretKey.includes('•') && !secretKey.includes('*')`. If unconfigured/masked, it falls back safely to the publishable anon key (which works because `app_state` and `uploads` have anon RLS policies). Never hardcode or commit `SUPABASE_SECRET_KEY` in Git!

### 2.2 Supabase SQL Schema & Storage Bucket Setup
The app stores its entire normalized JSON state in `public.app_state` (`key = 'main'`) and uploaded product/news/map photos in Supabase Storage bucket `uploads`. Run in Supabase SQL Editor if initializing a fresh project:

```sql
-- 1. Real-time Cloud Sync State Table
CREATE TABLE IF NOT EXISTS public.app_state (
    key text PRIMARY KEY,
    data jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all" ON public.app_state;
CREATE POLICY "Allow anon all" ON public.app_state FOR ALL USING (true) WITH CHECK (true);

-- 2. Public Storage Bucket for Product / News / Campus Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Allow public read uploads" ON storage.objects;
CREATE POLICY "Allow public read uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
```

### 2.3 Dual-Layer Persistence (`src/lib/db.ts`)
Vercel serverless filesystem is ephemeral (`/var/task` is read-only; `/tmp` is ephemeral). Therefore `src/lib/db.ts` implements:
1. **`runAtomic(task)`** promise queue preventing concurrent race conditions.
2. **`readDb()` order:**
   - First reads `public.app_state` row `key = 'main'` from Supabase. Passes through `ensureDbDefaults()` and caches locally.
   - Falls back to local/tmp `data/db.json` (`/tmp/data/db.json` on Vercel/Lambda, `<cwd>/data/db.json` locally), then bundled `<cwd>/data/db.json`, then `INITIAL_DB`.
3. **`writeDb(updater)` order:**
   - Writes updated `DatabaseSchema` JSON to local/tmp `db.json`.
   - Upserts `{ key: 'main', data: updated, updated_at }` into Supabase `public.app_state`.
   - **Rule for coding agents:** Whenever modifying `DatabaseSchema`, ALWAYS backfill new properties cleanly inside `ensureDbDefaults()` in `src/lib/db.ts` so older Supabase `app_state` payloads upgrade without crashing!

### 2.4 Real Google OAuth (PKCE) via Supabase Auth (`src/components/NavbarAndAuth.tsx` + `src/lib/supabaseBrowser.ts`)
- Client uses `supabaseBrowser` with `flowType: 'pkce'`, `persistSession: true`, `detectSessionInUrl: true`.
- Calling `handleGoogleSignIn()`:
  - First probes `${SUPABASE_PUBLIC_URL}/auth/v1/settings` to detect if `external.google === false`.
  - Calls `supabaseBrowser.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin, queryParams: { access_type: 'offline', prompt: 'select_account' } } })` — triggers real device/browser Gmail account selector.
  - **Google Cloud Console Authorized Redirect URI required for Supabase:**
    `https://skqtcsoovtnxxbhtracp.supabase.co/auth/v1/callback`
  - **Supabase Site URL / Redirect URLs required:** `https://ruinsider-2.vercel.app` (plus `http://localhost:3000` for dev).
  - If Google provider is disabled in Supabase, `NavbarAndAuth.tsx` shows an interactive admin setup modal displaying that exact callback URL and instructions.

---

## 3. MCP (Model Context Protocol) Server & Tools

- **Live HTTP Endpoint:** `https://ruinsider-2.vercel.app/api/mcp` (`src/app/api/mcp/route.ts`)
- **Local Endpoint:** `http://localhost:3000/api/mcp`
- **Protocol:** JSON-RPC 2.0 over HTTP (`MCP/2024-11-05`)
- **Status Discovery (`GET /api/mcp`):** Returns `{ ok, protocol, enabled, requiresToken, serverInfo, tools }`.
- **Optional Auth (`POST /api/mcp`):** Controlled dynamically from `/admin` via `db.settings.aiConfig.mcpEnabled` and `db.settings.aiConfig.mcpSecretToken`. When `mcpSecretToken` is set, callers must send `Authorization: Bearer <token>`. When blank, endpoint is openly accessible.
- **Supported JSON-RPC Methods:**
  - `initialize`
  - `tools/list`
  - `tools/call` (`params: { name, arguments }`)
  - `resources/list` -> exposes `ru-insiders://knowledge/all` and `ru-insiders://training/<docId>`
  - `resources/read` (`params: { uri }`)

### The 7 Shared Live Tools (`src/lib/aiTools.ts` — `AI_MCP_TOOLS` & `executeAiTool`)
These exact 7 tools power BOTH external MCP clients (`/api/mcp`) AND the built-in site chatbot (`/api/ai`):

1. **`check_blood_donors`**
   - Parameters: `{ bloodGroup?, hallOrDept?, onlyEligible? }`
   - Uses `calculateDonorEligibility()` from `src/lib/bloodUtils.ts` (`ELIGIBILITY_MIN_DAYS = 90`, comparing `lastDonationDate` against current date; empty `lastDonationDate` = immediately eligible).
   - Returns `{ checkedAtDate, eligibilityRuleDays: 90, requestedBloodGroup, totalMatchedCount, eligibleCount, waitingCount, groupSummary?, eligibleDonors, waitingDonors }` including direct donor `phone` (when `isPublicPhone !== false`).
2. **`find_department_and_teachers`**
   - Parameters: `{ query }`
   - Merges static `RU_DEPARTMENTS` (all 59 RU departments in `src/lib/ruAcademicData.ts`) with admin overrides in `db.departments[id]` (`teachers?: FacultyMember[]`, `seatCount`, `locationBuildingBn`, etc.).
3. **`search_products`**
   - Parameters: `{ query? }`
   - Searches `db.products` by Bangla name, category, summary, or merchant name; returns prices, stock, sizes, weight options, merchant metadata, and `/shop/<id>` link.
4. **`create_shop_order`**
   - Parameters: `{ customerName, phone, deliveryZone: 'campus' | 'city' | 'nationwide', addressDetails, items: [{ productId, selectedOption, quantity }] }`
   - Recalculates prices server-side from `db.products` (supports `weightOptions`), adds `db.settings.deliveryCharges[deliveryZone]`, creates order `RUI-...` with initial stage `status: 'intake'`, logs `statusHistory`, and increments matched merchant `totalOrders` & `totalSales`.
5. **`track_shop_order`**
   - Parameters: `{ query }` (Order ID `RUI-...` or customer phone digits)
   - Returns workflow stage label (`১. ইনটেক` -> `৫. ক্যান্সেল`), `steadfastTrackingCode`, `assignedRiderName`, and cancellation policy notice.
6. **`search_campus_and_maps`**
   - Parameters: `{ query }`
   - Searches `RU_CAMPUS_PLACES`, `RAJSHAHI_PDF_REGIONS`, `DIVISION_SPOTS`, published `db.articles`, and `db.clubs`.
7. **`get_website_training_knowledge`**
   - Parameters: `{ topic? }`
   - Returns official WhatsApp, delivery charges, categories, and custom admin `aiConfig.trainingDocs`.

---

## 4. Built-in AI System, 3-Slot Failover, Live Context & `typesafe/jev-1.14` Decision Router

Files: `src/app/api/ai/route.ts`, `src/lib/aiTools.ts`, `src/lib/jevDecision.ts`, `src/components/RuAiAssistant.tsx`, `src/components/admin/AdminAiStudioTab.tsx`.

### 4.1 Zero-Training Live Context (`buildLiveWebsiteSnapshot` in `src/lib/aiTools.ts`)
- Every `/api/ai` `CHAT` call automatically builds a compact (~1-2KB) live snapshot directly from `readDb()`: active products, blood group 90-day counts + eligible donor phones, custom department teacher contacts, published news/articles, clubs, and map spot counts.
- Result: Even if Admin leaves `trainingDocs` empty OR selects a tiny OpenRouter `:free` model lacking function calling, the AI still answers accurately from live website data.
- Custom training docs (`aiConfig.trainingDocs`) and `systemPersonaBn` remain completely optional overrides/additions.

### 4.2 Hot-Swappable 3-Slot Failover (`db.settings.aiConfig`)
Admin (`/admin` -> `🤖 AI ও MCP স্টুডিও`) can edit, reorder, enable/disable, or test all 3 API keys & model IDs anytime (saved to `db.settings.aiConfig` via `POST /api/store` `SAVE_AI_CONFIG` — never hardcoded or locked):
1. **`openrouter1`** (OpenRouter #1 Primary — default model `openrouter/free` / `google/gemini-2.0-flash-exp:free`)
2. **`openrouter2`** (OpenRouter #2 Backup — default model `meta-llama/llama-3.3-70b-instruct:free`)
3. **`gemini`** (Google Gemini Direct — `generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`, default `gemini-2.5-flash`)

- **OpenRouter All-Models Compatibility (`runOpenRouterSlot` in `src/app/api/ai/route.ts`):**
  - Sends native OpenAI `tools`. If a `:free` or custom OpenRouter model rejects `tools` with HTTP `400`/`404`/`422`, automatically retries the same slot using inline directive tags (`[[TOOL:tool_name|{"arg":"val"}]]`).
  - Admin `TEST_SLOT` calls pass `{ skipTools: true }` so any valid OpenRouter chat model passes live connection testing.
  - Admin UI also fetches live OpenRouter models (`https://openrouter.ai/api/v1/models`) so users can either pick any Free/Paid model or type any OpenRouter model ID manually.

### 4.3 TypeSafe Jev (`typesafe/jev-1.14`) Decision Pre-Router (`src/lib/jevDecision.ts`)
- Important technical fact: `typesafe/jev-1.14` is **NOT** an OpenAI chat-completions model. It uses OpenRouter's **Decisions API**:
  - Endpoint: `POST https://openrouter.ai/api/alpha/decisions`
  - Payload: `{ model: "typesafe/jev-1.14", state: "...", questions: { intent: { type: "choice", ... }, is_urgent: { type: "noul", ... }, needs_live_tools: { type: "noul", ... } } }`
  - Response: `{ answers: { intent: { choice, confidence, probabilities }, is_urgent: { noul }, ... } }`
- When enabled in `/admin` (`aiConfig.decisionRouterEnabled`), `/api/ai` runs `routeChatIntentWithJev()` before calling the chat LLM, pre-fetches the matching tool result (`check_blood_donors`, `find_department_and_teachers`, `search_products`, `track_shop_order`, or `search_campus_and_maps`), and injects it straight into the system prompt. Failures are strictly non-fatal (chat continues seamlessly).
- **Security Rule:** `GET /api/store` NEVER exposes `aiConfig` keys (`openRouterKey1`, `openRouterKey2`, `geminiApiKey`, `decisionRouterApiKey`, `mcpSecretToken`). It only returns `settings.aiStatus: { configured, mcpEnabled }`.

---

## 5. Authentication, Roles & Seeded Credentials

### 5.1 Role Detection Endpoint (`POST /api/store` -> `VERIFY_PASSWORD`)
Single login input at `/admin` detects caller role dynamically against `db`:
1. **`SUPER_ADMIN`**: matches `db.settings.superAdminPassword` (initial seed in `src/lib/db.ts`: `'ru-admin-2026'`, editable from `/admin` -> Settings). Returns `fullDb`.
2. **`PRODUCT_MANAGER`**: matches `db.settings.productManagerPassword` (initial seed: `'ru-shop-2026'`). Redirects/unlocks Products & Orders tabs.
3. **`MERCHANT`**: matches any `db.merchants[i].password` (initial seeds: `'motihar-2026'`, `'varendra-2026'`; `/merchant` also has `MERCHANT_LOGIN` supporting phone/password & `MERCHANT_REGISTER`).
4. **`CLUB_ADMIN`**: matches any `db.clubs[i].password` (stored per club in `db.clubs`, e.g., `'rucs-2026'` etc. inside `INITIAL_DB.clubs`).

### 5.2 Important Auth / Data Security Invariants
- Never return `superAdminPassword`, `productManagerPassword`, club `password`, merchant `password` / `steadfastApiKey` / `steadfastSecretKey` / `payoutPhone`, or `aiConfig` secrets in public `GET /api/store`.
- Production values live in Supabase `public.app_state` (`key = 'main'`), NOT necessarily matching initial seed strings in `src/lib/db.ts`.
- All admin mutating actions must verify `isSuper`, `isProdMgr`, `matchedMerchant`, or `matchedClub` inside `/api/store` or `/api/steadfast`.

---

## 6. E-Commerce, Multi-Vendor Merchant Hub & 5-Stage Workflow

- **Dedicated Installable Merchant PWA (`/merchant`):**
  - Manifest: `/merchant-manifest.json` (`start_url: '/merchant'`, `scope: '/merchant'`)
  - Merchant login/registration, separate merchant inventory isolation (`merchantId`), merchant financial analytics, per-merchant **Meta Pixel ID** (`facebookPixelId`), per-merchant **Rider WhatsApp Group URL** (`deliveryWhatsAppGroupUrl`), and per-merchant **Steadfast Courier credentials** (`steadfastApiKey`, `steadfastSecretKey`).
- **Strict 5-Stage Order Workflow (`Order['status']`):**
  1. `intake` (`১. ইনটেক`) — initial stage on checkout (`/cart` `CREATE_ORDER`) or AI chat order (`create_shop_order`)
  2. `ready` (`২. অর্ডার রেডি হলো`)
  3. `with_rider` (`৩. রাইডারকে দিলাম`) — supports either internal rider WhatsApp group dispatch OR Steadfast Courier booking
  4. `delivered` (`৪. ডেলিভারড`)
  5. `cancelled` (`৫. ক্যান্সেল`) — **merchants/admins can cancel from ANY stage** with `cancellationReason` + actor log in `statusHistory`; **customers CANNOT self-cancel** (UI & AI direct them to message official WhatsApp).
- **Steadfast Courier API (`src/app/api/steadfast/route.ts`):**
  - Base URL: `https://portal.packzy.com/api/v1`
  - Credential precedence: `order`'s merchant `steadfastApiKey`/`steadfastSecretKey` -> central `db.settings.steadfastApiKey`/`steadfastSecretKey`.
  - Actions: `CREATE_ORDER` (`POST /create_order` -> auto-moves order to `'with_rider'`, saves `steadfastConsignmentId` & `steadfastTrackingCode`), `CHECK_STATUS` (`GET /status_by_trackingcode/<code >`).
- **Meta Pixel (`src/lib/metaPixel.ts` + `src/components/MetaPixelTracker.tsx`):**
  - Skips `/admin` routes. Fires app-wide `PageView` using `db.settings.defaultFacebookPixelId` and supports product/merchant-specific pixel IDs on shop/checkout pages.

---

## 7. Other Core Website Subsystems

1. **Image Uploads (`src/app/api/upload/route.ts`):**
   - 3-tier pipeline: Supabase Storage `'uploads'` public bucket -> local `public/uploads` disk -> compressed Base64 Data URL (`data:image/...;base64,...`).
   - Clients (`/admin`, `/merchant`, `/inside-ru`) run canvas image compression beforehand to stay well under Vercel's `4.5 MB` serverless payload limit.
2. **Breaking News Rich Banner (`NavbarAndAuth.tsx` + `inside-ru` + `/admin`):**
   - Cycles every 4.5s using `db.settings.breakingNewsItems` (`BreakingNewsItem[]` with thumbnail `imageUrl`, headline `title`, target `link`, `articleId`), auto-synced when admin creates/approves Breaking News articles (`APPROVE_ARTICLE`, `SAVE_ARTICLE`, `SAVE_BREAKING_NEWS_ITEM`), dispatching `window` event `ru_breaking_updated`.
3. **Blood Bank (`/blood` + `AdminBloodTab.tsx` + `src/lib/bloodUtils.ts`):**
   - Enforces exact 90-day (`3 months`) eligibility gap between `lastDonationDate` and current date; tracks `isPublicPhone`, allows self-registration & donation date updates (`REGISTER_BLOOD_DONOR`, `UPDATE_BLOOD_DONATION`, `SAVE_BLOOD_DONOR`).
4. **Academics & Faculty Directory (`/academics` + `/admin` Departments Tab):**
   - Base catalog of 59 RU departments (`RU_DEPARTMENTS` in `src/lib/ruAcademicData.ts`) combined with editable custom fields & `teachers?: FacultyMember[]` in `db.departments[deptId]`, plus verified Alumni directory (`db.alumni`).
5. **PWA Service Worker (`public/sw.js` + `PWAInstallBanner.tsx`):**
   - Handles app manifest & Chrome push/install flows cleanly.
6. **Spotlight Command (`Ctrl+K` / `Cmd+K` — `SpotlightCommand.tsx`):**
   - Global quick-search launcher triggered by keyboard shortcut or `ru_open_spotlight` window event.

---

## 8. Complete Route & API Map

### Frontend Pages (`src/app/`)
| Route | Purpose |
| :--- | :--- |
| `/` | Homepage: Hero CTA, Breaking News ticker, Campus Stories, Audio Ambience (`CampusAudioPlayer`), Embedded AI Assistant (`#ru-ai-section`), Map teaser, News, Featured Products, Academics/Blood/Clubs cards |
| `/shop` & `/shop/[id]` | Product catalog, multi-variant / weight selectors, merchant badges, cart/checkout triggers |
| `/cart` | Cart review, zone selector (`campus` ৳0, `city` ৳40, `nationwide` ৳100), COD checkout (`CREATE_ORDER`), digital cash memo |
| `/track` | Order tracking by `RUI-...` Order ID or phone number (`TRACK_ORDER`) |
| `/map` | 3-stage Interactive Explorer Map (RU Campus 42 spots + Rajshahi District 22 regions + Division 8 districts) + downloadable Tour Certificate |
| `/inside-ru` & `/inside-ru/[id]` | News, literature, fine arts, research portal with likes (`TOGGLE_LIKE`), breaking news sync, and public article submission (`SUBMIT_ARTICLE`) |
| `/academics` | 59 RU departments, seat counts, faculty teachers directory (`teachers[]`), career guidance, verified alumni submission/directory |
| `/blood` | Blood Bank with 8 blood group live 90+ day availability counters, direct phone links, donor registration & donation update modals |
| `/clubs` | Campus clubs showcase + 1-click online membership form (`APPLY_CLUB`) |
| `/merchant` | Multi-vendor Merchant Portal PWA (login/signup, own products CRUD, 5-stage order Kanban/list, Rider WhatsApp group, Steadfast Courier dispatch, Meta Pixel) |
| `/admin` | Single-password multi-role management portal: Products, Orders, Map Spots, Inside RU, Departments & Teachers, Alumni, Clubs, Merchants, Blood Bank, AI & MCP Studio, Site Settings & Supabase Sync |

### Backend APIs (`src/app/api/`)
- **`GET /api/store`**: Public store payload (`settings` sanitized + `aiStatus`, `products`, `merchants`, `mapSpots`, `clubs`, `departments`, `bloodDonors`, `articles`, `alumni`, `notifications`). Accepts `?merchantId=` & `?category=`.
- **`POST /api/store`**: Central multiplexed JSON action handler (`VERIFY_PASSWORD`, `CREATE_ORDER`, `TRACK_ORDER`, `APPLY_CLUB`, `SUBMIT_ARTICLE`, `REGISTER_ALUMNI`, `REGISTER_BLOOD_DONOR`, `UPDATE_BLOOD_DONATION`, `SUBSCRIBE_NOTIFICATION`, `TOGGLE_LIKE`, `CHECK_SUPABASE`, `MERCHANT_REGISTER`, `MERCHANT_LOGIN`, `SAVE_PRODUCT`, `DELETE_PRODUCT`, `MERCHANT_UPDATE_PROFILE`, `UPDATE_ORDER_STATUS`, `UPDATE_CLUB_APP`, `SAVE_CLUB_INFO`, `SAVE_DEPARTMENT_INFO`, `SAVE_MAP_SPOT`, `UPDATE_SETTINGS`, `SAVE_ARTICLE`, `APPROVE_ARTICLE`, `DELETE_ARTICLE`, `SAVE_BREAKING_NEWS_ITEM`, `DELETE_BREAKING_NEWS_ITEM`, `ADMIN_APPROVE_MERCHANT`, `ADMIN_UPDATE_MERCHANT`, `ADMIN_DELETE_MERCHANT`, `APPROVE_ALUMNI`, `DELETE_ALUMNI`, `SAVE_BLOOD_DONOR`, `DELETE_BLOOD_DONOR`, `SAVE_AI_CONFIG`, `SEND_BROADCAST`, `SYNC_SUPABASE`).
- **`POST /api/ai`**: Visitor `CHAT` (with live website snapshot, optional `typesafe/jev-1.14` pre-router, 3-slot OpenRouter/Gemini failover, MCP tools) + Super Admin `TEST_SLOT` & `TEST_DECISION`.
- **`GET | POST /api/mcp`**: Standard JSON-RPC 2.0 MCP HTTP server exposing all 7 tools & custom training resources.
- **`POST /api/steadfast`**: `CREATE_ORDER` and `CHECK_STATUS` proxy to Steadfast Packzy API.
- **`POST /api/upload`**: Multi-file photo processor (`files` FormData) -> Supabase `'uploads'` bucket -> local disk -> Base64 fallback.

---

## 9. Important Developer & Build Notes for Next Agents

1. **Windows Local Build Warning (`@next/swc-win32-x64-msvc`):**
   On this Windows machine, `npm run build` logs a non-fatal Win32 native SWC warning and automatically compiles via Wasm/Babel fallback cleanly (`exit code 0`). Always clear stale `.next` before production builds on Windows:
   ```powershell
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   npx tsc --noEmit
   npm run build
   ```
2. **Dark/Light Theme Override (`src/app/layout.tsx`):**
   `RootLayout` runs an inline `<script>` removing `.dark` and `localStorage.ru_theme` on mount to prevent black-on-black contrast bugs ("Kalo lakha kalo lakhar modde haria gase"). Always ensure inputs/selects have explicit `bg-white text-slate-900` inside light cards.
3. **Window Event Bus Used Across Client Components:**
   - `ru_open_cart` — opens `CartDrawer`
   - `ru_cart_updated` — syncs cart count across Navbar/drawer
   - `ru_open_spotlight` — opens `SpotlightCommand` (`Ctrl+K`)
   - `ru_open_ai` — opens floating `RuAiAssistant`
   - `ru_auth_changed` — refreshes Google OAuth session state
   - `ru_breaking_updated` — refreshes Breaking News ticker in `NavbarAndAuth`
4. **Verification Checklist Before Pushing Changes:**
   - Run `npx tsc --noEmit` -> verify exit code `0`.
   - Run clean `npm run build` -> verify exit code `0`.
   - Confirm `GET /api/store` NEVER leaks admin passwords, merchant secrets, or `aiConfig` API keys.
   - Commit & push cleanly to `origin main` (Vercel deploys automatically from `main`).
