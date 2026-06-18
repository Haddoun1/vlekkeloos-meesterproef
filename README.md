# Mensenkenners — E-learning Platform

**Live:** [vlekkeloos-meesterproef.onrender.com](https://vlekkeloos-meesterproef.onrender.com)

Een webapplicatie waarmee medewerkers inclusiviteitstrainingen kunnen volgen. Gebruikers doorlopen een onboarding en vier modules met tekst, video en interactieve vragen. Een admin-dashboard toont de voortgang per deelnemer.

---

## Tech stack

| Laag | Technologie |
|------|-------------|
| Framework | [Astro](https://astro.build) v6 (SSR, Node adapter) |
| Database & Auth | [Supabase](https://supabase.com) |
| Animaties | [GSAP](https://gsap.com) |
| Hosting | Render (of een andere Node-server) |
| Font | Plus Jakarta Sans (lokaal, in `public/fonts/`) |

---

## Projectstructuur

```
/
├── public/
│   ├── fonts/              # Plus Jakarta Sans (.woff2)
│   ├── images/             # Afbeeldingen en logo's
│   └── styles/
│       ├── global.css      # CSS-variabelen, dark mode, gedeelde stijlen
│       └── onboarding.css  # Stijlen specifiek voor de onboarding
│
├── src/
│   ├── components/
│   │   ├── Accessibilitysimulator.astro  # Simulatiepaneel (bijv. wazig zicht)
│   │   ├── BaseHead.astro               # <head>-tags, meta, favicon
│   │   ├── BottomNav.astro              # Vorige/volgende navigatie (module-pagina's)
│   │   ├── CourseCard.astro             # Cursuskaart op het dashboard
│   │   ├── Footer.astro
│   │   ├── Header.astro                 # Topbalk met logo en uitlogknop
│   │   ├── QuestionMulti.astro          # (component, niet actief in routing)
│   │   ├── QuestionSingle.astro         # (component, niet actief in routing)
│   │   ├── Questionnav.astro            # Hamburger + stappenlijst in module-header
│   │   └── ThemeToggle.astro            # Dark/light mode knop
│   │
│   ├── data/
│   │   ├── mensenkennersvragen.json     # Alle content voor intro + 4 modules
│   │   └── onboarding-steps.json        # (reservebestand, onboarding gebruikt eigen pagina's)
│   │
│   ├── layouts/
│   │   ├── Layout.astro                 # Hoofdlayout (header + footer)
│   │   ├── Layout-onboarding.astro      # Onboarding-layout (stapindicator, voortgang)
│   │   └── DetailLayout.astro           # Alternatieve detaillayout
│   │
│   ├── lib/
│   │   ├── supabase.js                  # Client-side Supabase client
│   │   └── supabaseServer.ts            # Server-side Supabase client (cookies)
│   │
│   ├── pages/
│   │   ├── index.astro                  # Dashboard (cursusoverzicht + voortgang)
│   │   ├── update-password.astro        # Wachtwoord bijwerken na reset-link
│   │   │
│   │   ├── [category]/
│   │   │   └── [step].astro             # Dynamische module-pagina's (gegenereerd vanuit JSON)
│   │   │
│   │   ├── onboarding/
│   │   │   ├── step-1.astro … step-5.astro   # Onboarding stappen
│   │   │   ├── welkom.astro / welkom-no-loader.astro
│   │   │   ├── login.astro
│   │   │   ├── register.astro
│   │   │   └── result.astro             # Eindscherm onboarding
│   │   │
│   │   ├── admin/
│   │   │   ├── index.astro              # Admin-dashboard (voortgang per gebruiker)
│   │   │   └── login.astro              # Admin-inlogpagina
│   │   │
│   │   └── api/
│   │       ├── track-step.js            # POST: sla een stap op in course_progress
│   │       ├── get-progress.js          # POST: haal voortgang op voor een gebruiker
│   │       ├── admin-role.ts            # POST: maak gebruiker admin of verwijder rol
│   │       └── test-supabase.js         # Debug-endpoint (kan verwijderd worden)
│   │
│   └── utils/
│       └── slugify.js                   # Zet categorie-namen om naar URL-slugs
│
├── astro.config.mjs                     # Astro-config (SSR + Node adapter)
├── tsconfig.json
└── package.json
```

---

## Lokaal opstarten

### 1. Vereisten

- Node.js >= 22.12.0
- Een Supabase-project (zie hieronder)

### 2. Omgevingsvariabelen

Maak een `.env`-bestand aan in de root:

```env
PUBLIC_SUPABASE_URL=https://<jouw-project>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<jouw-anon-key>
```

Beide waarden zijn te vinden in Supabase onder **Project Settings → API**.

### 3. Installeren en starten

```sh
npm install
npm run dev       # start op http://localhost:4321
```

Andere commando's:

| Commando | Actie |
|----------|-------|
| `npm run build` | Bouw de productieversie naar `./dist/` |
| `npm run preview` | Preview de gebouwde versie lokaal |

---

## Database (Supabase)

### Tabellen

#### `profiles`
Aangemaakt automatisch bij registratie via een Supabase trigger.

| Kolom | Type | Omschrijving |
|-------|------|--------------|
| `id` | uuid (FK → auth.users) | Gebruikers-ID |
| `role` | text | `'admin'` of leeg/null |

#### `course_progress`
Elke keer dat een gebruiker een stap voltooit, wordt hier een rij aangemaakt.

| Kolom | Type | Omschrijving |
|-------|------|--------------|
| `id` | bigint (PK) | Auto-increment |
| `user_id` | text | Supabase user-ID of `'anonymous'` |
| `email` | text | E-mailadres van de gebruiker |
| `name` | text | Naam uit user_metadata |
| `step_id` | text | ID van de stap (bijv. `m1_q1`) |
| `category` | text | URL-slug van de module (bijv. `module-1`) |
| `current_url` | text | Huidige URL voor hervatten |
| `started_at` | timestamptz | Wanneer de stap begon |
| `ended_at` | timestamptz | Wanneer de gebruiker verder ging |
| `duration_seconds` | integer | Aantal seconden op de stap |

### Row Level Security (RLS)

Zorg dat de volgende RLS-policies ingesteld zijn in Supabase:

- `course_progress`: iedereen mag INSERT (ook niet-ingelogde gebruikers met `anonymous`), alleen de eigenaar mag SELECT.
- `profiles`: alleen de eigenaar mag lezen en schrijven.

De admin-functies (rol toekennen) lopen via een **service-role key** op de server. Pas op dat de service-role key nooit in de frontend terechtkomt.

---

## Hoe content werkt

### Modules (Intro + Module 1–4)

Alle content voor de cursusmodules staat in één JSON-bestand:

```
src/data/mensenkennersvragen.json
```

Het bestand bevat een array `blocks`. Elk blok is één pagina en heeft een `type`:

| Type | Omschrijving |
|------|--------------|
| `content` | Tekstpagina (title, subtitle, text, list) |
| `video` | Videopagina (YouTube of Vimeo URL) |
| `question` | Vraagpagina (zie input-types hieronder) |

Het veld `Category` bepaalt in welke module het blok valt. De slug-versie daarvan (`module-1`, `module-2`, etc.) wordt de URL-prefix.

**Voorbeeld URL:** `/module-1/3` → derde blok in categorie "Module 1"

De volgorde van blokken in de array bepaalt de volgorde van de stappen. Nieuw blok ertussen plakken = dat wordt de nieuwe stap op die plek.

---

### Nieuwe vraag of pagina toevoegen

Voeg een nieuw object toe in de `blocks`-array op de gewenste positie. Zorg dat het `id` uniek is — gebruik een duidelijke naamgevingsconventie, bijv. `m1_q04_jouw_onderwerp`.

#### Tekstpagina

```json
{
  "id": "m1_content_jouw_onderwerp",
  "type": "content",
  "Category": "Module 1",
  "title": "Titel van de pagina",
  "text": "Tekst die op de pagina verschijnt.",
  "list": [
    "Punt één",
    "Punt twee"
  ]
}
```

`text` en `list` zijn allebei optioneel — je kunt ze apart of samen gebruiken.

#### Videopagina

```json
{
  "id": "m2_video_jouw_video",
  "type": "video",
  "Category": "Module 2",
  "title": "Titel van de video",
  "url": "https://www.youtube.com/watch?v=XXXXXXXXX"
}
```

YouTube- en Vimeo-links worden automatisch omgezet naar embed-URL's.

#### Enkelvoudige keuzevraag (single_choice)

Eén juist antwoord. Markeer het juiste antwoord met `"is_correct": true`.

```json
{
  "id": "m1_q03_enkelvoudig",
  "type": "question",
  "Category": "Module 1",
  "title": "Paginatitel",
  "question": "Welke aanpak is het meest inclusief?",
  "input_type": "single_choice",
  "explanation": "Uitleg die na het checken verschijnt.",
  "options": [
    { "text": "Direct hulp overnemen." },
    { "text": "Vragen of hulp gewenst is.", "is_correct": true },
    { "text": "Afwachten tot iemand hulp vraagt." }
  ]
}
```

#### Meervoudige keuzevraag (multiple_choice)

Meerdere antwoorden kunnen juist zijn. Met `max_selections` beperk je hoeveel de gebruiker er mag kiezen.

```json
{
  "id": "m2_q05_meervoudig",
  "type": "question",
  "Category": "Module 2",
  "title": "Paginatitel",
  "question": "Welke twee reacties zijn passend?",
  "input_type": "multiple_choice",
  "max_selections": 2,
  "explanation": "Uitleg die na het checken verschijnt.",
  "options": [
    { "text": "Rustig luisteren.", "is_correct": true },
    { "text": "De zin afmaken." },
    { "text": "Geduldig wachten.", "is_correct": true },
    { "text": "Snel antwoord geven." }
  ]
}
```

#### Schaalvraag (rating)

```json
{
  "id": "m3_q02_schaal",
  "type": "question",
  "Category": "Module 3",
  "title": "Paginatitel",
  "question": "Hoe toegankelijk voel jij jouw werkplek?",
  "input_type": "rating",
  "scale": {
    "min": 1,
    "max": 10,
    "min_label": "Helemaal niet toegankelijk",
    "max_label": "Volledig toegankelijk"
  }
}
```

#### Open vraag (long_text)

Geen juist of fout antwoord — na checken verschijnt een voorbeeldantwoord.

```json
{
  "id": "m2_q03_open",
  "type": "question",
  "Category": "Module 2",
  "title": "Paginatitel",
  "question": "Beschrijf een situatie waarbij je iemand bewust ruimte hebt gegeven.",
  "input_type": "long_text",
  "example_answer": "Bijvoorbeeld: Ik wachtte rustig tot iemand klaar was met spreken in plaats van de zin af te maken."
}
```

#### Zin afmaken (sentence_completion)

Werkt hetzelfde als `long_text`, maar is bedoeld voor het afmaken van een zin.

```json
{
  "id": "m3_q01_zin",
  "type": "question",
  "Category": "Module 3",
  "title": "Paginatitel",
  "question": "Als ik zie dat iemand moeite heeft met iets, dan...",
  "input_type": "sentence_completion",
  "example_answer": "...vraag ik eerst of ik kan helpen voordat ik iets doe."
}
```

#### Matchingvraag (matching)

De gebruiker koppelt prompts aan antwoorden. De antwoorden in de dropdowns worden automatisch gemixt vanuit alle `answer`-waarden in `pairs`.

```json
{
  "id": "m1_q04_matching",
  "type": "question",
  "Category": "Module 1",
  "title": "Paginatitel",
  "question": "Koppel iedere situatie aan de juiste reactie.",
  "input_type": "matching",
  "pairs": [
    {
      "prompt": "Een bezoeker in een rolstoel vraagt de weg.",
      "answer": "Spreek de persoon zelf aan."
    },
    {
      "prompt": "Een bezoeker stottert.",
      "answer": "Luister rustig en geef de persoon de tijd."
    }
  ]
}
```

---

### Onboarding

De onboarding gebruikt **aparte Astro-pagina's** (`src/pages/onboarding/step-1.astro` t/m `step-5.astro`) met de `Layout-onboarding.astro` layout. Elke pagina geeft props mee:

```astro
<MainLayout
  title="Stap 1"
  nextHref="/onboarding/step-2"
  backHref="/onboarding/login"
  headingText="Wat is Mensenkenners?"
  bodyText="..."
  step={1}
  totalSteps={11}
  stepId="onboarding_step-1"
  category="onboarding"
>
```

Om een onboarding-stap toe te voegen: maak een nieuw `.astro`-bestand aan en pas `nextHref`/`backHref` aan in de omliggende stappen.

---

## Voortgang bijhouden

Wanneer een gebruiker op "Volgende" klikt op een module-pagina, wordt automatisch een POST gedaan naar `/api/track-step`. De volgende data wordt opgeslagen:

- Gebruikers-ID, naam, e-mail
- Stap-ID en categorie
- Huidige URL (voor hervatten)
- Starttijd, eindtijd en duur in seconden

Op het dashboard haalt de browser alle voortgang op via `/api/get-progress` en berekent het percentage per cursus.

---

## Admin-dashboard

Toegankelijk via `/admin`. Vereist een account met `role = 'admin'` in de `profiles`-tabel.

**Functies:**
- Overzicht van alle stappen per module per gebruiker
- Totaalstatistieken (opgeslagen stappen, unieke gebruikers, actieve tijd)
- Wachtwoord-resetlink versturen naar een gebruiker
- Adminrechten toekennen of intrekken op basis van e-mailadres

Een nieuwe admin aanmaken: log in op het admin-dashboard en gebruik het formulier "Maak admin" onderaan de pagina, of stel de rol direct in via de Supabase-interface.

---

## Toegankelijkheidssimulator

De component `Accessibilitysimulator.astro` voegt een paneel toe waarmee gebruikers kunnen ervaren hoe de interface eruitziet met verschillende beperkingen (bijv. wazig zicht, kleurenblindheid). Dit paneel is zichtbaar op module-pagina's via de "Menu"-knop rechts in de header.

---

## Dark mode

Dark mode wordt opgeslagen in `localStorage` onder de sleutel `theme`. De class `dark-mode` wordt op `<html>` gezet. CSS-variabelen in `global.css` regelen de kleuren per thema.

---

## Deployment

Het project draait als een Node.js server (`output: 'server'` in `astro.config.mjs`).

1. Bouw de app: `npm run build`
2. Start de server: `node ./dist/server/entry.mjs`
3. Zorg dat de omgevingsvariabelen (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`) beschikbaar zijn op de server.

Het project is geconfigureerd voor [Render](https://render.com). Stel bij Render in:
- **Build command:** `npm install && npm run build`
- **Start command:** `node ./dist/server/entry.mjs`
- Voeg de twee Supabase-omgevingsvariabelen toe onder Environment.

---

## CSS-variabelen (`public/styles/global.css`)

Alle kleuren, fonts en groottes worden via CSS-variabelen beheerd op het `html`-element. Dark mode overschrijft een deel van deze variabelen via de class `html.dark-mode`.

### Merkkleuren

| Variabele | Waarde (light) | Gebruik |
|-----------|---------------|---------|
| `--color-text` | `#222020` | Standaard tekstkleur |
| `--color-background` | `#ffffff` | Pagina-achtergrond |
| `--color-green` | `#2AB789` | Primaire accentkleur, dashboard-knoppen |
| `--color-cyan` | `#B1F2D9` | Lichte accenttint, knoppen en tags |
| `--color-cyan-dark` | `#8bcab2` | Hover-variant van cyan |
| `--color-pink` | `#FF94E1` | Module 1 accentkleur |
| `--color-yellow` | `#E9F279` | Module 2 accentkleur |
| `--color-red` | `#FF6631` | Module 3 accentkleur |
| `--color-blue` | `#647bef` | Module 4 accentkleur |

### Module-accentkleuren

Elke module krijgt automatisch zijn eigen accentkleur via `--color-accent`. Deze variabele wordt per pagina ingesteld als inline style op `.page-shell`:

```css
--accent-intro:    #B1F2D9   /* Onboarding / Intro */
--accent-module-1: #FF94E1   /* Module 1 */
--accent-module-2: #E9F279   /* Module 2 */
--accent-module-3: #FF6631   /* Module 3 */
--accent-module-4: #647bef   /* Module 4 */
```

Wil je de kleur van een module aanpassen? Verander de waarde van de bijbehorende `--accent-module-X` variabele. De dark mode-varianten staan eronder (`--accent-module-X-dark`).

### Module-specifieke UI-kleuren

Deze variabelen bepalen hoe de kaarten, invoervelden en feedbackblokken eruitzien in de modules:

| Variabele | Omschrijving |
|-----------|--------------|
| `--module-card-background` | Achtergrond van de contentkaart |
| `--module-option-label` | Achtergrond van een niet-geselecteerde antwoordoptie |
| `--module-option-label-hover` | Achtergrond bij hover |
| `--module-option-checked` | Achtergrond van een geselecteerde optie |
| `--module-option-checked-letter` | Kleur van de letterbox (A/B/C) bij selectie |
| `--module-text-input` | Achtergrond van tekstvelden en textareas |
| `--module-right-correct` | Achtergrond feedbackblok bij goed antwoord |
| `--module-wrong-error` | Achtergrond feedbackblok bij fout antwoord |
| `--module-feedback-wrong` | Alternatieve achtergrond foutfeedback |

### Achtergrondgradiënten

| Variabele | Gebruik |
|-----------|---------|
| `--gradient-bg-cyan` | Standaard pagina-achtergrond (subtiele cyantint) |
| `--gradient-bg-green` | Groene variant |
| `--gradient-bg-pink` | Roze variant (Module 1) |
| `--gradient-bg-yellow` | Gele variant (Module 2) |
| `--gradient-bg-red` | Rode variant (Module 3) |
| `--gradient-bg-blue` | Blauwe variant (Module 4) |
| `--gradient-bg-cyan-card` | Achtergrond van kaarten op het dashboard |
| `--gradient-bg-header` | Achtergrondgradiënt in de header |

### Onboarding-kleuren

| Variabele | Omschrijving |
|-----------|--------------|
| `--onboarding-text` | Tekstkleur in de onboarding |
| `--onboarding-label` | Kleur van labels in formulieren |
| `--onboarding-text-dark` | Donkerdere tekstvariant |
| `--onboarding-back-button` | Kleur van de terugknop |
| `--error-login` | Rood voor foutmeldingen bij inloggen |
| `--button-background` | Achtergrond van filterknopjes op het dashboard |

### Simulator

| Variabele | Omschrijving |
|-----------|--------------|
| `--simulator-background` | Overlay-achtergrond van de toegankelijkheidssimulator |
| `--simulator-background-panel` | Achtergrond van het paneel zelf |
| `--simulator-num` | Achtergrond van de stap-nummers in de paneelopties |
| `--select-dropdown` | Achtergrond van `<option>`-elementen in dropdowns |

### Fonts

Alle fonts zijn lokaal geladen vanuit `public/fonts/`. Gebruik altijd de variabele, nooit de font-naam direct.

| Variabele | Gewicht |
|-----------|---------|
| `--font-extra-light` | 200 |
| `--font-light` | 300 |
| `--font-regular` | 400 |
| `--font-medium` | 500 |
| `--font-semi-bold` | 600 |
| `--font-bold` | 700 |
| `--font-extra-bold` | 800 |

Van elk gewicht bestaat ook een italic-variant, bijv. `--font-bold-italic`.

### Groottes (type scale)

| Variabele | Waarde |
|-----------|--------|
| `--size-xs` | 0.75rem (12px) |
| `--size-sm` | 0.875rem (14px) |
| `--size-base` | 1rem (16px) |
| `--size-lg` | 1.125rem (18px) |
| `--size-xl` | 1.25rem (20px) |
| `--size-2xl` | 1.5rem (24px) |
| `--size-3xl` | 1.875rem (30px) |
| `--size-4xl` | 2.25rem (36px) |

Grotere stappen lopen door t/m `--size-10xl` (10rem).

### Dark mode

Dark mode wordt geactiveerd door de class `dark-mode` op het `<html>`-element (opgeslagen in `localStorage`). De donkere varianten van de kleuren staan in het blok `html.dark-mode {}` in `global.css`. Als je een nieuwe variabele toevoegt, voeg dan ook een dark mode-waarde toe in dat blok.
