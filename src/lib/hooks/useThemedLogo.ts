import {useEffect, useState} from "react";
import {useTheme} from "next-themes";

/**
 * Resolves the brand logo to the theme-specific asset: the light logo in light
 * mode, the dark logo otherwise. Falls back to the dark logo until the theme
 * resolves on the client so server and first client render agree (no hydration
 * mismatch / flicker).
 */
export function useThemedLogo(): string {
    const {resolvedTheme} = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return mounted && resolvedTheme === "light"
        ? "/allchat_light_logo.png"
        : "/allchat_dark_logo.png";
}
