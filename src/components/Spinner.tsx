import {Loader2} from "lucide-react";

export function Spinner({size = 40, className}: { size?: number, className?: string }) {
    return <Loader2 className={`animate-spin text-muted-foreground ${className}`} size={size}/>;
}