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

export const metadata: Metadata = {
    title: "allchat – For all conversations",
    description: "Join allchat and dive into conversations on any topic that interests you. It's your space to chat, connect, and explore ideas with others.",
    icons: {
        // Default favicon for SSR / first paint. AppInitializer swaps this to
        // /icon_light.png at runtime when light mode is selected.
        icon: [
            {url: "/icon_dark.png", type: "image/png"},
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
        <body className={`${geistSans.variable} ${geistMono.variable} app-background flex flex-col h-full`}>
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
