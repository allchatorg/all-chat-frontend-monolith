# Greentext formatting

## Research and scope

4chan's [official quoting FAQ](https://4chan.org/faq#quote) distinguishes text
quoting with `>` from references to numbered posts with `>>210981` and cross-board
references with `>>>/x/1208196`.

This feature reproduces the requested line-based greentext formatting in All-Chat.
Each visible line beginning with `>` turns green, retains its pointer, and ends at
the next newline. Blank lines remain blank; consecutive quote lines do not create
an indented block or add paragraph margins. A space after `>` is optional. Leading
spaces before `>` keep a line ordinary, as does `>` in the middle of a sentence.

All-Chat's bold and italic controls can format greentext too. Detection uses the
visible line, so a bold leading pointer also works. URLs keep their normal link
behavior and external-link warning. HTML-looking input remains escaped text.

Numbered-post links and cross-board links are outside this change. Additional `>`
characters remain literal text, without navigation. All-Chat's existing Reply
action and clickable reply previews continue to reference messages.

## Implementation plan

1. Extend the shared message tokenizer and renderer with per-line greentext.
2. Apply the same rule through temporary Tiptap decorations while composing and
   editing, including Shift+Enter hard breaks and pasted paragraphs.
3. Add a concise composer hint and keep formatting consistent with ad previews,
   which use the same editor serialization and message renderer.
4. Preserve whitespace on send/edit and use readable green shades for light/dark
   themes and custom message bubble colors.
5. Verify with TypeScript compilation and a production build, following the
   workspace instruction not to create or run tests.

## Usage

```text
>This line is green.
> This one is green too.

This paragraph uses the normal text color.
2 > 1 also stays normal.
```

In chat, use Shift+Enter for a new line and Enter to send. Each new line needs its
own `>`; a wrapped line stays green until an actual newline. Deleting the initial
pointer removes the color immediately. Editing restores the same visible text.

## Storage and rendering

Greentext uses the existing plain marker string; no new API fields, database
columns, stored rich-text marks, or backend migration are required. The literal
pointer counts toward the existing message length limit. Existing messages gain
formatting when displayed by the updated client.

The shared renderer covers public/private chat, searches, promoted messages,
history and observer views, and ads. Compact reply snippets remain plain text.
Greentext and ordinary bubble text share the same brightness rule:
`(299 × red + 587 × green + 114 × blue) / 1000 > 128`. When ordinary text
would be black, greentext uses dark green (`#166534`); when it would be white,
greentext uses bright green (`#86efac`). Chat and ad bubbles use the same shared
helper. The composer and uncolored display surfaces use these shades for their
light and dark themes, respectively. The green never blends toward black or
white. The existing brightness heuristic does not guarantee a specific contrast
ratio on every custom background.

## Verification

- `npx tsc --noEmit --incremental false` passed.
- Next.js production build passed, including type checking and generation of all
  29 static pages. It ran against an isolated source copy to leave the active dev
  server's build directory intact.
- `git diff --check` passed. No automated tests were created or run, per workspace
  instructions; runtime interaction has not been manually verified.
- Follow-up: green variants now use the exact shared black/white brightness rule.
  Verification uses compile checks only; no manual browser debugging.
