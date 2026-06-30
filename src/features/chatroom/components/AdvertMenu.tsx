import React from "react";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {EyeOff, MoreHorizontal} from "lucide-react";

interface AdvertMenuProps {
    onHide: () => void;
    disabled?: boolean;
}

export const AdvertMenu: React.FC<AdvertMenuProps> = ({onHide, disabled = false}) => {
    if (disabled) {
        return (
            <Button variant="outline" size="icon" disabled aria-label="Advert actions">
                <MoreHorizontal className="h-4 w-4"/>
            </Button>
        );
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                    className="justify-between"
                    onClick={onHide}
                >
                    Hide Ad
                    <EyeOff className="h-4 w-4"/>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
