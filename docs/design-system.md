# Real Estate Explorer - Design System

Kjo gjuhe vizuale përcakton bazën e dizajnit për Real Estate Explorer, duke vendosur standardet për tipografinë, ngjyrat, hapësirat dhe komponentët bazë (UI Components) për të siguruar konsistencë në të gjitha faqet (Publike dhe Admin) si dhe mbështetje të plotë për Dark Mode.

## 1. Ngjyrat & Tematika (Colors & Theming)

Sistemi përdor variabla CSS për të mundësuar kalimin e lehtë nga Light Mode në Dark Mode. Këto gjenden në `src/app/globals.css`.

### Ngjyrat Bazë (Core Colors)
- **`--background`**: Ngjyra e sfondit të faqes. Vlera e paracaktuar: `#FFFFFF` (Light), `#0B1120` (Dark). Përdorimi në zanafillë: `bg-[var(--background)]`.
- **`--foreground`**: Ngjyra parësore e tekstit. Vlera: `#0F172A` (Light), `#F8FAFC` (Dark). Përdorimi: `text-[var(--foreground)]`.

### Nuancat Kryesore (Brand / Primary Colors)
- **`--primary`**: Ngjyra theksuese bazë (Action Color). Kthehet në blu të ndezur. Përdorimi: `text-[var(--primary)]`, `bg-[var(--primary)]`.
- **`--primary-light`**: Përdoret për elemente më pak urgjente ose efekte "hover" në Dark Mode.
- **`--primary-dark`**: Përdoret për ndërveprime (hover/active state) në Light Mode.

---

## 2. Tipografia & Hierarkia (Typography)

Të gjitha tekstet kryesore janë ndërtuar mbi *Typographic Hierarchy Scale* dinamike:
- **`--text-scale-sm`** (0.875rem): Detaje të vogla, meta-të-dhëna, poshtë-shënime.
- **`--text-scale-base`** (1rem): Përshkrime dhomash, blloqe komentesh, dhe teksti i trupit.
- **`--text-scale-h3`** (1.25rem): Tituj për seksione të brendshme dhe Cards.
- **`--text-scale-h2`** (1.5rem): Tituj sekondarë në faqe.
- **`--text-scale-h1`** (2rem): Titulli kryesor parësor i faqes (psh. faqet dinamike `[id]`).
- **`--text-scale-hero`** (2.5rem): Përdoret në ballinën kryesore (Homepage Hero) për prezencë maksimale.

---

## 3. Hapësirat (Mathematical Spacing Scale)

Përdorimi strikt i këtyre variablave lejon mbajtjen e balancës mes elementeve, veçanërisht për `padding` dhe `gap`:
- **`--spacing-xs`** (4px): Hapësirë mikro (Ikona <-> Tekst).
- **`--spacing-sm`** (8px): Hapësirë mes elementeve të lidhur direkt.
- **`--spacing-md`** (16px): Baza e padding standard në shumë komponentë.
- **`--spacing-lg`** (24px): Hapësira mes seksioneve të komponentëve kompleksë (psh. form layout).
- **`--spacing-xl`** (32px): Përdoret si padding kryesor brenda `section` ose `main`.
- **`--spacing-2xl`** (48px) dhe **`--spacing-section`** (64px): Ndarja strukturore mes blloqeve masive të faqes.

---

## 4. Klasat Utilitare dhe Komponentët (CSS Classes)

Këto klasa aplikohen lehtësisht kudo mbi TailwindCSS via `@utility`:

### Kontejnerët
- **`.container-custom`**: Shërben për përmbajtjen qendrore. Ruan gjerësi standarde `max-w-7xl` me padding reagues (`px-4 sm:px-6 lg:px-8`).

### Kartat (Cards)
- **`.card`**: Kutia bazë. Merr sfond (background) si `var(--background)`, shton border transparent në dark mode, dhe u jep hije strukturës me rreze `rounded-2xl`.
- **`.card-interactive`**: Zgjeron `.card` me animacione të thella në Hover (rritje hijeje, `translate-y-1.5`, theksim focus-visible).

### Butonat
- **`.btn-primary`**: Butoni bazë "Call-to-Action". Përdor `--primary`, tekst i bardhë, dhe theks të lartë në hije + focus-visible (ring-2).
- **`.btn-secondary`**: Transparente/e Bardhë me border. E shkëlqyer për veprime neutrale (Anullo, Filter, etj).

### Fushat Mbledhëse (Forms)
- **`.input-field`**: Standa standard për `<input>`, `<textarea>`, apo `<select>`. Kombinon kornizë të hollë (`border-gray-200 dark:border-slate-700`), outline-none dhe një unazë vizuale theksuese `.focus-visible:ring-primary/50`.

---

## 5. Rregullat e Ndërveprimit (Micro-interactions)
1. **Focus Rings**: Të gjitha kontrollet (buttons, a, inputs) kanë të integruar theksim `outline` transparent që aktivizohet tek `focus-visible`. Ngjyra ndryshon në varësi të `var(--primary)`.
2. **Transition**: Çdo element i klikueshëm ka `transition-colors duration-150 ease-out` të integruar globailsht për efekte vizuale organike.
3. **Animations**: Ekrani dhe ngarkimet e animuara mbështeten tek format si `.animate-fadeIn` (shih `globals.css`).

## 6. Ikonat dhe Shenjat (Iconography)
1. **Lucide React**: Është biblioteka e brendshme ekskluzive për ikona, duke siguruar trashësi dhe pamje konsistente (zakonisht aplikohet madhësia `h-4 w-4` ose `h-5 w-5`). Përdoret rrënjësisht `lucide-react`.
2. **Badge Component**: Për statuset e pronave dhe elementet UI me pill-shape, përdoret `src/components/Badge.tsx`. Ku variacionet përshijnë `primary`, `warning`, `glass-light`, `glass-dark`, `outline`.
