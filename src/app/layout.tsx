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
const proInter = localFont({
    src: [
        {path: './fonts/InterVariable.woff2', weight: '100 900', style: 'normal'},
        {path: './fonts/InterVariable-Italic.woff2', weight: '100 900', style: 'italic'},
    ],
    variable: '--font-pro-inter',
    display: 'swap',
    preload: false,
});
const proOpenSans = localFont({
    src: [
        {path: './fonts/OpenSansVariable.ttf', weight: '300 800', style: 'normal'},
        {path: './fonts/OpenSansVariable-Italic.ttf', weight: '300 800', style: 'italic'},
    ],
    variable: '--font-pro-open-sans',
    display: 'swap',
    preload: false,
});

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
            className={`${geistSans.variable} ${geistMono.variable} ${proInter.variable} ${proOpenSans.variable} app-background flex flex-col h-full`}
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
