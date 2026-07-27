import React, {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Bold, Check, ChevronUp, Italic, Lock, Paperclip, Reply, Send, Smile, X} from "lucide-react";
import {DictationButton} from "@/features/chatroom/components/DictationButton";
import {ChatComposerEditor, DICTATION_META} from "@/features/chatroom/components/ChatComposerEditor";
import {FormatToggles} from "@/features/chatroom/components/FormatToggles";
import {MobileActionsPanel, MobileActionsToggle} from "@/features/chatroom/components/MobileComposerActions";
import {docToMarkers, markersToDoc, stripMarkers} from "@/features/chatroom/utils/messageMarkers";
import type {Editor} from "@tiptap/react";
import {useSpeechRecognition} from "@/lib/hooks/useSpeechRecognition";
import AttachmentPreview from "@/features/chatroom/components/AttachmentPreview";
import {Attachment} from "@/models/Attachment";
import {deleteAttachment, uploadAttachment} from "@/api/chatting/chattingAPI";
import TagSelection from "@/features/chatroom/components/TagSelection";
import {AttachmentType} from "@/models/AttachmentType";
import {cn, determineAttachmentType, extractAcceptedMimeTypes, mimeTypeToExtension, toMimeType,} from "@/lib/utils";
import {useDialog} from "@/components/providers/DialogProvider";
import {AttachmentTypeEnum} from "@/models/AttachmentTypeEnum";
import {MimeType} from "@/models/MimeType";
import {Tag} from "@/models/Tag";
import {useAttachmentHook} from "@/lib/hooks/useAttachmentHook";
import {UploadDragAndDropButton} from "@/features/chatroom/components/UploadDragAndDropButton";
import {toast} from "sonner";
import {ApiError} from "@/models/ApiError";
import OnionLinkWarning from "@/features/chatroom/components/OnionLinkWarning";
import {Message} from "@/models/message";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {useTheme} from "next-themes";
import imageCompression from "browser-image-compression";

interface ChatInputProps {
    isConnected: boolean;
    disabledReason?: string;
    messageSendingBlocked?: boolean;
    messageSendingDisabledReason?: string;
    onSendMessage: (message: string, attachment?: Attachment, editingMessageId?: number) => void;
    onEditMessage: (content: string) => void;
    maxMessageLength?: number;
    attachmentTypes?: AttachmentType[];
    editingMessage?: Message | null;
    onCancelEdit: () => void;
    replyingToMessage?: Message | null;
    onCancelReply?: () => void;
}

const MAX_FILE_SIZE = 11 * 1024 * 1024; // 11MB
// Mirrors MessagesServiceImpl.MAX_RAW_LENGTH: the visible (stripped) length is
// what counts against maxMessageLength; the raw marker string is hard-capped at
// 4x that (worst-case marker overhead the editor can produce).
const MAX_RAW_MESSAGE_LENGTH = 2000;

const validateMessage = ({
                             inputText,
                             uploadedAttachment,
                             isConnected,
                             maxMessageLength,
                             isUploading,
                             editingMessage,
                         }: {
    inputText: string;
    uploadedAttachment: Attachment | null;
    isConnected: boolean;
    maxMessageLength: number;
    isUploading: boolean;
    editingMessage?: Message | null;
}): { valid: boolean; reason?: string } => {
    const trimmed = inputText.trim();

    if (!isConnected) return {valid: false, reason: "Not connected"};
    if (isUploading) return {valid: false, reason: "Uploading attachment..."};
    if (trimmed === "" && !uploadedAttachment)
        return {valid: false, reason: "Cannot send an empty message"};
    if (stripMarkers(trimmed).length > maxMessageLength)
        return {valid: false, reason: "Message exceeds maximum length"};
    if (trimmed.length > MAX_RAW_MESSAGE_LENGTH)
        return {valid: false, reason: "Message formatting is too large"};
    if (editingMessage && trimmed === (editingMessage.content ?? "").trim())
        return {valid: false, reason: "No changes detected"};

    return {valid: true};
};

export function ChatInputShowcase({
                                      className,
                                      placeholder = "Type your message...",
                                  }: {
    className?: string;
    placeholder?: string;
}) {
    return (
        <div aria-hidden="true" className={cn("border-t p-4 select-none", className)}>
            <div className="pointer-events-none flex items-center gap-2">
                <Textarea
                    readOnly
                    tabIndex={-1}
                    value=""
                    placeholder={placeholder}
                    className="flex-1 min-h-10 max-h-[120px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary"
                    rows={1}
                />

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    tabIndex={-1}
                    className="hidden h-10 w-10 shrink-0 md:inline-flex"
                >
                    <Bold className="h-4 w-4"/>
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    tabIndex={-1}
                    className="hidden h-10 w-10 shrink-0 md:inline-flex"
                >
                    <Italic className="h-4 w-4"/>
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    tabIndex={-1}
                    className="hidden h-10 w-10 shrink-0 md:inline-flex"
                >
                    <Smile className="h-4 w-4"/>
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    tabIndex={-1}
                    className="h-10 w-10 shrink-0 md:hidden"
                >
                    <ChevronUp className="h-4 w-4"/>
                </Button>

                <div className="hidden items-center gap-2 md:flex">
                    <Button
                        type="button"
                        variant="outline"
                        tabIndex={-1}
                        className="h-10 gap-2 px-3"
                    >
                        <Paperclip className="h-4 w-4"/>
                        <span className="text-sm font-medium">SFW</span>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        tabIndex={-1}
                        className="h-10 gap-2 px-3"
                    >
                        <Paperclip className="h-4 w-4"/>
                        <span className="text-sm font-medium">NSFW</span>
                    </Button>
                </div>

                <Button type="button" size="icon" tabIndex={-1} className="h-10 w-10 shrink-0">
                    <Send className="h-4 w-4"/>
                </Button>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <div className="hidden md:block">
                    Press Enter to send, Shift+Enter for new line
                </div>
                <div className="tabular-nums">500 characters remaining</div>
            </div>
        </div>
    );
}

const ChatInput: React.FC<ChatInputProps> = ({
                                                 isConnected,
                                                 disabledReason,
                                                 messageSendingBlocked = false,
                                                 messageSendingDisabledReason = "Messaging is temporarily disabled until a moderator is online.",
                                                 onSendMessage,
                                                 onEditMessage,
                                                 maxMessageLength = 500,
                                                 editingMessage = null,
                                                 onCancelEdit,
                                                 replyingToMessage = null,
                                                 onCancelReply,
                                             }) => {
    const {open, close} = useDialog();
    const {attachmentTypes} = useAttachmentHook();
    const isMobile = useIsMobile();

    const [isOpenEmojiPopover, setIsOpenEmojiPopover] = useState(false);
    const {resolvedTheme} = useTheme();

    // `inputText` holds the serialized **bold**/*italic* marker string mirrored
    // from the rich editor on every update — it is what gets validated, counted
    // against the length limit, and sent to the backend.
    const [inputText, setInputText] = useState("");
    const [editor, setEditor] = useState<Editor | null>(null);
    const [actionsExpanded, setActionsExpanded] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isNsfw, setIsNsfw] = useState(false);
    const [uploadedAttachment, setUploadedAttachment] = useState<Attachment | null>(null);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [supportedFileTypes, setSupportedFileTypes] = useState<string[]>();
    const [isUploading, setIsUploading] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);

    // Length of the live, not-yet-final dictation segment currently sitting at
    // the end of the editor document. Each interim update replaces this tail so
    // the words refine in place as the user speaks; a final result commits it.
    const interimLenRef = useRef(0);

    // Dictated text is appended at the end of the document, replacing the
    // current interim tail. The replacement inherits the marks at the insert
    // position (or the armed stored marks), so dictating with the Bold toggle
    // on produces bold text.
    const applyDictation = (text: string, commit: boolean) => {
        if (!editor) return;
        const {state} = editor.view;
        const end = state.doc.content.size - 1;
        const from = Math.max(0, end - interimLenRef.current);
        const before = state.doc.textBetween(0, from, "\n");
        const sep = before && text && !before.endsWith(" ") ? " " : "";
        const insert = sep + text;
        const tr = state.tr.insertText(insert, from, end);
        tr.setMeta(DICTATION_META, true);
        editor.view.dispatch(tr);
        interimLenRef.current = commit ? 0 : insert.length;
    };

    const appendDictation = (text: string) => applyDictation(text, true);
    const handleDictationInterim = (text: string) => applyDictation(text, false);

    const handleDictationError = (code: string) => {
        if (code === "not-allowed" || code === "service-not-allowed") {
            toast.error("Microphone permission denied. Enable it in your browser settings.");
        } else if (code === "audio-capture") {
            toast.error("No microphone found.");
        } else if (code === "network") {
            toast.error("Speech recognition network error.");
        } else {
            toast.error("Dictation failed. Please try again.");
        }
    };

    const {
        isSupported: isDictationSupported,
        isListening,
        toggle: toggleDictation,
        stop: stopDictation,
    } = useSpeechRecognition({
        onResult: appendDictation,
        onInterim: handleDictationInterim,
        onError: handleDictationError,
    });

    // When dictation stops, whatever live text is showing becomes committed —
    // a subsequent typing or dictation pass shouldn't strip it as "interim".
    useEffect(() => {
        if (!isListening) interimLenRef.current = 0;
    }, [isListening]);

    useEffect(() => {
        if (!editor) return;
        if (editingMessage) {
            stopDictation();
            // Prefill the editor from the stored marker string — the user edits
            // rich text, never raw markers.
            editor.commands.setContent(markersToDoc(editingMessage.content ?? ""));
            setInputText(docToMarkers(editor.getJSON()));
            editor.commands.focus("end");
        } else {
            editor.commands.clearContent();
            setInputText("");
        }
    }, [editingMessage, stopDictation, editor]);

    // Stop dictation if sending becomes blocked or the connection drops.
    useEffect(() => {
        if (!isConnected || messageSendingBlocked) stopDictation();
    }, [isConnected, messageSendingBlocked, stopDictation]);

    useEffect(() => {
        if (replyingToMessage) {
            editor?.commands.focus();
        }
    }, [replyingToMessage, editor]);

    useEffect(() => {
        if (selectedFile) {
            handleEditFile();
        }
    }, [selectedFile]);

    useEffect(() => {
        if (!attachmentTypes) return;
        setSupportedFileTypes(extractAcceptedMimeTypes(attachmentTypes));
    }, [attachmentTypes]);

    const fileAcceptString = supportedFileTypes
        ? supportedFileTypes
            .map((mime) => mimeTypeToExtension[mime])
            .filter((ext) => ext.length > 0)
            .map((ext) => `.${ext}`)
            .join(",")
        : "";

    const handleSendMessage = () => {
        if (isCooldown) return;
        if (messageSendingBlocked) {
            toast.error(messageSendingDisabledReason);
            return;
        }

        // Check the plain text too so markers inside the domain don't hide it.
        if (inputText.includes(".onion") || stripMarkers(inputText).includes(".onion")) {
            open(<OnionLinkWarning onClose={close}/>);
            return;
        }

        const {valid, reason} = validateMessage({
            inputText,
            uploadedAttachment,
            isConnected: isConnected && !messageSendingBlocked,
            maxMessageLength,
            isUploading,
        });

        if (!valid) {
            toast.error(reason || "Invalid message");
            return;
        }

        const attachmentToSend = uploadedAttachment
            ? {...uploadedAttachment, tags: selectedTags}
            : undefined;

        onSendMessage(inputText.trim(), attachmentToSend, editingMessage?.id);

        stopDictation();
        editor?.commands.clearContent();
        setInputText("");
        setSelectedFile(null);
        setUploadedAttachment(null);
        setSelectedTags([]);
        setIsNsfw(false);

        setIsCooldown(true);

        setTimeout(() => {
            setIsCooldown(false);
        }, 500);
    };

    const handleEditMessage = () => {
        if (inputText.includes(".onion") || stripMarkers(inputText).includes(".onion")) {
            open(<OnionLinkWarning onClose={close}/>);
            return;
        }

        // The stored content of older messages may serialize differently than
        // the canonical round-trip — compare both so an untouched edit never
        // fires a no-op PATCH.
        if (isUnchanged) {
            toast.error("No changes detected");
            return;
        }

        const {valid, reason} = validateMessage({
            inputText,
            uploadedAttachment,
            isConnected,
            maxMessageLength,
            isUploading,
            editingMessage,
        });

        if (!valid) {
            toast.error(reason || "Invalid edit");
            return;
        }

        onEditMessage(inputText.trim());
        onCancelEdit();
    };

    const handleComposerEnter = () => {
        if (editingMessage) handleEditMessage();
        else handleSendMessage();
    };

    const handleComposerEscape = () => {
        if (editingMessage) {
            onCancelEdit();
            return true;
        }
        if (replyingToMessage) {
            onCancelReply?.();
            return true;
        }
        return false;
    };

    const handleSerializedChange = (serialized: string, isDictation: boolean) => {
        // Manual edits fold any live dictation tail into committed text.
        if (!isDictation) interimLenRef.current = 0;
        setInputText(serialized);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, nsfw: boolean) => {
        if (messageSendingBlocked) {
            toast.error(messageSendingDisabledReason);
            e.target.value = "";
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        let normalizedFileMimeType = toMimeType(file.type);
        if (normalizedFileMimeType === MimeType.UNKNOWN) {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext) {
                const mimeEntry = Object.entries(mimeTypeToExtension).find(([, extension]) => extension === ext);
                if (mimeEntry) {
                    normalizedFileMimeType = toMimeType(mimeEntry[0]);
                }
            }
        }

        if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            toast.error(
                `File exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB. (${fileSizeMB}MB uploaded)`
            );
            e.target.value = "";
            return;
        }

        const isSupportedFileType = supportedFileTypes?.some(
            (supportedMimeType) => toMimeType(supportedMimeType) === normalizedFileMimeType
        );

        if (!isSupportedFileType) {
            toast.error("This file type is not supported.");
            e.target.value = "";
            return;
        }

        if (isSupportedFileType) {
            let fileToUpload = file;
            let fileForPreview = file;

            if (file.type.startsWith("image/") && file.type !== "image/gif") {
                setIsUploading(true);
                try {
                    const options = {
                        maxWidthOrHeight: 2048,
                        initialQuality: 0.8,
                        useWebWorker: true,
                        fileType: "image/jpeg",
                    };
                    const compressedBlob = await imageCompression(file, options);
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpeg";
                    fileToUpload = new File([compressedBlob], newFileName, {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                    fileForPreview = fileToUpload;
                } catch (error) {
                    console.error("Error compressing image:", error);
                    toast.error("Failed to compress image.");
                    setIsUploading(false);
                    return;
                }
            }

            if (normalizedFileMimeType === MimeType.OGG && fileToUpload.type !== MimeType.OGG) {
                fileToUpload = new File([fileToUpload], fileToUpload.name, {
                    type: MimeType.OGG,
                    lastModified: fileToUpload.lastModified,
                });
            }

            setSelectedFile(fileForPreview);
            setIsNsfw(nsfw);
            setIsUploading(true);

            try {
                const attachment = await uploadAttachment(fileToUpload);
                setUploadedAttachment(attachment);
            } catch (error: ApiError | any) {
                setSelectedFile(null);
                setSelectedTags([]);
                setIsNsfw(false);
                toast.error(error.response?.data?.message || "Failed to upload file.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRemoveFile = async () => {
        if (uploadedAttachment) {
            try {
                await deleteAttachment(uploadedAttachment.id);
            } catch (error) {
                console.error("Failed to delete attachment:", error);
            }
        }

        setSelectedFile(null);
        setUploadedAttachment(null);
        setSelectedTags([]);
        setIsNsfw(false);
    };

    const handleEditFile = () => {
        if (!selectedFile) return;

        const mimeType = toMimeType(selectedFile.type);
        const attachmentType = determineAttachmentType(mimeType, attachmentTypes ?? []);

        if (attachmentType?.fileType === AttachmentTypeEnum.AUDIO || mimeType === MimeType.OGG) return;
        if (!isNsfw) return;

        const availableTags = attachmentType?.availableTags || [];

        open(
            <TagSelection
                availableTags={availableTags}
                selectedTags={selectedTags}
                file={selectedFile}
                onTagsSelected={(tags) => {
                    setSelectedTags(tags);
                    close();
                }}
                onCancel={close}
                isEditing={true}
            />
        );
    };

    const visibleLength = stripMarkers(inputText).length;
    const remainingChars = maxMessageLength - visibleLength;
    const isOverLimit = visibleLength > maxMessageLength || inputText.length > MAX_RAW_MESSAGE_LENGTH;
    const isEditing = !!editingMessage;
    const canSendNewMessage = isConnected && !messageSendingBlocked;
    const canUseTextInput = isEditing ? isConnected : canSendNewMessage;
    const newMessageDisabledReason = messageSendingBlocked
        ? messageSendingDisabledReason
        : disabledReason;
    const trimmedInput = inputText.trim();
    const originalContent = editingMessage?.content?.trim() ?? "";
    // The editor state is canonical marker text; round-trip the stored original
    // so legacy strings that serialize differently don't fake a change.
    const canonicalOriginal = isEditing
        ? docToMarkers(markersToDoc(editingMessage?.content ?? "")).trim()
        : "";
    const hasAttachment = !!uploadedAttachment;
    const hasContent = trimmedInput.length > 0;
    const isUnchanged = isEditing && (trimmedInput === originalContent || trimmedInput === canonicalOriginal);
    const disableConfirmEdit =
        (!hasContent && !hasAttachment) || !isConnected || isOverLimit || isUploading || isUnchanged;

    return (
        <div className="relative mt-1 bg-transparent px-2 py-3 shadow-none">
            {!editingMessage && replyingToMessage && (
                <div
                    className="glass-surface mb-2 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground">
                    <Reply className="h-3.5 w-3.5 shrink-0"/>
                    <span className="shrink-0">Replying to</span>
                    <span
                        className="font-medium shrink-0"
                        style={replyingToMessage.color ? {color: replyingToMessage.color} : undefined}
                    >
                        {replyingToMessage.senderUsername}
                    </span>
                    {replyingToMessage.attachments?.length > 0 && (
                        <Paperclip className="h-3 w-3 shrink-0" aria-label="Attachment"/>
                    )}
                    {replyingToMessage.attachments?.[0]?.name && (
                        <span className={cn(
                            "truncate min-w-0 italic",
                            replyingToMessage.content && "max-w-[40%]"
                        )}>
                            {replyingToMessage.attachments[0].name}
                        </span>
                    )}
                    {replyingToMessage.content && (
                        <span className="truncate min-w-0 flex-1">{stripMarkers(replyingToMessage.content)}</span>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => onCancelReply?.()}
                        title="Cancel reply"
                    >
                        <X className="h-3.5 w-3.5"/>
                    </Button>
                </div>
            )}
            {!editingMessage && selectedFile && (
                <AttachmentPreview
                    file={selectedFile}
                    onRemove={handleRemoveFile}
                    onEdit={handleEditFile}
                    nsfw={isNsfw}
                    isUploading={isUploading}
                />
            )}

            {isMobile && actionsExpanded && (
                <MobileActionsPanel>
                    <FormatToggles editor={editor} disabled={!canUseTextInput}/>
                    {!editingMessage && (
                        <>
                            <DictationButton
                                isSupported={isDictationSupported}
                                isListening={isListening}
                                disabled={!canSendNewMessage}
                                onToggle={toggleDictation}
                            />
                            <UploadDragAndDropButton
                                onFileSelect={handleFileSelect}
                                accept={fileAcceptString}
                                disabled={!canSendNewMessage || isUploading}
                                nsfw={false}
                                title="Safe for Work"
                                label={"SFW"}
                                className="glass-control"
                            />
                            <UploadDragAndDropButton
                                onFileSelect={handleFileSelect}
                                accept={fileAcceptString}
                                disabled={!canSendNewMessage || isUploading}
                                nsfw={true}
                                title="Not Safe for Work"
                                label={"NSFW"}
                                className="glass-control"
                            />
                        </>
                    )}
                </MobileActionsPanel>
            )}

            <div className="flex gap-2 items-center">
                <ChatComposerEditor
                    placeholder={
                        canUseTextInput
                            ? editingMessage
                                ? "Edit your message..."
                                : "Type your message..."
                            : newMessageDisabledReason || "Connecting..."
                    }
                    editable={canUseTextInput}
                    onSerializedChange={handleSerializedChange}
                    onEnter={handleComposerEnter}
                    onEscape={handleComposerEscape}
                    onReady={setEditor}
                />

                {!isMobile && <FormatToggles editor={editor} disabled={!canUseTextInput}/>}

                {!editingMessage && !isMobile && (
                    <>
                        <Popover open={isOpenEmojiPopover} onOpenChange={setIsOpenEmojiPopover}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="glass-control shrink-0 h-10 w-10"
                                    disabled={!canSendNewMessage}
                                >
                                    <Smile className="h-4 w-4"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                sideOffset={4}
                                className="glass-popover p-0 border-none shadow-lg w-auto"
                            >
                                <Picker
                                    data={data}
                                    theme={resolvedTheme}
                                    onEmojiSelect={(emoji: any) => {
                                        editor?.chain().focus().insertContent(emoji.native).run();
                                    }}
                                />
                            </PopoverContent>
                        </Popover>

                        <DictationButton
                            isSupported={isDictationSupported}
                            isListening={isListening}
                            disabled={!canSendNewMessage}
                            onToggle={toggleDictation}
                        />

                        <UploadDragAndDropButton
                            onFileSelect={handleFileSelect}
                            accept={fileAcceptString}
                            disabled={!canSendNewMessage || isUploading}
                            nsfw={false}
                            title="Safe for Work"
                            label={"SFW"}
                            className="glass-control"
                        />

                        <UploadDragAndDropButton
                            onFileSelect={handleFileSelect}
                            accept={fileAcceptString}
                            disabled={!canSendNewMessage || isUploading}
                            nsfw={true}
                            title="Not Safe for Work"
                            label={"NSFW"}
                            className="glass-control"
                        />
                    </>
                )}

                {isMobile && (
                    <MobileActionsToggle
                        expanded={actionsExpanded}
                        onToggle={() => setActionsExpanded((prev) => !prev)}
                        disabled={!canUseTextInput}
                    />
                )}

                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Button
                            className="glass-control h-10 w-10 text-foreground hover:text-foreground"
                            variant="secondary"
                            onClick={() => onCancelEdit && onCancelEdit()}
                            size="icon"
                            title="Cancel edit"
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                        <Button
                            className="glass-control h-10 w-10"
                            onClick={handleEditMessage}
                            disabled={disableConfirmEdit}
                            size="icon"
                            title={isUnchanged ? "No changes to save" : "Save changes"}
                        >
                            <Check className="h-4 w-4"/>
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="glass-control h-10 w-10 text-foreground hover:text-foreground"
                        onClick={handleSendMessage}
                        disabled={
                            (!inputText.trim() && !uploadedAttachment) ||
                            !canSendNewMessage ||
                            isOverLimit ||
                            isUploading
                        }
                        size="icon"
                        title="Send"
                    >
                        <Send className="h-4 w-4"/>
                    </Button>
                )}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <div>
                    {!isMobile && (
                        editingMessage
                            ? "Editing mode — press Enter to save, or Esc to cancel"
                            : "Press Enter to send, Shift+Enter for new line"
                    )}
                    {!isConnected && ` • ${disabledReason || "Connecting to chat..."}`}
                    {!isEditing && messageSendingBlocked && ` • ${messageSendingDisabledReason}`}
                    {isUploading && " • Uploading file..."}
                    {isListening && (
                        <span className="text-red-500"> • Listening…</span>
                    )}
                </div>
                <div
                    className={`${remainingChars < 50 && remainingChars > 0 ? "text-yellow-600" : ""
                    } ${remainingChars <= 0 ? "text-red-600" : ""} tabular-nums`}
                >
                    {isMobile
                        ? `${visibleLength} / ${maxMessageLength}`
                        : `${remainingChars} characters remaining`}
                </div>
            </div>
            {!isEditing && messageSendingBlocked && (
                <div
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-background/40 px-4 backdrop-blur-lg">
                    <div
                        className="glass-surface-strong flex max-w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground">
                        <Lock className="h-4 w-4 shrink-0 text-muted-foreground"/>
                        <span className="text-center leading-snug">
                            {messageSendingDisabledReason}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInput;
