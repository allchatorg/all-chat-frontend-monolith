"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle, ShieldAlert} from "lucide-react";
import {
    NcmecFileAnnotation,
    NcmecFileAnnotationLabels,
    NcmecIncidentType,
    NcmecIncidentTypeDescriptions,
    NcmecReportAnnotation,
    NcmecReportAnnotationLabels,
    NcmecReportRequest,
} from "@/models/NcmecReportRequest";

interface NcmecReportFormProps {
    reportCaseId: number;
    hasAttachments: boolean;
    onSubmit: (request: NcmecReportRequest) => Promise<void>;
    onClose?: () => void;
}

export default function NcmecReportForm({
                                            reportCaseId,
                                            hasAttachments,
                                            onSubmit,
                                            onClose,
                                        }: NcmecReportFormProps) {
    const [incidentType, setIncidentType] = useState<NcmecIncidentType | "">("");
    const [reportAnnotations, setReportAnnotations] = useState<NcmecReportAnnotation[]>([]);
    const [fileAnnotations, setFileAnnotations] = useState<NcmecFileAnnotation[]>([]);
    const [confirmed, setConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleReportAnnotation = (annotation: NcmecReportAnnotation) => {
        setReportAnnotations((prev) =>
            prev.includes(annotation)
                ? prev.filter((a) => a !== annotation)
                : [...prev, annotation]
        );
    };

    const toggleFileAnnotation = (annotation: NcmecFileAnnotation) => {
        setFileAnnotations((prev) =>
            prev.includes(annotation)
                ? prev.filter((a) => a !== annotation)
                : [...prev, annotation]
        );
    };

    const isValid =
        incidentType !== "" &&
        confirmed;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || isSubmitting) return;

        const request: NcmecReportRequest = {
            reportCaseId,
            incidentType: incidentType as NcmecIncidentType,
            reportAnnotations,
            ...(hasAttachments && fileAnnotations.length > 0
                ? {fileAnnotations}
                : {}),
        };

        setIsSubmitting(true);
        try {
            await onSubmit(request);
        } catch {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-[85vw] md:w-[600px] max-h-[80vh] overflow-y-auto p-2 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500"/>
                <h2 className="text-lg font-semibold">Submit NCMEC Report</h2>
            </div>

            {/* Warning Banner */}
            <Alert className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400"/>
                <AlertDescription className="text-red-800 dark:text-red-300 text-sm space-y-2">
                    <p className="font-semibold">
                        This is an irreversible action. Please read carefully before proceeding.
                    </p>
                    <p>
                        <strong>NCMEC</strong> (National Center for Missing & Exploited Children) is
                        the U.S. national clearinghouse and reporting center for child exploitation.
                        Electronic service providers are legally required to report apparent
                        violations to NCMEC under federal law (18 U.S.C. § 2258A).
                    </p>
                    <p>Submitting this report will:</p>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                        <li>
                            <strong>Send a formal CyberTipline report to NCMEC</strong> containing
                            the incident details, user information, and any file attachments
                        </li>
                        <li>
                            <strong>Permanently ban and delete the reported user</strong> from the
                            platform, including all of their messages
                        </li>
                        <li>
                            <strong>Log the action</strong> in the audit trail for compliance and
                            record-keeping purposes
                        </li>
                    </ul>
                    <p className="font-medium">
                        This action cannot be undone. The report will be filed with law enforcement.
                    </p>
                </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Incident Type */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Incident Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={incidentType}
                        onValueChange={(val) => setIncidentType(val as NcmecIncidentType)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select incident type..."/>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(NcmecIncidentType).map((type) => (
                                <SelectItem key={type} value={type}>
                                    {NcmecIncidentTypeDescriptions[type]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Report Annotations */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Report Annotations
                    </Label>
                    <p className="text-xs text-muted-foreground">Optional — select any that apply.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.values(NcmecReportAnnotation).map((annotation) => (
                            <div
                                key={annotation}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={`report-${annotation}`}
                                    checked={reportAnnotations.includes(annotation)}
                                    onCheckedChange={() => toggleReportAnnotation(annotation)}
                                />
                                <Label
                                    htmlFor={`report-${annotation}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {NcmecReportAnnotationLabels[annotation]}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* File Annotations — only when message has attachments */}
                {hasAttachments && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">File Annotations</Label>
                        <p className="text-xs text-muted-foreground">
                            Optional — select any that apply to the attached files.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.values(NcmecFileAnnotation).map((annotation) => (
                                <div
                                    key={annotation}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`file-${annotation}`}
                                        checked={fileAnnotations.includes(annotation)}
                                        onCheckedChange={() => toggleFileAnnotation(annotation)}
                                    />
                                    <Label
                                        htmlFor={`file-${annotation}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {NcmecFileAnnotationLabels[annotation]}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirmation Checkbox */}
                <div
                    className="flex items-start space-x-3 rounded-md border border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 p-3">
                    <Checkbox
                        id="ncmec-confirm"
                        checked={confirmed}
                        onCheckedChange={(checked) => setConfirmed(checked === true)}
                        className="mt-0.5"
                    />
                    <Label
                        htmlFor="ncmec-confirm"
                        className="text-sm font-medium leading-snug cursor-pointer text-red-800 dark:text-red-300"
                    >
                        I am absolutely certain that I want to proceed with this action. I
                        understand that a report will be submitted to NCMEC, the user will be
                        permanently banned and deleted, and this action cannot be reversed.
                    </Label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-1">
                    {onClose && (
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="destructive"
                        disabled={!isValid || isSubmitting}
                    >
                        {isSubmitting ? "Submitting Report…" : "Submit NCMEC Report"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
