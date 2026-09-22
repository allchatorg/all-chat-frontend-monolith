# Local fonts

The allchat Pro font presets use complete variable fonts, including Latin and
Cyrillic characters. Inter, Open Sans, and Nunito include true italics. Comfortaa
and Caveat ship upright styles; browsers synthesize italics for formatted text.
Font CSS variables are registered without preloading or changing the application font.

- Inter 4.1: `InterVariable.woff2` and `InterVariable-Italic.woff2` from
  https://rsms.me/inter/font-files/ (the official Inter distribution).
  License: `Inter-LICENSE.txt`, from https://github.com/rsms/inter/blob/master/LICENSE.txt.
- Open Sans: `OpenSansVariable.ttf` and `OpenSansVariable-Italic.ttf` from
  https://github.com/googlefonts/opensans/tree/main/fonts/variable
  (`OpenSans[wdth,wght].ttf` and `OpenSans-Italic[wdth,wght].ttf`).
  License: `OpenSans-OFL.txt`, from https://github.com/googlefonts/opensans/blob/main/OFL.txt.
- Nunito: `NunitoVariable.ttf` and `NunitoVariable-Italic.ttf` (weights 200–1000),
  a soft rounded sans serif. Source: `ofl/nunito/Nunito[wght].ttf` and
  `ofl/nunito/Nunito-Italic[wght].ttf`. License: `Nunito-OFL.txt`.
- Comfortaa: `ComfortaaVariable.ttf` (weights 300–700), a geometric rounded face.
  Source: `ofl/comfortaa/Comfortaa[wght].ttf`. License: `Comfortaa-OFL.txt`.
- Caveat: `CaveatVariable.ttf` (weights 400–700), a handwritten face.
  Source: `ofl/caveat/Caveat[wght].ttf`. License: `Caveat-OFL.txt`.
  Its font-face uses `size-adjust: 125%` for readability at existing chat text sizes.

Nunito, Comfortaa, and Caveat are unmodified files from the official
[Google Fonts repository](https://github.com/google/fonts/tree/e44c4b011a820c2cbe2fd2cfa8052037d7edb571/ofl),
revision `e44c4b011a820c2cbe2fd2cfa8052037d7edb571`. Each bundled license is
the corresponding family's `OFL.txt` at that revision.

Downloaded September 21, 2026. These files are served locally; using a preset does
not send requests to a third-party font provider.
