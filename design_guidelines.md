# Khutbah Companion - Design Guidelines

## Design Approach

**Reference-Based Approach**: Draw inspiration from modern Islamic apps (Muslim Pro, Athan), spiritual wellness apps (Headspace, Calm), and mobile-first platforms (Instagram feed patterns, Notion organization). Create a reverent yet contemporary experience that feels both spiritually grounding and technologically sophisticated.

**Core Design Principles**:
1. **Spiritual Serenity**: Calm, focused interface that encourages contemplation
2. **Effortless Navigation**: Swipe-based interactions for seamless feature discovery
3. **Islamic Aesthetic**: Subtle geometric patterns, respectful color treatment, Arabic typography excellence
4. **Mobile-First**: Touch-optimized, gesture-driven, bottom-anchored navigation

---

## Typography

**Arabic Typography**:
- Primary: Noto Naskh Arabic (for Qur'an, duas, khutbah text)
- Sizes: text-2xl to text-4xl for Arabic content, ensuring readability
- Always right-aligned (RTL) with proper line-height (leading-loose)

**English Typography**:
- Primary: Inter or SF Pro Display
- Headers: font-semibold, text-xl to text-3xl
- Body: font-normal, text-base to text-lg
- Captions: text-sm, text-gray-600

**Hierarchy**: Arabic text receives visual priority in religious contexts (Qur'an, duas). English serves as supporting translation with slightly reduced sizing.

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12** (p-4, gap-6, mt-8, mb-12) for consistent rhythm.

**Core Layout Patterns**:

1. **Homepage - Horizontal Scroll Cards**:
   - Full-width viewport with horizontal snap-scroll container
   - Each feature card: `min-w-[85vw] md:min-w-[400px]` with `snap-center`
   - Cards display in sequence: Prayer Times → Tasbih → Qibla → Qur'an → Duas → Khutbahs
   - Pagination dots below cards for visual progress

2. **Bottom Navigation Bar** (Fixed):
   - 5 icons: Home, Qur'an, Prayer, Tasbih, Profile
   - Large touch targets (h-16), centered icons with labels
   - Active state: gradient underline or filled icon

3. **Feature Pages**:
   - Full-height containers with internal scrolling
   - Generous padding: px-6 py-8 on mobile, px-12 py-12 on desktop
   - Max-width constraints: max-w-2xl for text content, max-w-6xl for cards

4. **Swipeable Content** (Qur'an, Duas, Names of Allah):
   - Horizontal swipe between items with smooth transitions
   - Visual cues: faded edges indicating more content
   - Navigation arrows on desktop, swipe gestures on mobile

---

## Component Library

### Navigation Components

**Bottom Tab Bar**:
- Frosted glass effect: `backdrop-blur-lg bg-white/80`
- Icons size: w-6 h-6, with text-xs labels below
- Safe area padding for mobile notches

**Feature Cards (Homepage)**:
- Gradient backgrounds with Islamic geometric pattern overlays
- Large feature icon at top (w-16 h-16)
- Feature title: text-2xl font-semibold
- Brief description: text-sm text-gray-600
- "Explore" button with blur background when on image

### Prayer & Islamic Tools

**Prayer Times Card**:
- Current prayer highlighted with accent border
- Next prayer countdown timer prominent at top
- List of 5 prayers with times in two columns
- Location display with edit icon

**Tasbih Counter**:
- Large circular counter display (w-48 h-48) in center
- Current count: text-6xl font-bold
- Tap-to-increment interaction (entire circle is touch target)
- Preset selector carousel below counter
- Reset button (small, secondary) in top-right

**Qibla Compass**:
- Full-circle compass visualization (w-64 h-64)
- Animated needle pointing to Kaaba
- Degree display and distance to Makkah below
- Calibration instructions overlay when needed

**Hijri Calendar**:
- Month view grid with Islamic dates prominent
- Event markers (Ramadan, Eid) with colored dots
- Date converter at bottom: Gregorian ↔ Hijri

### Content Display

**Qur'an Reader**:
- Two-column layout: Arabic (larger, right) | English (left) on desktop
- Single column on mobile with Arabic above English
- Surah selector: horizontal scrollable chips
- Ayah numbers in circular badges
- Bookmark and share icons per ayah

**Dua Cards**:
- Card-based layout with category tabs at top
- Each dua: Arabic text (text-xl), transliteration (text-sm italic), English (text-base)
- Audio play button (if available)
- Favorite/bookmark icon in card corner

**99 Names of Allah**:
- Grid of beautiful cards (2 columns mobile, 3-4 desktop)
- Each card: Arabic name (large calligraphy style), transliteration, meaning
- Subtle background pattern unique to each card
- Tap to expand for detailed description

### Khutbah Features

**Live Translation Feed**:
- Auto-scrolling container with sticky header
- Each segment: Arabic (text-xl, right-aligned) above English (text-lg)
- Timestamp markers on left edge
- Recording indicator: pulsing red dot in header
- Large "Start/Stop Recording" button at bottom (always visible)

**Sermon History**:
- List cards with mosque name, date, title
- Quick actions: View, Share, Delete
- Search bar at top with filter chips (date range, mosque)
- Empty state: illustration encouraging first recording

**Premium Khutbah Database**:
- Instagram-style feed of sermon cards
- Filters: Topic tags, Date, Mosque, Language
- Each card preview: Title, Excerpt, Duration, Save icon
- Premium badge on paywall content

### Premium Features

**Action Points Cards**:
- Checklist-style layout with expandable items
- Progress tracker at top (X/Y completed this week)
- Each action: Checkbox, Description, Optional notes field

**Analytics Dashboard**:
- Stat cards in grid: Sermons attended, Dhikr count, Prayers on time, Qur'an pages
- Line charts for trends (last 30 days)
- Achievement badges section

**Reflection Journal**:
- Minimal text editor with prompted questions
- Entry history timeline
- Mood/reflection tags

---

## Images

**Hero Image**: Yes - Homepage feature cards use background images with Islamic geometric patterns or mosque photography
- Prayer Times: Beautiful mosque at prayer time (dawn/dusk)
- Qibla: Kaaba aerial view or compass rose pattern
- Qur'an: Open Qur'an pages or Islamic calligraphy
- Tasbih: Close-up of prayer beads with soft focus

**Content Images**:
- Mosque Finder: Map with mosque pins
- Ramadan: Crescent moon, lanterns, iftar scenes
- Profile/Premium: Subtle background patterns

All images should have overlay gradients for text legibility. Buttons on images use `backdrop-blur-md bg-white/20` for visibility.

---

## Animations

**Minimal, Purposeful Animations**:
- Page transitions: Smooth slide (200ms ease-in-out)
- Card reveals: Subtle fade-up on scroll
- Tasbih counter: Gentle scale pulse on tap
- Qibla needle: Smooth rotation with spring physics
- Prayer time updates: Number flip animation

Avoid excessive motion - prioritize spiritual calm over flashy effects.

---

## Accessibility & Islamic Considerations

- High contrast ratios for readability (WCAG AAA for body text)
- Large touch targets (minimum 44x44px)
- Arabic text never compressed or condensed
- Respectful spacing around Qur'anic verses (never crowded)
- Audio accessibility for visually impaired users (TTS for all text)
- Option to increase base font size globally