# Font sources and loading

The original Google Fonts files below are unmodified TrueType fonts from the official
[google/fonts repository](https://github.com/google/fonts), downloaded on
2026-09-29. Each family's license is included alongside its font files.

| Local files | Source | Weight / style | License |
| --- | --- | --- | --- |
| `RobotoVariable.ttf`, `RobotoVariable-Italic.ttf` | [Roboto](https://github.com/google/fonts/tree/main/ofl/roboto) | 100–900, normal and italic | `Roboto-OFL.txt` |
| `PetitFormalScript-Regular.ttf` | [Petit Formal Script](https://github.com/google/fonts/tree/main/ofl/petitformalscript) | 400, normal | `PetitFormalScript-OFL.txt` |
| `Italianno-Regular.ttf` | [Italianno](https://github.com/google/fonts/tree/main/ofl/italianno) | 400, normal | `Italianno-OFL.txt` |
| `KablammoVariable.ttf` | [Kablammo](https://github.com/google/fonts/tree/main/ofl/kablammo) | 400, normal; `MORF` axis 0–60 | `Kablammo-OFL.txt` |
| `CraftyGirls-Regular.ttf` | [Crafty Girls](https://github.com/google/fonts/tree/main/apache/craftygirls) | 400, normal | `CraftyGirls-LICENSE.txt` (Apache 2.0) |
| `EmilysCandy-Regular.ttf` | [Emilys Candy](https://github.com/google/fonts/tree/main/ofl/emilyscandy) | 400, normal | `EmilysCandy-OFL.txt` |

Roboto also includes its original width axis (75–100). All other Google font
licenses listed above are SIL Open Font License 1.1.

## Supplied archives

Added from the user's ZIP files on 2026-09-29. Only font assets and supplied
license/readme documents are bundled; archive preview images are excluded.
Emily's Candy in the supplied archive matches the existing TTF byte-for-byte,
so it remains a single selection.

| Family | Archive / original font | Web assets | Supplied license record |
| --- | --- | --- | --- |
| Evelyne | `evelyne.zip` / `Evelyne.otf` | `Evelyne-Regular.woff2` | `Evelyne-README.txt`; author states personal and commercial use |
| Messy Handwritten | `messy-handwritten.zip` / `MessyHandwritten-Regular.ttf` | `MessyHandwritten-Regular.woff2` | No license document in archive |
| Love Light | `love-light.zip` / `LoveLight-Regular.ttf` | `LoveLight-Regular.woff2` | `LoveLight-OFL.txt` |
| Clicker Script | `clicker-script.zip` / `ClickerScript-Regular.ttf` | `ClickerScript-Regular.woff2` | `ClickerScript-OFL.txt` |
| Tangerine | `tangerine.zip` / `Tangerine_Regular.ttf`, `Tangerine_Bold.ttf` | `Tangerine-Regular.woff2`, `Tangerine-Bold.woff2` | `Tangerine-OFL.txt` |
| Sahir Yesta | `sahir-yesta.zip` / `Sahir Yesta.otf` | `SahirYesta-Regular.woff2` | `SahirYesta-LICENSE.txt` |
| Gista Danes | `gista-danes.zip` / `Gista Danes.otf` | `GistaDanes-Regular.woff2` | `GistaDanes-LICENSE.txt` |
| A Yummy Apology | `a-yummy-apology.zip` / `Ayuma2yk.ttf` | `AYummyApology-Regular.woff2` | `AYummyApology-LICENSE.txt` |
| Princess Sofia | `princess-sofia.zip` / `PrincessSofia-Regular.ttf` | `PrincessSofia-Regular.woff2` | `PrincessSofia-OFL.txt` |
| Rain Kiss | `rain_kiss.zip` / `Rain Kiss.woff2`, `Rain Kiss Italic.woff2` | `RainKiss-Regular.woff2`, `RainKiss-Italic.woff2` | No license document in archive |

Rain Kiss and Messy Handwritten are wired into the requested local implementation,
but these archives do not establish commercial web embedding rights. Confirm the
licenses before production deployment. Rain Kiss was previously recorded here as
a personal-use download; providing WOFF2 files does not itself establish a license.
The included 1001Fonts licenses explicitly permit format conversion and app
embedding while retaining the original font names and glyphs.

## Delivery

Every optional Pro face uses WOFF2 through `next/font/local` in `src/app/layout.tsx`,
with `preload: false` and `display: 'swap'`. Defining CSS variables globally does
not download unused faces. A font is requested when a rendered username, message,
or picker preview uses it; opening the picker can load all preview families.
Only the existing Geist UI faces are preloaded.

Next emits content-hashed font URLs under `/_next/static/media` with long-lived
immutable caching. Serve those assets through the same CDN as the application,
preserving Next's cache headers. No third-party font requests or JavaScript font
loader are needed. Tangerine's real bold and Rain Kiss's real italic are declared
separately, so the browser fetches only the variants it uses.

Full-font conversion with FontTools 4.66.1 preserves names, glyphs, character
coverage, shaping tables, and variable axes; no subsetting is performed. The
supplied Rain Kiss WOFF2 files are copied unchanged. Original existing TTFs are
retained as source assets but are no longer referenced by the application.
`font-assets.json` records source/output hashes, sizes, and glyph coverage.
[`SECURITY_SCAN.md`](./SECURITY_SCAN.md) records the local ClamAV scan and font
validation results for these assets.

- Existing optional faces: 3,940,080 bytes of TTF → 1,569,040 bytes of WOFF2 (60.2% smaller).
- Ten new families, including bold/italic variants: 423,248 bytes of WOFF2 total.
- All optional faces: 1,992,288 bytes if every variant is eventually requested;
  this is not an initial page-load download.

Further subsetting should only be considered with confirmed character coverage
and license permission. Chat text is user-generated, and several supplied licenses
permit conversion but prohibit other modifications.

References: [Next.js font API](https://nextjs.org/docs/app/api-reference/components/font)
and [web.dev font loading guidance](https://web.dev/learn/performance/optimize-web-fonts).

## Visible text size

The default UI uses Tailwind's `ui-sans-serif, system-ui` stack. Equal CSS
`font-size` values do not give all typefaces equally sized visible letters.
Each optional face therefore has a `size-adjust` descriptor in `layout.tsx`.
This changes browser rendering only; font files, download sizes, and glyph
outlines in the source assets are unchanged.

The starting scale is `0.52 / measuredLowercaseHeight`, rounded to a whole
percentage. Heights are the median actual outline bounds of `aceimnorsuvwxz`,
divided by units per em, measured with FontTools BoundsPen. The 0.52em target
approximates the default system sans lowercase body; several supplied fonts'
reported x-height metadata does not match their visible glyphs. Kablammo is
visually calibrated against capital height because its lowercase is drawn as
decorative capitals. The result is checked in a browser at chat text sizes.

| Font | Visible size adjustment |
| --- | --- |
| Roboto | 97% |
| Petit Formal Script | 87% |
| Italianno | 178% |
| Kablammo | 95% |
| Crafty Girls | 92% |
| Emily's Candy | 101% |
| Evelyne | 181% |
| Messy Handwritten | 156% |
| Love Light | 147% |
| Clicker Script | 154% |
| Tangerine | 203% |
| Sahir Yesta | 105% |
| Gista Danes | 185% |
| A Yummy Apology | 171% |
| Princess Sofia | 105% |
| Rain Kiss | 89% |

`fontPresetStyle` keeps each element's existing `font-size` and uses
`line-height: normal` for custom fonts, allowing the scaled capitals and tails
to fit in messages, usernames, and truncated previews. The composer uses its
own consistent line box (`2.5rem - 2px`), keeping a single line at the action
buttons' 40px height regardless of the font. Wrapped text and explicit new
lines grow the field up to five lines on all screen sizes, then scroll inside
it. The font picker grows with its selected face.
Optional fonts disable Next's generated fallback adjustment because it
uses the original, unscaled metrics; they fall back to the default system sans
at its native size while loading.

This normalizes the readable body of the letters, not character widths,
stroke weights, or flourishes. Those remain part of each font's design, and
the default system font varies slightly by operating system.

## Remaining requested fonts

These families are not bundled or selectable yet. Add the exact font files with
web embedding rights before enabling their frontend presets and backend enum
selections. Do not substitute a different font under one of these names.

- [Sweet Valentine](https://www.ffonts.net/Sweet-Valentine.font) by Alvaro Ariel.
- [Hibis](https://www.fontcanyon.com/hibis-font/) by andikastudio.
- Sticker: confirm the product; Creative Fabrica lists multiple fonts with this name.
- Rosavine: confirm the product; Creative Fabrica lists both a serif and a script family.
- [Bhigli](https://www.heyfonts.com/script/bhigli-font/) by Glorytype.

The current public downloads for Sweet Valentine and Bhigli are
marked personal-use-only. Hibis is distributed through Creative Fabrica, whose
[webfont guidance](https://help.creativefabrica.com/hc/en-us/articles/360029518531-How-do-I-convert-an-OTF-or-TTF-font-to-a-Webfont)
requires a separate license for web embedding.
