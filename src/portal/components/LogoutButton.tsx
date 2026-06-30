"use client";
import {Button} from "@ads/components/ui/button";
import {useRouter} from "next/navigation";
import {LogOut} from "lucide-react";
import {useDispatch} from "react-redux";
import type {AppDispatch} from "@/redux/store";
import {logoutThunk} from "@/redux/auth/authThunk";
import {useState} from "react";

interface LogoutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
}

export function LogoutButton({variant = "outline", className}: LogoutButtonProps) {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // Logging out of the shared session signs the user out of both
            // the chat app and the ads portal.
            await dispatch(logoutThunk());
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            router.push("/");
        }
    };

    return (
        <Button
            variant={variant}
            onClick={handleLogout}
            disabled={isLoading}
            className={className}
        >
            <LogOut className="mr-2 h-4 w-4"/>
            {isLoading ? "Logging out..." : "Logout"}
        </Button>
    );
}
