import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import {AppProviders} from "@/components/providers/AppProviders";
import {AppShell} from "@/components/AppShell";
import RouteProgressBar from "@/components/RouteProgressBar";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});
// Normalize visible letter bodies against the default system sans (about 0.52em).
// Values use measured outlines, not unreliable font metadata; see fonts/README.md.
// Keep the system fallback at its native size until each optional face loads.
const proRoboto = localFont({
    src: [
        {path: './fonts/RobotoVariable.woff2', weight: '100 900', style: 'normal'},
        {path: './fonts/RobotoVariable-Italic.woff2', weight: '100 900', style: 'italic'},
    ],
    variable: '--font-pro-roboto',
    declarations: [{prop: 'size-adjust', value: '97%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proPetitFormalScript = localFont({
    src: './fonts/PetitFormalScript-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-petit-formal-script',
    declarations: [{prop: 'size-adjust', value: '87%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proItalianno = localFont({
    src: './fonts/Italianno-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-italianno',
    declarations: [{prop: 'size-adjust', value: '178%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proKablammo = localFont({
    src: './fonts/KablammoVariable.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-kablammo',
    declarations: [{prop: 'size-adjust', value: '95%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proCraftyGirls = localFont({
    src: './fonts/CraftyGirls-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-crafty-girls',
    declarations: [{prop: 'size-adjust', value: '92%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proEmilysCandy = localFont({
    src: './fonts/EmilysCandy-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-emilys-candy',
    declarations: [{prop: 'size-adjust', value: '101%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proEvelyne = localFont({
    src: './fonts/Evelyne-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-evelyne',
    declarations: [{prop: 'size-adjust', value: '181%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proMessyHandwritten = localFont({
    src: './fonts/MessyHandwritten-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-messy-handwritten',
    declarations: [{prop: 'size-adjust', value: '156%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proLoveLight = localFont({
    src: './fonts/LoveLight-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-love-light',
    declarations: [{prop: 'size-adjust', value: '147%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proClickerScript = localFont({
    src: './fonts/ClickerScript-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-clicker-script',
    declarations: [{prop: 'size-adjust', value: '154%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proTangerine = localFont({
    src: [
        {path: './fonts/Tangerine-Regular.woff2', weight: '400', style: 'normal'},
        {path: './fonts/Tangerine-Bold.woff2', weight: '700', style: 'normal'},
    ],
    variable: '--font-pro-tangerine',
    declarations: [{prop: 'size-adjust', value: '203%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proSahirYesta = localFont({
    src: './fonts/SahirYesta-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-sahir-yesta',
    declarations: [{prop: 'size-adjust', value: '105%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proGistaDanes = localFont({
    src: './fonts/GistaDanes-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-gista-danes',
    declarations: [{prop: 'size-adjust', value: '185%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proAYummyApology = localFont({
    src: './fonts/AYummyApology-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-a-yummy-apology',
    declarations: [{prop: 'size-adjust', value: '171%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proPrincessSofia = localFont({
    src: './fonts/PrincessSofia-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-pro-princess-sofia',
    declarations: [{prop: 'size-adjust', value: '105%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const proRainKiss = localFont({
    src: [
        {path: './fonts/RainKiss-Regular.woff2', weight: '400', style: 'normal'},
        {path: './fonts/RainKiss-Italic.woff2', weight: '400', style: 'italic'},
    ],
    variable: '--font-pro-rain-kiss',
    declarations: [{prop: 'size-adjust', value: '89%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});

// Defining optional faces globally lets chat messages use them on every route.
// preload: false keeps their binaries on demand, including picker previews.
const proFontVariables = [
    proRoboto, proPetitFormalScript, proItalianno, proKablammo, proCraftyGirls,
    proEmilysCandy, proEvelyne, proMessyHandwritten, proLoveLight, proClickerScript,
    proTangerine, proSahirYesta, proGistaDanes, proAYummyApology, proPrincessSofia, proRainKiss,
].map(font => font.variable).join(' ');

export const metadata: Metadata = {
    title: "allchat – For all conversations",
    description: "Join allchat and dive into conversations on any topic that interests you. It's your space to chat, connect, and explore ideas with others.",
    icons: {
        // Default favicon for SSR / first paint — also what Safari and bookmark
        // caches keep, since they ignore the runtime swap. AppInitializer swaps
        // this to /icon_dark.png at runtime when dark mode is selected.
        icon: [
            {url: "/icon_light.png", type: "image/png"},
        ]
    }
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full">
        {/* Extensions such as ColorZilla add body attributes before hydration.
            Suppress warnings on this element; descendants are still checked. */}
        <body
            className={`${geistSans.variable} ${geistMono.variable} ${proFontVariables} app-background flex flex-col h-full`}
            suppressHydrationWarning
        >
        <RouteProgressBar/>
        <AppProviders>
            <AppShell>
                {children}
            </AppShell>
        </AppProviders>
        </body>
        </html>
    );
}
