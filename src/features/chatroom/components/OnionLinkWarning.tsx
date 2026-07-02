import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {AlertTriangle, Shield} from "lucide-react";
import {Button} from "@/components/ui/button";

interface OnionLinkWarningProps {
    onClose: () => void;
}

const OnionLinkWarning: React.FC<OnionLinkWarningProps> = ({onClose}) => {
    return (
        <div className=" max-w-md">
            <Alert variant="destructive" className="border-0">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5"/>
                    <AlertTitle className="text-lg font-semibold m-0 leading-none">
                        Invalid Link Detected
                    </AlertTitle>
                </div>
                <AlertDescription className="space-y-3">
                    <p className="text-sm">
                        Tor (.onion) links are not permitted in the chat for security and safety reasons.
                    </p>
                    <div className="flex items-start gap-2 text-sm bg-destructive/10 p-3 rounded-md">
                        <Shield className="h-4 w-4 mt-0.5 shrink-0"/>
                        <p>
                            Please remove the .onion link from your message before sending.
                        </p>
                    </div>
                </AlertDescription>
                <div className="mt-4 flex justify-end">
                    <Button onClick={onClose} variant="default">
                        Got it
                    </Button>
                </div>
            </Alert>
        </div>
    );
};

export default OnionLinkWarning;