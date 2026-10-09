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
const vipRoboto = localFont({
    src: [
        {path: './fonts/RobotoVariable.woff2', weight: '100 900', style: 'normal'},
        {path: './fonts/RobotoVariable-Italic.woff2', weight: '100 900', style: 'italic'},
    ],
    variable: '--font-vip-roboto',
    declarations: [{prop: 'size-adjust', value: '97%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipPetitFormalScript = localFont({
    src: './fonts/PetitFormalScript-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-petit-formal-script',
    declarations: [{prop: 'size-adjust', value: '87%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipItalianno = localFont({
    src: './fonts/Italianno-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-italianno',
    declarations: [{prop: 'size-adjust', value: '178%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipKablammo = localFont({
    src: './fonts/KablammoVariable.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-kablammo',
    declarations: [{prop: 'size-adjust', value: '95%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipCraftyGirls = localFont({
    src: './fonts/CraftyGirls-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-crafty-girls',
    declarations: [{prop: 'size-adjust', value: '92%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipEmilysCandy = localFont({
    src: './fonts/EmilysCandy-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-emilys-candy',
    declarations: [{prop: 'size-adjust', value: '101%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipEvelyne = localFont({
    src: './fonts/Evelyne-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-evelyne',
    declarations: [{prop: 'size-adjust', value: '181%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipMessyHandwritten = localFont({
    src: './fonts/MessyHandwritten-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-messy-handwritten',
    declarations: [{prop: 'size-adjust', value: '156%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipLoveLight = localFont({
    src: './fonts/LoveLight-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-love-light',
    declarations: [{prop: 'size-adjust', value: '147%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipClickerScript = localFont({
    src: './fonts/ClickerScript-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-clicker-script',
    declarations: [{prop: 'size-adjust', value: '154%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipTangerine = localFont({
    src: [
        {path: './fonts/Tangerine-Regular.woff2', weight: '400', style: 'normal'},
        {path: './fonts/Tangerine-Bold.woff2', weight: '700', style: 'normal'},
    ],
    variable: '--font-vip-tangerine',
    declarations: [{prop: 'size-adjust', value: '203%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipSahirYesta = localFont({
    src: './fonts/SahirYesta-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-sahir-yesta',
    declarations: [{prop: 'size-adjust', value: '105%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipGistaDanes = localFont({
    src: './fonts/GistaDanes-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-gista-danes',
    declarations: [{prop: 'size-adjust', value: '185%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipAYummyApology = localFont({
    src: './fonts/AYummyApology-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-a-yummy-apology',
    declarations: [{prop: 'size-adjust', value: '171%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipPrincessSofia = localFont({
    src: './fonts/PrincessSofia-Regular.woff2',
    weight: '400',
    style: 'normal',
    variable: '--font-vip-princess-sofia',
    declarations: [{prop: 'size-adjust', value: '105%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});
const vipRainKiss = localFont({
    src: [
        {path: './fonts/RainKiss-Regular.woff2', weight: '400', style: 'normal'},
        {path: './fonts/RainKiss-Italic.woff2', weight: '400', style: 'italic'},
    ],
    variable: '--font-vip-rain-kiss',
    declarations: [{prop: 'size-adjust', value: '89%'}],
    adjustFontFallback: false,
    display: 'swap',
    preload: false,
});

// Defining optional faces globally lets chat messages use them on every route.
// preload: false keeps their binaries on demand, including picker previews.
const vipFontVariables = [
    vipRoboto, vipPetitFormalScript, vipItalianno, vipKablammo, vipCraftyGirls,
    vipEmilysCandy, vipEvelyne, vipMessyHandwritten, vipLoveLight, vipClickerScript,
    vipTangerine, vipSahirYesta, vipGistaDanes, vipAYummyApology, vipPrincessSofia, vipRainKiss,
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
            className={`${geistSans.variable} ${geistMono.variable} ${vipFontVariables} app-background flex flex-col h-full`}
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
