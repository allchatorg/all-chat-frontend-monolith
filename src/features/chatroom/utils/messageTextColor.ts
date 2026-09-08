// Shared brightness rule for ordinary text and greentext on custom chat bubbles.
export function getMessageTextColor(background: string): "black" | "white" {
    const hex = background.replace(/^#/, "");
    const fullHex = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? "black" : "white";
}
