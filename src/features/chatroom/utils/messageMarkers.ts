// Parser/serializer for the chat formatting wire format: **bold**, *italic*,
// ***bold italic***. Message content is stored on the backend as this plain
// marker string (max 500 chars); the composer works on rich text and converts
// through these helpers. Markers never pair across newlines.

export interface Segment {
    text: string;
    bold: boolean;
    italic: boolean;
    isUrl: boolean;
}

// Must stay identical to the URL regex previously used by linkifyText/extractUrls.
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

interface AsteriskRun {
    start: number;
    length: number;
    canOpen: boolean;
    canClose: boolean;
}

interface UrlRange {
    start: number;
    end: number;
}

function findUrlRanges(line: string): UrlRange[] {
    const ranges: UrlRange[] = [];
    for (const match of line.matchAll(URL_REGEX)) {
        let end = match.index + match[0].length;
        // Trailing asterisks belong to formatting (e.g. **https://x.com**),
        // never to the URL — trim them so hrefs stay clean.
        while (end > match.index && line[end - 1] === "*") end--;
        if (end > match.index) ranges.push({ start: match.index, end });
    }
    return ranges;
}

function tokenizeLine(line: string): Segment[] {
    const urlRanges = findUrlRanges(line);
    const inUrl = (i: number) => urlRanges.some((r) => i >= r.start && i < r.end);

    // Collect asterisk runs outside URLs with their flanking properties.
    const runs: AsteriskRun[] = [];
    for (let i = 0; i < line.length; ) {
        if (line[i] === "*" && !inUrl(i)) {
            let j = i;
            while (j < line.length && line[j] === "*" && !inUrl(j)) j++;
            const prev = i > 0 ? line[i - 1] : "";
            const next = j < line.length ? line[j] : "";
            runs.push({
                start: i,
                length: j - i,
                canOpen: next !== "" && !/\s/.test(next),
                canClose: prev !== "" && !/\s/.test(prev),
            });
            i = j;
        } else {
            i++;
        }
    }

    const boldPart = (len: number) => len === 2 || len >= 3;
    const italicPart = (len: number) => len === 1 || len >= 3;

    const segments: Segment[] = [];
    let bold = false;
    let italic = false;

    const push = (text: string, isUrl: boolean) => {
        if (!text) return;
        const last = segments[segments.length - 1];
        if (last && !isUrl && !last.isUrl && last.bold === bold && last.italic === italic) {
            last.text += text;
        } else {
            segments.push({ text, bold, italic, isUrl });
        }
    };

    let runIdx = 0;
    for (let i = 0; i < line.length; ) {
        const url = urlRanges.find((r) => r.start === i);
        if (url) {
            push(line.slice(url.start, url.end), true);
            i = url.end;
            continue;
        }
        const run = runs[runIdx]?.start === i ? runs[runIdx] : undefined;
        if (!run) {
            push(line[i], false);
            i++;
            continue;
        }
        runIdx++;
        let literal = run.length >= 3 ? run.length - 3 : 0;
        const closerExists = (part: (len: number) => boolean) =>
            runs.slice(runIdx).some((r) => part(r.length) && r.canClose);

        if (boldPart(run.length)) {
            if (bold && run.canClose) bold = false;
            else if (!bold && run.canOpen && closerExists(boldPart)) bold = true;
            else literal += run.length >= 3 ? 2 : run.length;
        }
        if (italicPart(run.length)) {
            if (italic && run.canClose) italic = false;
            else if (!italic && run.canOpen && closerExists(italicPart)) italic = true;
            else literal += run.length >= 3 ? 1 : run.length;
        }
        // Literal asterisks render in the surrounding style; emitting them after
        // the toggle keeps openers ahead of the text they format.
        push("*".repeat(literal), false);
        i = run.start + run.length;
    }

    return segments;
}

export function tokenize(text: string): Segment[] {
    const segments: Segment[] = [];
    const lines = text.split("\n");
    lines.forEach((line, idx) => {
        segments.push(...tokenizeLine(line));
        if (idx < lines.length - 1) {
            const last = segments[segments.length - 1];
            if (last && !last.isUrl && !last.bold && !last.italic) last.text += "\n";
            else segments.push({ text: "\n", bold: false, italic: false, isUrl: false });
        }
    });
    return segments;
}

export function stripMarkers(text: string): string {
    return tokenize(text)
        .map((s) => s.text)
        .join("");
}

export function extractFormattedUrls(text: string): string[] {
    return tokenize(text)
        .filter((s) => s.isUrl)
        .map((s) => s.text);
}

// --- ProseMirror (Tiptap) JSON <-> marker string ---

interface PmMark {
    type: string;
}

interface PmNode {
    type: string;
    text?: string;
    marks?: PmMark[];
    content?: PmNode[];
}

interface StyledRun {
    text: string;
    bold: boolean;
    italic: boolean;
}

// Serializes one line of styled runs by emitting toggle markers — exactly the
// grammar tokenize() reads back: a run of 2 asterisks toggles bold, 1 toggles
// italic, 3 toggle both. Wrapping each run independently and concatenating is
// NOT safe: adjacent differently-styled runs would fuse into runs of 4+
// asterisks, which tokenize() reads as *** plus literal stars.
function serializeLine(runs: StyledRun[]): string {
    let out = "";
    let bold = false;
    let italic = false;
    const toggleTo = (b: boolean, i: boolean) => {
        out += "*".repeat((bold !== b ? 2 : 0) + (italic !== i ? 1 : 0));
        bold = b;
        italic = i;
    };
    for (const run of runs) {
        const m = run.text.match(/^(\s*)([\s\S]*?)(\s*)$/);
        const [, lead, core, trail] = m as RegExpMatchArray;
        if (!core) {
            // Whitespace-only: styling is invisible, and closers must not
            // trail whitespace — close everything first.
            toggleTo(false, false);
            out += run.text;
            continue;
        }
        // Flanking rules: closers must sit after text, openers before it.
        // Drop open-but-unwanted formats before the gap, open the rest after.
        // With no gap the two emissions fuse into one valid toggle run (≤3).
        toggleTo(bold && run.bold, italic && run.italic);
        out += lead;
        toggleTo(run.bold, run.italic);
        out += core;
        if (trail) toggleTo(false, false);
        out += trail;
    }
    toggleTo(false, false);
    return out;
}

function serializeParagraph(nodes: PmNode[]): string {
    const runs: StyledRun[] = [];
    for (const node of nodes) {
        const text = node.type === "hardBreak" ? "\n" : node.text ?? "";
        if (!text) continue;
        // Whitespace-only nodes render identically unstyled — treat as plain.
        const styled = node.type !== "hardBreak" && /\S/.test(text);
        const bold = styled && !!node.marks?.some((m) => m.type === "bold");
        const italic = styled && !!node.marks?.some((m) => m.type === "italic");
        const last = runs[runs.length - 1];
        if (last && last.bold === bold && last.italic === italic) last.text += text;
        else runs.push({ text, bold, italic });
    }
    // Marker pairs must not span a hard break — serialize per line.
    const lines: StyledRun[][] = [[]];
    for (const run of runs) {
        run.text.split("\n").forEach((part, idx) => {
            if (idx > 0) lines.push([]);
            if (part) lines[lines.length - 1].push({ ...run, text: part });
        });
    }
    return lines.map(serializeLine).join("\n");
}

export function docToMarkers(doc: PmNode): string {
    const paragraphs = doc.content ?? [];
    return paragraphs
        .map((p) => (p.type === "paragraph" ? serializeParagraph(p.content ?? []) : ""))
        .join("\n");
}

export function markersToDoc(text: string): PmNode {
    const paragraphs = text.split("\n").map((line): PmNode => {
        const content = tokenizeLine(line)
            .filter((s) => s.text)
            .map((s): PmNode => {
                const marks: PmMark[] = [];
                if (s.bold) marks.push({ type: "bold" });
                if (s.italic) marks.push({ type: "italic" });
                return {
                    type: "text",
                    text: s.text,
                    ...(marks.length ? { marks } : {}),
                };
            });
        return { type: "paragraph", ...(content.length ? { content } : {}) };
    });
    return { type: "doc", content: paragraphs };
}
