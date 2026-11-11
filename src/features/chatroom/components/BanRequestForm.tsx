"use client";

import React from "react";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
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
import {getReportTypeLabel, isCsamReportType} from "@/lib/reportUtils";
import {ReportTypeUtils} from "@/lib/utils";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Ban} from "@/models/Ban";
import {describeBan, useActiveBan} from "@/lib/hooks/useActiveBan";
import BanAdsPurchaseInfo from "./BanAdsPurchaseInfo";

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

// The form's defaults and choices depend on the ban the user already has, so it opens once that is known.
export default function BanRequestForm(props: BanRequestFormProps) {
    const currentBan = useActiveBan(Number(props.userId));

    if (currentBan === undefined) {
        return <div className="p-2 w-[80vw] md:w-[500px] text-sm text-muted-foreground">Loading...</div>;
    }

    return <BanRequestFormFields {...props} currentBan={currentBan}/>;
}

function BanRequestFormFields({
                                  userId,
                                  onClose,
                                  reportCaseId,
                                  defaultReportType,
                                  onSubmit,
                                  isSubmitting = false,
                                  currentBan
                              }: BanRequestFormProps & { currentBan: Ban | null }) {
    // A new ban replaces the current one and may not weaken it; the server refuses the same choices.
    const currentIsPermanent = currentBan?.type === BanTypeEnum.PERMANENT;
    const currentIsCsam = currentBan !== null && isCsamReportType(currentBan.reportType);
    const remainingSeconds = currentBan && !currentIsPermanent && currentBan.expiresAt
        ? Math.max(0, (new Date(currentBan.expiresAt).getTime() - Date.now()) / 1000)
        : 0;
    const isAllowedReportType = (reportType: ReportType) => !currentIsCsam || isCsamReportType(reportType);
    const allowedStandaloneReportTypes = standaloneReportTypes.filter(isAllowedReportType);
    const allowedGroupedReportTypes = groupedReportTypes
        .map((group) => ({...group, options: group.options.filter(isAllowedReportType)}))
        .filter((group) => group.options.length > 0);

    const allowedReportTypes = [
        ...allowedStandaloneReportTypes,
        ...allowedGroupedReportTypes.flatMap((group) => group.options)
    ];

    const preferredReportType = defaultReportType && isSelectableReportType(defaultReportType)
        ? defaultReportType
        : ReportType.SPAMMING_ADVERTISING_BEGGING;
    // The current ban's own type may be a group heading, which the list can't offer: then staff choose.
    // They also choose on a child-safety case: that type makes the ban final, so it is never pre-filled.
    const initialReportType = defaultReportType && isCsamReportType(defaultReportType)
        ? undefined
        : allowedReportTypes.includes(preferredReportType)
            ? preferredReportType
            : currentBan && allowedReportTypes.includes(currentBan.reportType)
                ? currentBan.reportType
                : undefined;

    const form = useForm<BanRequest & {
        durationSelection?: string;
        deleteMessagesDurationSelection?: string;
        customDuration?: number;
        customDeleteDuration?: number;
    }>({
        defaultValues: {
            userId,
            // Only a permanently banned user is left with a single choice; otherwise staff pick the type.
            banType: currentIsPermanent ? BanTypeEnum.PERMANENT : undefined,
            reportType: initialReportType,
            description: "",
            deleteMessages: false,
        }
    });

    const minimumMinutes = Math.max(1, Math.ceil(remainingSeconds / 60));

    const watchBanType = form.watch("banType");
    const watchReportType = form.watch("reportType");
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
                banRequest.deleteAllMessages = true;
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

                    {currentBan && (
                        <Alert className="border-amber-200 bg-amber-50">
                            <AlertDescription className="space-y-1 text-amber-800">
                                <p className="font-medium">Already banned {describeBan(currentBan)}.</p>
                                {currentBan.description && <p>Reason given: {currentBan.description}</p>}
                                <p>
                                    A new ban replaces this one and closes any open appeal on it. It can't be
                                    shorter or weaker: to shorten a ban, revoke it first.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    <BanAdsPurchaseInfo userId={userId} banType={watchBanType}
                                        deleteMessagesEnabled={watchDeleteMessages}/>

                    <FormField
                        control={form.control}
                        name="banType"
                        rules={{required: "Choose a ban type"}}
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
                                        {Object.values(BanTypeEnum)
                                            .filter((type) => !(currentIsPermanent && type === BanTypeEnum.TEMPORARY))
                                            .map((type) => (
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
                            rules={{required: "Choose how long the ban lasts"}}
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
                                                <SelectItem key={option} value={option}
                                                            disabled={convertDurationToMinutes(option) < remainingSeconds}>
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
                            rules={{
                                required: "Enter how many minutes the ban lasts",
                                min: {
                                    value: minimumMinutes,
                                    message: minimumMinutes > 1
                                        ? `The current ban runs longer. Enter at least ${minimumMinutes} minutes`
                                        : "Enter at least 1 minute"
                                }
                            }}
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
                        rules={{required: "Choose a report type"}}
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
                                        {allowedStandaloneReportTypes.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel>Report Types</SelectLabel>
                                                {allowedStandaloneReportTypes.map((reportType) => (
                                                    <SelectItem key={reportType} value={reportType}>
                                                        {getReportTypeLabel(reportType)}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}

                                        {allowedGroupedReportTypes.map((group, index) => (
                                            <React.Fragment key={group.label}>
                                                {(index > 0 || allowedStandaloneReportTypes.length > 0) && <SelectSeparator/>}
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
                                {watchReportType && isCsamReportType(watchReportType) && (
                                    <FormDescription className="text-amber-700">
                                        A ban with a child-safety type can&apos;t be revoked or appealed, and a
                                        temporary one doesn&apos;t end on its own.
                                    </FormDescription>
                                )}
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        rules={{validate: (value) => Boolean(value?.trim()) || "Describe why the user is banned"}}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Ban Description</FormLabel>
                                <FormDescription>
                                    The banned user sees this text word for word.
                                </FormDescription>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell the user why they are banned..."
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
                            rules={{required: "Choose which messages to delete"}}
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
                            rules={{
                                required: "Enter how many minutes of messages to delete",
                                min: {value: 1, message: "Enter at least 1 minute"}
                            }}
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
                        {isSubmitting ? 'Submitting...' : currentBan ? 'Replace Ban' : 'Submit Ban'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
