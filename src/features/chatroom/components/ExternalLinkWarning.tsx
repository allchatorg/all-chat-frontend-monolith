import {useState} from "react";
import {ExternalLink} from "lucide-react";
import {Button, buttonVariants} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";
import {getHostname, trustDomain} from "@/features/chatroom/utils/externalLinks";

interface ExternalLinkWarningProps {
    url: string;
    onClose: () => void;
}

// "You're leaving allchat" interstitial, opened via useDialog().open(...) from
// FormattedMessageText for links whose domain is not on the trusted list.
const ExternalLinkWarning: React.FC<ExternalLinkWarningProps> = ({url, onClose}) => {
    const host = getHostname(url);
    const [trust, setTrust] = useState(false);

    const handleVisit = () => {
        if (trust && host) trustDomain(host);
        onClose();
    };

    return (
        <div className="max-w-md space-y-4">
            <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 shrink-0"/>
                <h2 className="text-lg font-semibold leading-none">Leaving allchat</h2>
            </div>

            <p className="text-sm text-muted-foreground">
                This link takes you to an external site that allchat doesn&apos;t control.
                Make sure you trust it before continuing.
            </p>

            <div className="rounded-md bg-muted p-3 space-y-1">
                {host && <p className="font-semibold break-all">{host}</p>}
                <p className="text-xs font-mono text-muted-foreground break-all">{url}</p>
            </div>

            {host && (
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="trust-domain"
                        checked={trust}
                        onCheckedChange={(checked) => setTrust(checked === true)}
                    />
                    <Label htmlFor="trust-domain" className="text-sm font-normal cursor-pointer">
                        Trust {host} — don&apos;t warn me again for this domain
                    </Label>
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                    Go back
                </Button>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({variant: "default"}))}
                    onClick={handleVisit}
                >
                    Visit site
                </a>
            </div>
        </div>
    );
};

export default ExternalLinkWarning;
