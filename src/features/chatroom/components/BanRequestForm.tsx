"use client";

import React from "react";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {BanRequest} from "@/models/BanRequest";
import {ReportType} from "@/models/ReportTypeEnum";
import {getReportTypeLabel} from "@/lib/reportUtils";
import {ReportTypeUtils} from "@/lib/utils";

const durationOptions = ["1h", "1d", "7d", "30d"];
const deleteDurationOptions = ["1h", "1d", "7d", "30d"];
const topLevelReportTypes = ReportTypeUtils.getTopLevel();
const standaloneReportTypes = topLevelReportTypes.filter(
    (reportType) => ReportTypeUtils.getChildren(reportType).length === 0
);
const groupedReportTypes = topLevelReportTypes
    .map((reportType) => ({
        label: getReportTypeLabel(reportType),
        options: ReportTypeUtils.getChildren(reportType),
    }))
    .filter((group) => group.options.length > 0);
const isSelectableReportType = (reportType: ReportType) => ReportTypeUtils.getChildren(reportType).length === 0;

interface BanRequestFormProps {
    userId: string;
    onClose?: () => void;
    reportCaseId?: number;
    defaultReportType?: ReportType;
    onSubmit: (banRequest: BanRequest) => Promise<void>;
    isSubmitting?: boolean;
}

export default function BanRequestForm({
                                           userId,
                                           onClose,
                                           reportCaseId,
                                           defaultReportType,
                                           onSubmit,
                                           isSubmitting = false
                                       }: BanRequestFormProps) {
    const initialReportType = defaultReportType && isSelectableReportType(defaultReportType)
        ? defaultReportType
        : ReportType.SPAMMING_ADVERTISING_BEGGING;

    const form = useForm<BanRequest & {
        durationSelection?: string;
        deleteMessagesDurationSelection?: string;
        customDuration?: number;
        customDeleteDuration?: number;
    }>({
        defaultValues: {
            userId,
            banType: BanTypeEnum.PERMANENT,
            reportType: initialReportType,
            description: "",
            deleteMessages: false,
        }
    });

    const watchBanType = form.watch("banType");
    const watchDeleteMessages = form.watch("deleteMessages");
    const watchDurationSelection = form.watch("durationSelection");
    const watchDeleteMessagesDurationSelection = form.watch("deleteMessagesDurationSelection");

    const handleSubmit = async (data: BanRequest) => {
        const banRequest: BanRequest = {
            userId: data.userId,
            banType: data.banType,
            reportType: data.reportType,
            deleteMessages: data.deleteMessages,
        };
        const description = data.description?.trim();

        if (description) {
            banRequest.description = description;
        }

        if (reportCaseId !== undefined) {
            banRequest.reportCaseId = reportCaseId;
        }

        if (data.banType === BanTypeEnum.PERMANENT) {
            banRequest.duration = undefined;
        } else {
            const durationSelection = form.getValues("durationSelection");
            if (durationSelection === "other") {
                const customDuration = form.getValues("customDuration");
                banRequest.duration = customDuration ? customDuration * 60 : undefined;
            } else {
                banRequest.duration = durationSelection ? convertDurationToMinutes(durationSelection) : 0;
            }
        }

        if (data.deleteMessages) {
            const deleteDurationSelection = form.getValues("deleteMessagesDurationSelection");
            if (deleteDurationSelection === "all") {
                banRequest.deleteMessagesDuration = undefined;
            } else if (deleteDurationSelection === "other") {
                const customDeleteDuration = form.getValues("customDeleteDuration");
                banRequest.deleteMessagesDuration = customDeleteDuration ? customDeleteDuration * 60 : undefined;
            } else {
                banRequest.deleteMessagesDuration = deleteDurationSelection ? convertDurationToMinutes(deleteDurationSelection) : 0;
            }
        }

        try {
            await onSubmit(banRequest);
            form.reset();
            if (onClose) {
                onClose();
            }
        } catch (error) {
            // Error handling is now the responsibility of the parent
            console.error("Failed to submit ban request:", error);
        }
    };

    const convertDurationToMinutes = (duration: string): number => {
        switch (duration) {
            case "1h":
                return 60 * 60;
            case "1d":
                return 24 * 60 * 60;
            case "7d":
                return 7 * 24 * 60 * 60;
            case "30d":
                return 30 * 24 * 60 * 60;
            default:
                return 0;
        }
    };

    return (
        <div className="p-2 w-[80vw] md:w-[500px]">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                    <FormField
                        control={form.control}
                        name="banType"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Ban Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ban type"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(BanTypeEnum).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {watchBanType === BanTypeEnum.TEMPORARY && (
                        <FormField
                            control={form.control}
                            name="durationSelection"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Duration</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select duration"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {durationOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    )}

                    {watchBanType === BanTypeEnum.TEMPORARY && watchDurationSelection === "other" && (
                        <FormField
                            control={form.control}
                            name="customDuration"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Duration (minutes)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter duration in minutes..."
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value) || undefined;
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="reportType"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Report Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select report type"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-80">
                                        <SelectGroup>
                                            <SelectLabel>Report Types</SelectLabel>
                                            {standaloneReportTypes.map((reportType) => (
                                                <SelectItem key={reportType} value={reportType}>
                                                    {getReportTypeLabel(reportType)}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>

                                        {groupedReportTypes.map((group) => (
                                            <React.Fragment key={group.label}>
                                                <SelectSeparator/>
                                                <SelectGroup>
                                                    <SelectLabel>{group.label}</SelectLabel>
                                                    {group.options.map((reportType) => (
                                                        <SelectItem key={reportType} value={reportType}
                                                                    className="pl-4">
                                                            {getReportTypeLabel(reportType)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </React.Fragment>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Ban Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Add moderator context for this ban..."
                                        className="min-h-24"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="deleteMessages"
                        render={({field}) => (
                            <FormItem className="flex items-center justify-between">
                                <FormLabel>Delete Messages</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {watchDeleteMessages && (
                        <FormField
                            control={form.control}
                            name="deleteMessagesDurationSelection"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Delete Messages From</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select duration"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {deleteDurationOptions.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    Last {opt}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="all">Delete All</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    )}

                    {watchDeleteMessages && watchDeleteMessagesDurationSelection === "other" && (
                        <FormField
                            control={form.control}
                            name="customDeleteDuration"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Delete Messages Duration (minutes)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter duration in minutes..."
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value) || undefined;
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    )}

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Ban'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
