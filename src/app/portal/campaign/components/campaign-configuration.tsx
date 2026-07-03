'use client';

import {useCallback, useEffect} from "react";
import {CampaignDetails, ValidationErrors} from "@ads/hooks/use-campaign-creator";
import {CheckCircle2, ChevronLeft, FileText, Image as ImageIcon, Info, Loader2, Play, Upload, X} from "lucide-react";

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Tooltip, TooltipContent, TooltipTrigger} from "@ads/components/ui/tooltip";
import {Input} from "@ads/components/ui/input";
import {Textarea} from "@ads/components/ui/textarea";
import {Button} from "@ads/components/ui/button";
import {ActionButton} from "@ads/components/ui/action-button";
import CostEstimationCard from "./cost-estimation-card";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@ads/components/ui/form";
import {AdFormatDto, AdFormatType} from "@ads/data/adFormats";
import {MAX_CHAR_COUNT} from "@ads/utils/pricing-utils";
import {useUploadFileMutation} from "@ads/store/services/fileApi";
import {toast} from "sonner";
import CampaignPreviewCta from "@/app/portal/campaign/components/campaign-preview-cta";
import {canPreviewAd, PreviewAdData, resolvePreviewAttachmentUrl} from "@ads/components/ad-preview/preview-utils";

interface CampaignConfigurationProps {
    selectedFormat: AdFormatDto;
    details: CampaignDetails;
    setDetails: (value: React.SetStateAction<CampaignDetails>) => void;
    errors: ValidationErrors;
    adFormats: AdFormatDto[];
    onNext: () => void;
    onBack: () => void;
}

export default function CampaignConfiguration({
                                                  selectedFormat,
                                                  details,
                                                  setDetails,
                                                  adFormats,
                                                  onNext,
                                                  onBack
                                              }: CampaignConfigurationProps) {

    // Dynamic schema based on selectedFormat.type
    const schema = z.object({
        name: z.string().min(1, "Campaign name is required"),
        text: selectedFormat.type === AdFormatType.TEXT
            ? z.string().min(1, "Ad text content is required").max(MAX_CHAR_COUNT, `Max ${MAX_CHAR_COUNT} characters`)
            : z.string().max(MAX_CHAR_COUNT, `Max ${MAX_CHAR_COUNT} characters`).optional(),
        media: selectedFormat.type !== AdFormatType.TEXT
            ? z.custom<File>((val) => val instanceof File, "Media is required").or(z.null())
            : z.any().optional(),
        mediaUrl: selectedFormat.type !== AdFormatType.TEXT
            ? z.string().nullable()
            : z.string().nullable().optional(),
        mediaKey: selectedFormat.type !== AdFormatType.TEXT
            ? z.string().nullable()
            : z.string().nullable().optional(),
        views: z.number().min(100)
    }).refine((data) => {
        if (selectedFormat.type !== AdFormatType.TEXT && !data.media && !data.mediaUrl) {
            return false;
        }
        return true;
    }, {
        message: "Media (photo or video) is required",
        path: ["media"],
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: details.name,
            text: details.text,
            media: details.media,
            mediaUrl: details.mediaUrl,
            mediaKey: details.mediaKey,
            views: details.views,
        },
        mode: "onChange", // Validate on change for immediate feedback
    });

    const [uploadFile, {isLoading: isUploading}] = useUploadFileMutation();

    // Sync form values to parent state for CostEstimationCard
    // We watch all fields and update parent state
    useEffect(() => {
        const subscription = form.watch((value) => {
            setDetails(prev => ({
                ...prev,
                name: value.name || '',
                text: value.text || '',
                media: value.media as File | null,
                mediaUrl: value.mediaUrl || null,
                mediaKey: value.mediaKey || null,
                views: value.views || 1000,
            }));
        });
        return () => subscription.unsubscribe();
    }, [form, form.watch, setDetails]);


    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (file: File | null) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            // 1. Immediate preview
            const objectUrl = URL.createObjectURL(file);
            fieldChange(file);
            form.setValue('mediaUrl', objectUrl);
            form.setValue('mediaKey', null);

            try {
                // 2. Upload to server
                const res = await uploadFile(file).unwrap();

                // 3. Update with real URL + storage key on success
                form.setValue('mediaUrl', res.url);
                form.setValue('mediaKey', res.key);
                toast.success("Media uploaded successfully");
            } catch (error) {
                console.error("Upload failed", error);
                toast.error("Failed to upload media. Please try again.");
                // Optional: remove the preview if upload fails?
                // For now, we keep it so they can retry or see what they selected
            }
        }
    }, [form, uploadFile]);

    const handleDrop = useCallback(async (e: React.DragEvent, fieldChange: (file: File | null) => void) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // 1. Immediate preview
            const objectUrl = URL.createObjectURL(file);
            fieldChange(file);
            form.setValue('mediaUrl', objectUrl);
            form.setValue('mediaKey', null);

            try {
                // 2. Upload to server
                const res = await uploadFile(file).unwrap();

                // 3. Update with real URL + storage key on success
                form.setValue('mediaUrl', res.url);
                form.setValue('mediaKey', res.key);
                toast.success("Media uploaded successfully");
            } catch (error) {
                console.error("Upload failed", error);
                toast.error("Failed to upload media. Please try again.");
            }
        }
    }, [form, uploadFile]);

    const removeMedia = () => {
        form.setValue('media', null);
        form.setValue('mediaUrl', null);
        form.setValue('mediaKey', null);
    };

    const onSubmit = () => {
        // Validation: Ensure we don't submit a blob URL
        const currentMediaUrl = form.getValues('mediaUrl');

        if (selectedFormat.type !== AdFormatType.TEXT) {
            if (!currentMediaUrl) {
                toast.error("Please upload media for your ad");
                return;
            }

            if (currentMediaUrl.startsWith('blob:')) {
                toast.error("Please wait for media upload to complete");
                return;
            }

            if (!form.getValues('mediaKey')) {
                toast.error("Please wait for media upload to complete");
                return;
            }
        }

        // Form is valid, proceed
        onNext();
    };


    const getIcon = () => {
        switch (selectedFormat.type) {
            case AdFormatType.TEXT:
                return FileText;
            case AdFormatType.PHOTO:
                return ImageIcon;
            case AdFormatType.VIDEO:
                return Play;
            default:
                return FileText;
        }
    }
    const Icon = getIcon();
    const resolvedAttachmentUrl = resolvePreviewAttachmentUrl(details.mediaUrl);
    const previewAd: PreviewAdData = {
        brandName: details.name.trim() || null,
        content: details.text.trim() || null,
        color: selectedFormat.type === AdFormatType.VIDEO ? "#E11D48" : selectedFormat.type === AdFormatType.PHOTO ? "#0F766E" : "#2563EB",
        attachmentUrl: resolvedAttachmentUrl,
        attachmentName: details.media?.name || null,
        chatRoomName: "General",
        senderCountryCode: "US",
        senderRole: "USER",
    };
    const isPreviewReady = canPreviewAd(selectedFormat.type, previewAd);
    const isWaitingForMediaPreview = selectedFormat.type !== AdFormatType.TEXT
        && Boolean(details.name.trim())
        && Boolean(details.media || details.mediaUrl)
        && !Boolean(resolvedAttachmentUrl);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="w-full border-border shadow-sm">
                <CardHeader className="border-b border-border px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-card rounded-xl border border-border shadow-sm">
                            <Icon className="w-6 h-6 text-indigo-600"/>
                        </div>
                        <div>
                            <CardTitle
                                className="text-xl font-bold text-foreground">Configure {selectedFormat.title}</CardTitle>
                            <CardDescription className="text-muted-foreground text-sm">Fill in the details for your
                                campaign</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Configuration Inputs */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Campaign Name */}
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-muted-foreground">Campaign
                                                    Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Summer Sale 2024"
                                                        className="border-border focus-visible:ring-indigo-200"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Text Content */}
                                    <FormField
                                        control={form.control}
                                        name="text"
                                        render={({field}) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center">
                                                    <FormLabel className="text-sm font-semibold text-muted-foreground">
                                                        Ad Text Content {selectedFormat.type !== AdFormatType.TEXT &&
                                                        <span
                                                            className="text-muted-foreground font-normal">(Optional)</span>}
                                                    </FormLabel>
                                                    <span
                                                        className={`text-xs ${field.value?.length && field.value.length >= MAX_CHAR_COUNT ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                                        {field.value?.length || 0}/{MAX_CHAR_COUNT}
                                                    </span>
                                                </div>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter the primary text for your advertisement..."
                                                        rows={4}
                                                        maxLength={MAX_CHAR_COUNT}
                                                        className="resize-none border-border focus-visible:ring-indigo-200"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Media Upload - Only for non-text ads */}
                                    {selectedFormat.type !== AdFormatType.TEXT && (
                                        <FormField
                                            control={form.control}
                                            name="media"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-muted-foreground">
                                                        {selectedFormat.type === AdFormatType.VIDEO ? 'Video Asset' : 'Image Asset'}
                                                    </FormLabel>
                                                    <FormControl>
                                                        {!form.getValues('mediaUrl') ? (
                                                            <div
                                                                onDragOver={(e) => e.preventDefault()}
                                                                onDrop={(e) => handleDrop(e, field.onChange)}
                                                                className={`border-2 border-dashed ${form.formState.errors.media ? 'border-red-300 bg-red-50 dark:border-red-500/50 dark:bg-red-500/10' : 'border-border bg-muted hover:bg-muted'} rounded-xl p-8 text-center transition-colors cursor-pointer relative`}
                                                            >
                                                                <input
                                                                    type="file"
                                                                    accept={selectedFormat.type === AdFormatType.VIDEO ? "video/*" : "image/*"}
                                                                    onChange={(e) => handleFileChange(e, field.onChange)}
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                />
                                                                <div className="flex flex-col items-center gap-3">
                                                                    <div
                                                                        className="p-4 bg-card rounded-full shadow-sm">
                                                                        <Upload className="w-6 h-6 text-indigo-600"/>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-foreground">Click
                                                                            to upload or drag and drop</p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {selectedFormat.type === AdFormatType.VIDEO ? 'MP4, WebM up to 50MB' : 'PNG, JPG up to 10MB'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="relative rounded-xl overflow-hidden border border-border bg-slate-900 aspect-video flex items-center justify-center group">
                                                                {selectedFormat.type === AdFormatType.VIDEO ? (
                                                                    <video src={form.getValues('mediaUrl')!} controls
                                                                           className="max-h-full max-w-full"/>
                                                                ) : (
                                                                    <img
                                                                        src={form.getValues('mediaUrl')!}
                                                                        alt="Preview"
                                                                        className="absolute inset-0 w-full h-full object-contain"
                                                                    />
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={removeMedia}
                                                                    className="absolute top-2 right-2 p-2 bg-card/90 hover:bg-card text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X size={16}/>
                                                                </button>
                                                                {isUploading && (
                                                                    <div
                                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 transition-all rounded-xl">
                                                                        <div
                                                                            className="flex flex-col items-center gap-2 text-white">
                                                                            <Loader2 className="w-8 h-8 animate-spin"/>
                                                                            <span
                                                                                className="text-sm font-medium">Uploading...</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <CampaignPreviewCta
                                        ad={previewAd}
                                        title={`${selectedFormat.title} Preview`}
                                        canPreview={isPreviewReady}
                                        isWaitingForMedia={isWaitingForMediaPreview}
                                    />
                                </div>

                                {/* Right Column: Pricing Summary */}
                                <div className="lg:col-span-1">
                                    <CostEstimationCard
                                        details={details}
                                        setDetails={setDetails}
                                        selectedFormat={selectedFormat}
                                        adFormats={adFormats}
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="px-8 py-6 border-t border-border flex items-center justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onBack}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2"/>
                                Back
                            </Button>
                            <div className="flex items-center gap-4">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div
                                            className="flex items-center gap-2 text-muted-foreground hover:text-muted-foreground transition-colors cursor-help">
                                            <Info className="w-4 h-4"/>
                                            <span className="text-xs">Approval Process</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">After purchasing the ad, it will go through an approval
                                            process and will only become active once approved.</p>
                                    </TooltipContent>
                                </Tooltip>
                                <ActionButton
                                    type="submit"
                                    icon={CheckCircle2}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Next Step'}
                                </ActionButton>
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
