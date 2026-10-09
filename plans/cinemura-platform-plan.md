Cinemura Premium Entertainment Platform — Implementation Plan

1. Goal and Locked Decisions
   Build Cinemura, a complete responsive front-end entertainment discovery platform with the tagline “Discover movies. Explore series. Find your next obsession.” The design will follow the written brief only, using an original premium editorial visual language rather than copying a specific reference site.

Locked product decisions:

Scope: Complete front-end experience across all requested sections and routes.
Live data: TMDB API via VITE_TMDB_READ_ACCESS_TOKEN.
Persistence: Browser localStorage for watchlist items; no accounts or backend.
Editorial/CMS content: Typed local content collections with a clean adapter boundary for future CMS replacement.
Contact: Client-side validated form that opens a prefilled email draft; no fake server submission.
Rendering: React/Vite client-rendered SPA. SEO metadata will update per route, but SSR/prerendering is intentionally out of scope because it would be an unnecessary architectural change.
Reference: No external visual reference or Figma attachment; the brief is the source of truth.
Implementation prerequisite:

Add a valid TMDB API read access token to local environment configuration as VITE_TMDB_READ_ACCESS_TOKEN. This value is necessarily visible to browser users in a static Vite application; it must be treated as a public client credential with appropriate TMDB-side restrictions. The token must never be committed. 2. Repository and Dependency Changes
The current repository is a blank React 19 + Vite 8 + Tailwind CSS v4 scaffold with no router, components, API layer, or environment variables.

Add only two runtime dependencies:

react-router for Data Mode routing and route loaders.
lucide-react for a consistent accessible icon set.
Do not add a general component library, state manager, carousel package, data-fetching package, or animation package. Use React state/context, React Router loaders, CSS transitions/keyframes, and browser scroll snap.

Expected source organization:

src/
app/
App.tsx
routes.tsx
RootLayout.tsx
RouteErrorBoundary.tsx
api/
tmdb.ts
endpoints.ts
cache.ts
mappers.ts
types.ts
components/
ui/
Button.tsx
IconButton.tsx
LinkButton.tsx
Heading.tsx
Field.tsx
Select.tsx
Dialog.tsx
Skeleton.tsx
MediaImage.tsx
layout/
Header.tsx
MobileNavigation.tsx
Footer.tsx
PageTransition.tsx
media/
MediaCard.tsx
PersonCard.tsx
HorizontalRail.tsx
HeroFeature.tsx
MetadataRow.tsx
Rating.tsx
TrailerDialog.tsx
WatchProviders.tsx
search/
SearchOverlay.tsx
SearchSuggestions.tsx
states/
LoadingState.tsx
EmptyState.tsx
ErrorState.tsx
content/
site.ts
editorial.ts
categories.ts
about.ts
context/
SearchOverlayContext.tsx
WatchlistContext.tsx
hooks/
useDebouncedValue.ts
useDocumentMetadata.ts
useMediaQuery.ts
pages/
HomePage.tsx
DiscoverPage.tsx
MediaDetailPage.tsx
PeoplePage.tsx
PersonDetailPage.tsx
SearchResultsPage.tsx
WatchlistPage.tsx
EditorialIndexPage.tsx
EditorialArticlePage.tsx
AboutPage.tsx
ContactPage.tsx
NotFoundPage.tsx
seo/
Seo.tsx
structuredData.ts
utils/
format.ts
media.ts
storage.ts
App.tsx
index.css
main.tsx
Keep src/App.tsx as the default-exported application entry component, delegating to src/app/App.tsx if needed. src/app/App.tsx will render RouterProvider as required by the routing pattern.

3. Visual System
   Because the repository contains no existing design system, establish a small local design system rather than scattering page-specific styles.

Typography
Import public Google fonts at the top of src/index.css before Tailwind:
Barlow Condensed for display headings, labels, and large metrics.
Manrope for body copy, controls, and metadata.
Display styling: uppercase, condensed, tight tracking, strong weight contrast.
Body styling: neutral, highly legible, restrained line lengths.
Semantic design tokens
Define Tailwind v4 theme variables and reusable semantic CSS tokens in src/index.css:

canvas: warm off-white page background.
ink: near-black primary background/text.
muted: warm gray secondary text/surfaces.
line: low-contrast separators.
accent: warm cinematic orange.
accent-strong: darker hover/pressed orange.
success, danger, and focus-ring semantics.
Display/body font families, editorial spacing scale, container widths, and minimal radius values.
Pages should consume semantic utility classes and UI primitives rather than arbitrary colors or one-off spacing values.

Editorial composition
Full-bleed visual moments alternating with constrained editorial columns.
Strong asymmetric grids, oversized section numbers, thin rules, offset captions, and deliberate empty space.
Mostly square or subtly rounded media; pills only for filters/status controls.
Dark immersive hero/detail sections contrasted against warm-paper content sections.
Consistent image ratios: cinematic backdrops, portrait posters, and square/portrait people imagery.
Responsive type scales using CSS clamp() through named utility classes.
Motion
Use subtle CSS-based motion only:

Hero copy stagger/reveal on first load.
Backdrop crossfade/scale with no aggressive parallax.
Rail/card image zoom and metadata shift on hover/focus.
Search and mobile navigation reveal using opacity/transform.
Route content fade/translate.
Respect prefers-reduced-motion; remove nonessential transforms and animated reveals. 4. Routing and URL Contracts
Use createBrowserRouter with a root layout, nested route content, route-level error handling, and lazy route modules for secondary pages.

Routes:

/ — homepage.
/movies — movie discovery.
/series — TV-series discovery.
/movie/:mediaId — movie detail.
/series/:mediaId — TV-series detail.
/search?q= — full search results.
/people — people directory with actors, directors, and writers sections.
/person/:personId — person detail and combined credits.
/watchlist — locally saved titles.
/editorial — article index.
/editorial/:slug — article detail.
/about — mission, values, and platform metrics.
/contact — contact details and validated form.

- — branded 404 page.
  Discovery URL parameters must be shareable and restorable:

genre
year
sort
rating
page
Search uses q and optional type (all, movie, series, person). Filter changes reset page to 1. Back/forward navigation must restore controls and results.

5. TMDB Data Layer
   Environment and request wrapper
   Create a single typed TMDB client that:

Reads import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN.
Uses bearer authorization against TMDB API v3.
Adds language and region defaults consistently.
Encodes query parameters through URLSearchParams.
Throws a typed TmdbError carrying status and a safe user message.
Supports AbortSignal for canceled navigation/search.
Never logs credentials or full authorization headers.
When the token is absent, show a designed configuration error with setup guidance instead of silently substituting fake catalog data.

Caching
Implement a small request cache in src/api/cache.ts:

Cache key: endpoint plus normalized query parameters.
In-flight promise deduplication.
Short TTL for trending/search/discovery results.
Longer TTL for genres, static configuration, and detail records.
Session-memory cache only for API responses; do not persist potentially stale API payloads to localStorage.
Failed requests are not cached.
Normalized models
Map TMDB payloads into app-facing types so UI does not branch repeatedly on raw movie/TV field names:

MediaSummary
MediaDetail
PersonSummary
PersonDetail
Credit
Video
WatchProviderRegion
PaginatedResult<T>
Normalize movie title/release_date and TV name/first_air_date into shared fields while retaining mediaType for route generation.

Endpoint usage
Homepage: trending, now playing, on the air, top rated, and selected genre discovery.
Discovery: /discover/movie and /discover/tv with URL-derived filters.
Search overlay/results: /search/multi, debounced and minimum two characters.
Detail: media endpoint with appended credits, videos, recommendations, external IDs, and watch providers where supported.
People: /person/popular, organized by known_for_department; fetch additional pages only when a section lacks enough directors/writers.
Person detail: profile plus combined credits.
Genres and API image configuration: cached shared lookups. 6. Shared Application Behavior
Header and navigation
Desktop:

Cinemura wordmark at left.
Navigation for Movies, Series, People, Editorial, and About.
Search and watchlist icon actions.
Orange “Explore” CTA leading to /movies.
Transparent over immersive heroes, becoming solid after scroll; always preserve contrast.
Mobile:

Wordmark, search action, watchlist action, and hamburger.
Full-screen navigation dialog with oversized numbered links.
Escape key closes dialogs; opening a dialog traps focus and locks body scroll; focus returns to the trigger.
Search
Full-viewport search overlay available from every route.
Autofocus input, debounced instant suggestions, grouped by movies/series/people.
Arrow-key suggestion navigation, Enter selection, Escape close.
Recent searches stored locally with a clear action.
Empty query shows trending suggestions; short queries show guidance; loading, no-result, API-error, and offline states are distinct.
“View all results” navigates to /search?q=....
Watchlist
Save/remove actions available on cards and detail heroes.
Store only stable identifiers and minimal display metadata under a versioned localStorage key.
Guard JSON parsing and storage access; gracefully recover from malformed or unavailable storage.
Watchlist page separates movies and series and includes an intentional empty state.
Announce save/remove changes through an accessible live region.
Media behavior
Central MediaImage builds TMDB image URLs and supplies responsive srcSet/sizes.
Hero image gets eager/high-priority loading; below-fold images use loading="lazy".
Missing poster/profile/backdrop uses a branded non-photographic fallback, never a broken image.
Trailer dialog creates a youtube-nocookie.com iframe only after user activation; if no playable trailer exists, omit the CTA. 7. Page-by-Page Implementation
Homepage
Hero Feature
Select a suitable current trending title with a backdrop.
Layer title, media type/year, genre, overview, rating, “View details,” and “Play trailer” actions.
Include a compact selectable featured-title strip that updates the hero without navigating.
Trending Rail
Sophisticated horizontal scroll-snap carousel with visible ordinal numbers, previous/next controls, and keyboard-scroll support.
Discovery Categories
Action, Drama, Comedy, Thriller, Documentary, and Animation editorial tiles backed by live genre results.
Story/About Split
Cinematic image, concise Cinemura mission copy, and About CTA.
Feature Grid
Discovery, trailers, cast and crew, watch providers, and watchlist capabilities.
Metrics
Large editorial numbers for searchable titles, people, categories, and discovery reach. Clearly label dynamic/catalog estimates rather than implying proprietary users.
How It Works
Four numbered steps: Discover, Explore, Compare, Save, with alternating imagery and restrained transition effects.
Editorial Preview
Latest locally authored articles and link to the editorial index.
Movies and Series Discovery
Shared DiscoverPage configured by media type.
Editorial heading and live result count.
Filter controls for genre, year, minimum rating, and sort.
Responsive poster grid with clear active filters and reset action.
Pagination with previous/next and compact page indicators.
Mobile filter drawer/dialog rather than overflowing horizontal controls.
Skeleton grid, no-results recovery suggestions, API error retry, and offline messaging.
Movie and Series Detail
Full-width backdrop with readable gradient treatment.
Poster, title, certification/runtime or episode metadata, genres, score, overview, creator/director, and action buttons.
Watchlist and trailer actions.
Cast rail and key crew list.
Watch-provider section for the selected region, grouped into stream/rent/buy where present.
Related/recommended media rail.
Route-specific JSON-LD (Movie or TVSeries).
People Directory and Detail
Directory:

Intro plus Popular Actors, Directors, and Writers sections.
Portrait cards with known-for context.
Explain that department grouping reflects TMDB profile metadata.
Detail:

Profile portrait, biography, birthplace/birthday where available, known-for department, and external links.
Combined credits organized into acting and crew work.
Handle missing biography/profile information without empty visual gaps.
Person JSON-LD.
Search Results
Query echoed in heading.
Type tabs for all, movies, series, and people.
URL-driven pagination.
Mixed-result cards remain visually distinct while sharing consistent metadata hierarchy.
Editorial
Typed local article collection containing slug, title, dek, category, author, published date, read time, hero image strategy, sections, pull quotes, and related TMDB IDs.
Index uses a lead-story magazine layout plus article grid.
Detail renders semantic article structure, share/copy-link action, related titles, and related reading.
Articles are original Cinemura copy; do not represent them as API reviews or user-generated content.
About
Cinematic masthead, mission and vision, values, editorial story split, platform capabilities, and credible catalog-oriented stats.
Include the required TMDB attribution statement and explain third-party data provenance.
Contact
Cinematic header, contact channels, editorial inquiries, partnerships, and support details.
Fields: name, email, topic, and message.
Validate required values, email format, and sensible message length; show inline errors and focus the first invalid field.
On valid submit, open a prefilled mailto: draft and show a non-misleading confirmation that the user must send it from their email client.
404
Branded “lost between frames” treatment, search action, and links back to homepage/discovery. 8. Editorial Content Architecture
Create typed content modules rather than embedding long copy in page components:

site.ts: brand, tagline, navigation, social/contact links, region, and legal copy.
editorial.ts: original articles and article metadata.
categories.ts: editorial genre/category presentation mapped to TMDB genre identifiers resolved at runtime.
about.ts: values, steps, and static platform statements.
Components consume these collections through selectors. The types and selectors form the future CMS seam; no CMS SDK or speculative abstraction is added now.

9. SEO and Metadata
   Implement a reusable Seo component/hook that updates on route changes:

Document title following Page/Title — Cinemura.
Meta description.
Canonical URL when a reliable public origin is available.
Open Graph title, description, image, and content type.
Twitter card metadata.
JSON-LD script for WebSite, SearchAction, Movie, TVSeries, Person, Article, AboutPage, and ContactPage as appropriate.
Also update .figma/make/site.json with Cinemura’s default title, description, language, and a baseline social image if available. Preserve preview-safe indexing behavior unless deployment requirements explicitly change it; route metadata can be complete even while the Figma preview remains noindex.

Because this remains a client-rendered Vite SPA, metadata is strongest for browsers/social clients that execute JavaScript. Full crawler-first SSR/prerendering is explicitly outside this front-end scope.

10. TMDB and JustWatch Compliance
    Display the approved TMDB attribution mark and the exact notice: “This product uses the TMDB API but is not endorsed or certified by TMDB.”
    Link the TMDB attribution to TMDB.
    Show attribution in the global footer and expanded legal/data-provenance copy on About.
    In every watch-provider section, display “Watch availability data provided by JustWatch” with a visible JustWatch link/mark near the data.
    Use TMDB’s provider link as the availability CTA; do not invent direct provider deep links.
    Add a footer legal note clarifying that provider availability and prices can change and should be verified with the provider.
    Use only official attribution assets and follow their current brand usage requirements during implementation.
11. Accessibility
    Semantic landmarks: header, nav, main, sections, articles, aside, and footer.
    Enable the existing Figma Make bypass-link setting and ensure main has the matching target.
    Visible focus rings on all interactive elements.
    Keyboard-operable rails, dialogs, menus, filters, and search suggestions.
    Correct dialog focus management, Escape behavior, labels, descriptions, and restored trigger focus.
    Form labels and aria-describedby error associations.
    Live regions for asynchronous search/result changes and watchlist actions.
    Decorative imagery uses empty alt text; informative posters/profile images use concise contextual alt text.
    Maintain WCAG AA text contrast, including over imagery.
    Touch targets at least 44×44 CSS pixels.
    Respect prefers-reduced-motion.
12. Performance and Resilience
    Lazy-load secondary route modules with route-level fallbacks.
    Use responsive TMDB image widths and avoid original-size images except when necessary.
    Eager-load only the current hero image; lazy-load offscreen media.
    Defer YouTube iframe creation until playback.
    Debounce search and abort stale requests.
    Deduplicate cached requests.
    Avoid layout shift by reserving known image aspect ratios.
    Render partial sections when one homepage request fails instead of failing the whole page.
    Detect offline state where useful and provide retry actions.
    Prevent all horizontal page overflow; rails contain their own intentional scrolling.
13. Error, Loading, and Empty-State Matrix
    Every API-driven surface must explicitly support:

Initial skeleton/loading.
Successful populated result.
Successful empty result with a relevant recovery CTA.
Missing API token/configuration.
Authentication/rate-limit/API server error.
Offline/network error.
Retry after failure.
Missing image or optional metadata.
Route error boundaries must distinguish 404-like missing TMDB entities from general service errors. User-facing messages should be concise and never expose raw API payloads or credentials.

14. Implementation Sequence
    Install react-router and lucide-react; establish source folders.
    Define semantic tokens, global typography, reset/base styles, and reusable UI primitives.
    Add Data Mode router, root layout, global contexts, error boundary, header, dialogs, and footer.
    Build typed TMDB client, cache, mappers, image utilities, and missing-token/error handling.
    Implement shared media cards, rails, images, ratings, metadata, watchlist, trailer, and provider components.
    Build homepage with live data and local editorial sections.
    Build shared movie/series discovery and detail routes.
    Build global search overlay and full results route.
    Build people directory and person detail routes.
    Build watchlist route.
    Build editorial collections/index/article routes.
    Build About, Contact, and 404 routes.
    Add route metadata, structured data, attribution, and site configuration.
    Complete responsive, reduced-motion, keyboard, empty/error, and performance passes.
    Format, build, and manually verify the route/state matrix in the existing preview server.
15. Verification Strategy
    Use the repository’s prescribed commands only; do not start another development server.

Automated/static checks:

Run pnpm format after implementation.
Run pnpm build; fix all TypeScript and production bundle errors.
Re-run pnpm build after any build-related fix and only report success on a zero exit.
Manual preview checks on the already running Figma Make server:

Desktop and mobile layouts at narrow phone, tablet, laptop, and wide desktop widths.
No document-level horizontal overflow.
Header contrast/scroll behavior and full-screen mobile navigation.
Search overlay keyboard flow, debounce behavior, URL navigation, loading/empty/error states.
Discovery filters round-trip through URLs and browser history.
Movie and series detail content, trailer lazy-loading, cast, recommendations, and watch providers.
Watchlist add/remove persistence across refresh and malformed-storage recovery.
People and editorial routes, contact validation/mail draft, and 404 recovery.
Focus visibility, tab order, Escape handling, focus restoration, and reduced-motion mode.
Dynamic document titles/meta/JSON-LD by route.
TMDB and JustWatch attribution visibility in footer, About, and provider sections.
Missing-token, offline, API-error, no-image, no-results, and missing-entity states. 16. Acceptance Criteria
The implementation is complete when:

All listed routes render and navigate without full-page reloads.
Live TMDB data powers movies, series, people, search, discovery, and details when the token is configured.
The homepage communicates the Cinemura brand through a cohesive premium editorial system, not a generic card dashboard.
Search, URL filters, pagination, trailers, watchlist persistence, and contact validation work as specified.
Every API surface has intentional loading, empty, error, missing-token, and image-fallback behavior.
Desktop and mobile experiences are deliberate, accessible, and free of unintended horizontal overflow.
Route-specific titles, descriptions, social metadata, and structured data are present.
TMDB and JustWatch attribution is visible and contextually placed.
Noncritical routes are code-split, imagery is responsive/lazy, stale searches abort, and requests cache/deduplicate.
pnpm format and pnpm build complete successfully.
