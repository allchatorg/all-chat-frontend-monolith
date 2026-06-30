"use client";

import {ThemeProvider} from "./ThemeProvider";

import {ReactNode} from "react";
import {Provider} from "react-redux";
import {persistor, store} from "@/redux/store";
import {DialogProvider} from "./DialogProvider";
import {MediaOverlayProvider} from "./MediaOverlayProvider";
import {PersistGate} from "redux-persist/integration/react";
import {VerificationBlockingOverlay} from "@/components/VerificationBlockingOverlay";
import {SplashOffline} from "@/components/SplashOffline";

export function AppProviders({children}: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <MediaOverlayProvider>
                        <DialogProvider>
                            <VerificationBlockingOverlay>
                                <SplashOffline/>
                                {children}
                            </VerificationBlockingOverlay>
                        </DialogProvider>
                    </MediaOverlayProvider>
                </ThemeProvider>
            </PersistGate>
        </Provider>
    );
}
