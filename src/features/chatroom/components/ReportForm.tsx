import {useState} from "react";
import {Button} from "@/components/ui/button";
import {CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {ReportType} from "@/models/ReportTypeEnum";
import {ReportTypeUtils} from "@/lib/utils";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {useDialog} from "@/components/providers/DialogProvider";
import {useThunk} from "@/lib/hooks/useThunk";
import {reportMessageThunk} from "@/redux/chatRoom/chatRoomThunk";
import {toast} from "sonner";
import {reportTypeLabels} from "@/lib/reportUtils";

export default function ReportForm({messageId}: { messageId: number }) {
    const [history, setHistory] = useState<ReportType[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState<"forward" | "backward">("forward");
    const [showMessage, setShowMessage] = useState(false);
    const [description, setDescription] = useState("");
    const {close} = useDialog();
    const [report, reportLoading] = useThunk(reportMessageThunk);

    const current = history[history.length - 1] || null;
    const children = current
        ? ReportTypeUtils.getChildren(current)
        : ReportTypeUtils.getTopLevel();
    const isLeaf = current && children.length === 0;

    const handleSelect = (item: ReportType) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setDirection("forward");

        setTimeout(() => {
            setHistory((h) => [...h, item]);
            setIsAnimating(false);
        }, 200);
    };

    const handleSubmitReport = async () => {
        if (!isLeaf || !current) return;
        try {
            await report({
                messageId,
                reportType: current,
                ...(showMessage && description.trim() ? {description: description.trim()} : {})
            });
            toast.success("Report was successfully submitted and will be reviewed by our team.");
        } catch {
            toast.error("An error occurred while submitting the report.");
        } finally {
            close();
        }
    }

    const handleBack = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setDirection("backward");

        setTimeout(() => {
            setHistory((h) => h.slice(0, -1));
            setIsAnimating(false);
        }, 200);
    };

    const getLabel = (type: ReportType) => reportTypeLabels[type].toUpperCase();

    return (
        <div className="glass-popover w-[80vw] md:min-w-[400px] md:max-w-[400px] flex flex-col flex-1 rounded-lg p-4">
            <div className="flex flex-1 flex-col w-full">
                <CardHeader className="p-0 mdf:p-6  pb-4">
                    <CardTitle className="text-xl">Report</CardTitle>
                </CardHeader>

                <CardContent
                    className="p-0 flex flex-1 flex-col justify-between min-h-[250px] max-h-[450px] w-full max-w-[400px] space-y-4">
                    <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
                        {!isLeaf ? (
                            <div
                                className={`space-y-2 ${isAnimating ? (direction === "forward" ? "animate-slide-out-left" : "animate-slide-out-right") : "animate-none"}`}>
                                {children.map((option) => {
                                    const hasChildren = ReportTypeUtils.getChildren(option).length > 0;
                                    return (
                                        <Button
                                            key={option}
                                            onClick={() => handleSelect(option)}
                                            variant="outline"
                                            className="glass-control w-full tex-wrap whitespace-normal h-12 justify-between text-left transition-colors duration-200"
                                            disabled={isAnimating}
                                        >
                                            <span>{getLabel(option)}</span>
                                            {hasChildren && <ChevronRight className="h-4 w-4"/>}
                                        </Button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div
                                className={`space-y-4 ${isAnimating ? (direction === "forward" ? "animate-slide-out-left" : "animate-slide-out-right") : "animate-none"}`}>
                                <div className="glass-surface rounded-lg p-4">
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        You are about to submit a report for:
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {current && getLabel(current)}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="add-message"
                                        checked={showMessage}
                                        onCheckedChange={(checked) => {
                                            setShowMessage(!!checked);
                                            if (!checked) setDescription("");
                                        }}
                                    />
                                    <Label
                                        htmlFor="add-message"
                                        className="text-sm font-medium text-foreground cursor-pointer"
                                    >
                                        Add additional description
                                    </Label>
                                </div>

                                {showMessage && (
                                    <div className="space-y-2">
                                        <Textarea
                                            placeholder="Enter a detailed description (max 500 characters)..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            maxLength={500}
                                            className="glass-input min-h-[100px] resize-none focus-visible:ring-1"
                                        />
                                        <div className="text-right text-xs text-muted-foreground">
                                            {description.length}/500
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isAnimating || reportLoading}
                                    onClick={handleSubmitReport}
                                >
                                    {reportLoading ? "Reporting..." : "Submit Report"}
                                </Button>
                            </div>
                        )}

                        {isAnimating && (
                            <div
                                className={`absolute inset-0 ${direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"}`}/>
                        )}
                    </div>

                    {history.length > 0 && (
                        <div className="border-t pt-4">
                            <Button
                                onClick={handleBack}
                                variant="ghost"
                                size="sm"
                                className="glass-control transition-colors duration-200"
                                disabled={isAnimating}
                            >
                                <ChevronLeft className="h-4 w-4"/> Back
                            </Button>
                        </div>
                    )}
                </CardContent>
            </div>
        </div>
    );
}
