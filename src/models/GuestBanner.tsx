import React from "react";
import {Button} from "@/components/ui/button";

interface GuestBannerProps {
    onRegisterAnonymous: () => void;
}

const GuestBanner: React.FC<GuestBannerProps> = ({onRegisterAnonymous}) => {
    return (
        <div className="border-t p-4  text-center rounded-md flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
                You are currently browsing as a guest. Please login or create an account to chat.
            </p>
            <div className="flex gap-2">
                <Button onClick={onRegisterAnonymous} size="sm">
                    Set Temporary Username or Login</Button>
            </div>
        </div>
    );
};

export default GuestBanner;
