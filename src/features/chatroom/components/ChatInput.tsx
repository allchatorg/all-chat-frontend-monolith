import {fontPresetStyle} from "@/lib/fontPresets";
import {useUserFonts} from "@/lib/hooks/useUserFonts";
import {useSelector} from "react-redux";
import {selectUser} from "@/redux/user/userSelectors";
import {ChatUserName} from "@/features/chatroom/components/ChatUserName";
import React, {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Bold, Check, ChevronUp, Italic, LoaderCircle, Lock, Paperclip, Reply, Send, Smile, Sticker, X} from "lucide-react";
import {DictationButton} from "@/features/chatroom/components/DictationButton";
import {ChatComposerEditor, DICTATION_META} from "@/features/chatroom/components/ChatComposerEditor";
import {FormatToggles} from "@/features/chatroom/components/FormatToggles";
import {MobileActionsPanel, MobileActionsToggle} from "@/features/chatroom/components/MobileComposerActions";
import {chatPreviewText, chatVisibleText, docToMarkers, markersToDoc, stripMarkers} from "@/features/chatroom/utils/messageMarkers";
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
import {ChatExpressionPicker} from "@/features/chatroom/components/ChatExpressionPicker";
import {getSticker, getStickerLabel, ProReaction} from "@/features/stickers/catalog";
import imageCompression from "browser-image-compression";
import {getAccountLimits, getAttachmentByteLimit} from "@/lib/accountLimits";

interface ChatInputProps {
    isConnected: boolean;
    disabledReason?: string;
    messageSendingBlocked?: boolean;
    messageSendingDisabledReason?: string;
    onSendMessage: (message: string, attachment?: Attachment, editingMessageId?: number, stickerId?: string) => Promise<void>;
    onEditMessage: (content: string) => void | Promise<void>;
    maxMessageLength?: number;
    attachmentTypes?: AttachmentType[];
    editingMessage?: Message | null;
    onCancelEdit: () => void;
    replyingToMessage?: Message | null;
    onCancelReply?: () => void;
}

const validateMessage = ({
                             inputText,
                             uploadedAttachment,
                             isConnected,
                             maxMessageLength,
                             maxRawMessageLength,
                             isUploading,
                             editingMessage,
                         }: {
    inputText: string;
    uploadedAttachment: Attachment | null;
    isConnected: boolean;
    maxMessageLength: number;
    maxRawMessageLength: number;
    isUploading: boolean;
    editingMessage?: Message | null;
}): { valid: boolean; reason?: string } => {
    const trimmed = inputText.trim();

    if (!isConnected) return {valid: false, reason: "Not connected"};
    if (isUploading) return {valid: false, reason: "Uploading attachment..."};
    if (trimmed === "" && !uploadedAttachment && !editingMessage?.attachments?.length)
        return {valid: false, reason: "Cannot send an empty message"};
    if (chatVisibleText(inputText).length > maxMessageLength)
        return {valid: false, reason: `Message exceeds the ${maxMessageLength.toLocaleString()} character limit.`};
    if (inputText.length > maxRawMessageLength)
        return {valid: false, reason: "Message formatting is too large"};
    if (editingMessage && inputText === (editingMessage.content ?? ""))
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
    const user = useSelector(selectUser);
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
                    <Sticker className="h-4 w-4"/>
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
                <div className="tabular-nums">{getAccountLimits(user).messageCharacters} characters remaining</div>
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
                                                 maxMessageLength: messageLengthOverride,
                                                 editingMessage = null,
                                                 onCancelEdit,
                                                 replyingToMessage = null,
                                                 onCancelReply,
                                             }) => {
    const user = useSelector(selectUser);
    const limits = getAccountLimits(user);
    const maxMessageLength = messageLengthOverride ?? limits.messageCharacters;
    const maxRawMessageLength = limits.rawMessageCharacters;
    const {open, close} = useDialog();
    const {attachmentTypes} = useAttachmentHook();
    const isMobile = useIsMobile();

    const fonts = useUserFonts(user?.id, user ?? undefined);
    const replyFonts = useUserFonts(replyingToMessage?.senderId, {
        usernameFont: replyingToMessage?.senderUsernameFont,
        messageFont: replyingToMessage?.senderMessageFont,
        fontRevision: replyingToMessage?.senderFontRevision,
    });
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
    const [isSending, setIsSending] = useState(false);
    const sendingRef = useRef(false);
    const mountedRef = useRef(true);
    const composerContextRef = useRef({editingId: editingMessage?.id, replyingId: replyingToMessage?.id});
    composerContextRef.current = {editingId: editingMessage?.id, replyingId: replyingToMessage?.id};

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);
    const lastEditorSyncRef = useRef<{message: Message | null; editor: Editor} | null>(null);

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
        const before = state.doc.textBetween(0, from, "\n", node => node.type.name === 'hardBreak' ? '\n' : '\uFFFC');
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
        // A message-menu edit may arrive while a send is pending. Wait for the
        // send to settle before replacing the draft, and do not clear a failed
        // draft merely because isSending changed.
        if (!editor || isSending) return;
        if (lastEditorSyncRef.current?.message === editingMessage && lastEditorSyncRef.current?.editor === editor) return;
        lastEditorSyncRef.current = {message: editingMessage, editor};
        if (editingMessage) {
            stopDictation();
            // Prefill the editor from the stored marker string — the user edits
            // rich text, never raw markers.
            editor.commands.setContent(markersToDoc(editingMessage.content ?? "", {customEmojis: true}));
            setInputText(docToMarkers(editor.getJSON()));
            editor.commands.focus("end");
        } else {
            editor.commands.clearContent();
            setInputText("");
        }
    }, [editingMessage, stopDictation, editor, isSending]);

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

    const uploadGuidance = attachmentTypes.length
        ? `${attachmentTypes.map(type => `${type.fileType === AttachmentTypeEnum.VIDEO ? "video/GIF" : type.fileType.toLowerCase()}: ${getAttachmentByteLimit(type, user) / (1024 * 1024)} MB`).join(", ")}. ${Number.isFinite(limits.hourlyUploadBytes) ? `${limits.hourlyUploadBytes / (1024 * 1024)} MB total per hour` : "No hourly upload cap"}.`
        : "Loading upload limits…";

    const fileAcceptString = supportedFileTypes
        ? supportedFileTypes
            .map((mime) => mimeTypeToExtension[mime])
            .filter((ext) => ext.length > 0)
            .map((ext) => `.${ext}`)
            .join(",")
        : "";

    const handleSendMessage = async () => {
        if (isCooldown || sendingRef.current) return;
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
            maxRawMessageLength,
            isUploading,
        });

        if (!valid) {
            toast.error(reason || "Invalid message");
            return;
        }

        const attachmentToSend = uploadedAttachment
            ? {...uploadedAttachment, tags: selectedTags}
            : undefined;

        const context = composerContextRef.current;
        sendingRef.current = true;
        setIsSending(true);
        stopDictation();
        try {
            // Keep the draft and uploaded attachment until the server accepts
            // them: Pro can expire between the last refresh and this request.
            await onSendMessage(inputText.trim() ? inputText : "", attachmentToSend, editingMessage?.id);
            if (!mountedRef.current || context.editingId !== composerContextRef.current.editingId ||
                (composerContextRef.current.replyingId !== undefined && context.replyingId !== composerContextRef.current.replyingId)) return;
            editor?.commands.clearContent();
            setInputText("");
            setSelectedFile(null);
            setUploadedAttachment(null);
            setSelectedTags([]);
            setIsNsfw(false);
            if (mountedRef.current) setIsCooldown(true);
            window.setTimeout(() => { if (mountedRef.current) setIsCooldown(false); }, 500);
        } catch (error) {
            const failure = error as {response?: {data?: {message?: string}}; message?: string} | null;
            toast.error(failure?.response?.data?.message || failure?.message || "Failed to send message. Your draft is ready to retry.");
        } finally {
            sendingRef.current = false;
            if (mountedRef.current) setIsSending(false);
            // Disabling contenteditable during the request can move focus to
            // the page. Restore typing after React enables it again, without
            // taking focus from another control the user chose meanwhile.
            requestAnimationFrame(() => {
                if (editor && !editor.isDestroyed && document.activeElement === document.body) {
                    editor.commands.focus();
                }
            });
        }
    };

    const handleSendSticker = async (sticker: ProReaction) => {
        if (sendingRef.current || isCooldown) throw new Error('Please wait before sending another message.');
        if (!isConnected) throw new Error(disabledReason || 'Not connected');
        if (messageSendingBlocked) throw new Error(messageSendingDisabledReason);
        if (editingMessage || isUploading) throw new Error('Finish your current edit or upload before sending a sticker.');

        sendingRef.current = true;
        setIsSending(true);
        stopDictation();
        try {
            // Stickers send on selection. Keep any text and attachment draft intact.
            await onSendMessage('', undefined, undefined, sticker.id);
            if (mountedRef.current) setIsCooldown(true);
            window.setTimeout(() => { if (mountedRef.current) setIsCooldown(false); }, 500);
        } finally {
            sendingRef.current = false;
            if (mountedRef.current) setIsSending(false);
        }
    };

    const handleEditMessage = async () => {
        if (sendingRef.current) return;
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
            maxRawMessageLength,
            isUploading,
            editingMessage,
        });

        if (!valid) {
            toast.error(reason || "Invalid edit");
            return;
        }

        const editingId = editingMessage?.id;
        sendingRef.current = true;
        setIsSending(true);
        stopDictation();
        try {
            await onEditMessage(inputText.trim() ? inputText : "");
            if (mountedRef.current && composerContextRef.current.editingId === editingId) onCancelEdit();
        } catch (error) {
            const failure = error as {response?: {data?: {message?: string}}; message?: string} | null;
            toast.error(failure?.response?.data?.message || failure?.message || 'Could not save your edit. Your draft is ready to retry.');
        } finally {
            sendingRef.current = false;
            if (mountedRef.current) setIsSending(false);
            requestAnimationFrame(() => {
                if (editor && !editor.isDestroyed && document.activeElement === document.body) {
                    editor.commands.focus();
                }
            });
        }
    };

    const handleComposerEnter = () => {
        if (editingMessage) void handleEditMessage();
        else void handleSendMessage();
    };

    const handleComposerEscape = () => {
        if (sendingRef.current) return true;
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
        if (sendingRef.current) return;
        if (messageSendingBlocked) {
            toast.error(messageSendingDisabledReason);
            e.target.value = "";
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;
        // Allow selecting the same file again after capacity becomes available.
        e.target.value = "";

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

        if (!attachmentTypes.length) {
            toast.error("Upload limits are still loading. Please try again.");
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

        const attachmentType = determineAttachmentType(normalizedFileMimeType, attachmentTypes ?? []);
        if (!attachmentType) {
            toast.error("Upload limits are still loading. Please try again.");
            e.target.value = "";
            return;
        }
        const maxFileSize = getAttachmentByteLimit(attachmentType, user);
        if (file.size > maxFileSize) {
            toast.error(`File exceeds the ${maxFileSize / (1024 * 1024)} MB per-file limit. (${(file.size / (1024 * 1024)).toFixed(2)} MB selected)`);
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

            // Compression can change a file's MIME type and byte count. Check
            // the actual upload against its configured category too.
            const uploadType = determineAttachmentType(toMimeType(fileToUpload.type), attachmentTypes) ?? attachmentType;
            const uploadLimit = getAttachmentByteLimit(uploadType, user);
            if (fileToUpload.size > uploadLimit) {
                toast.error(`File exceeds the ${uploadLimit / (1024 * 1024)} MB limit after image processing.`);
                setIsUploading(false);
                e.target.value = "";
                return;
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

    const visibleLength = chatVisibleText(inputText).length;
    const remainingChars = maxMessageLength - visibleLength;
    const isOverLimit = visibleLength > maxMessageLength || inputText.length > maxRawMessageLength;
    const isEditing = !!editingMessage;
    const canSendNewMessage = isConnected && !messageSendingBlocked && !isSending;
    // Keep helper text mounted while sending so the composer height stays stable.
    const isTextInputAvailable = isConnected && (isEditing || !messageSendingBlocked);
    const canUseTextInput = isTextInputAvailable && !isSending;
    const newMessageDisabledReason = messageSendingBlocked
        ? messageSendingDisabledReason
        : disabledReason;
    const trimmedInput = inputText.trim();
    const originalContent = editingMessage?.content ?? "";
    // The editor state is canonical marker text; round-trip the stored original
    // so legacy strings that serialize differently don't fake a change.
    const canonicalOriginal = isEditing
        ? docToMarkers(markersToDoc(editingMessage?.content ?? "", {customEmojis: true}))
        : "";
    const hasAttachment = !!uploadedAttachment;
    const hasContent = trimmedInput.length > 0;
    const hasExistingMedia = !!editingMessage?.attachments?.length;
    const isUnchanged = isEditing && (inputText === originalContent || inputText === canonicalOriginal);
    const disableConfirmEdit =
        (!hasContent && !hasAttachment && !hasExistingMedia) || !isConnected || isOverLimit || isUploading || isUnchanged || isSending;

    const expressionPicker = (
        <ChatExpressionPicker
            disabled={!canUseTextInput || isUploading || (!isEditing && isCooldown)}
            pending={isSending}
            allowStickers={!isEditing}
            onEmojiSelect={emoji => {
                if (!editor || editor.isDestroyed || !editor.isEditable || !canUseTextInput) throw new Error('The composer is currently unavailable.');
                if (emoji.kind === 'unicode') {
                    if (!editor.chain().focus().insertContent(emoji.native).run()) throw new Error('Could not insert your emoji. Please try again.');
                    return;
                }
                if (!getSticker(emoji.id)) throw new Error('This emoji is unavailable.');
                const before = editor.state.selection.$from.parent.textBetween(0, editor.state.selection.$from.parentOffset, '', '\uFFFC');
                // Separate an inserted image from a preceding URL so its marker stays an emoji on reload.
                const nodes = [
                    ...(/https?:\/\/\S*$/.test(before) ? [{type: 'text', text: ' '}] : []),
                    {type: 'customEmoji', attrs: {id: emoji.id}},
                ];
                if (!editor.chain().focus().insertContent(nodes).run()) throw new Error('Could not insert your emoji. Please try again.');
            }}
            onStickerSelect={handleSendSticker}
            onRestoreComposerFocus={() => {
                if (editor && !editor.isDestroyed) editor.commands.focus();
            }}
        />
    );

    return (
        <div className="composer-floating relative mt-1 bg-transparent px-2 py-3 shadow-none">
            {!editingMessage && replyingToMessage && (
                <div
                    className="glass-surface mb-2 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground">
                    <Reply className="h-3.5 w-3.5 shrink-0"/>
                    <span className="shrink-0">Replying to</span>
                    <span
                        className="min-w-0 max-w-[40%] font-medium"
                    >
                        <ChatUserName userId={replyingToMessage.senderId} username={replyingToMessage.senderUsername} proBadgeVisible={replyingToMessage.senderProBadgeVisible} proBadgeRevision={replyingToMessage.senderProBadgeRevision} usernameFont={replyingToMessage.senderUsernameFont} messageFont={replyingToMessage.senderMessageFont} fontRevision={replyingToMessage.senderFontRevision}/>
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
                        <span className="truncate min-w-0 flex-1" style={fontPresetStyle(replyFonts.messageFont)}>{chatPreviewText(replyingToMessage.content)}</span>
                    )}
                    {replyingToMessage.stickerId && !replyingToMessage.deleted && (
                        <span className="flex min-w-0 flex-1 items-center gap-1.5">
                            <Sticker aria-hidden="true" className="h-3.5 w-3.5 shrink-0"/>
                            <span className="truncate">{getStickerLabel(replyingToMessage.stickerId)}</span>
                        </span>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => onCancelReply?.()}
                        disabled={isSending}
                        title="Cancel reply"
                    >
                        <X className="h-3.5 w-3.5"/>
                    </Button>
                </div>
            )}
            {!editingMessage && selectedFile && (
                <AttachmentPreview
                    file={selectedFile}
                    onRemove={() => {if (!isSending) void handleRemoveFile();}}
                    onEdit={() => {if (!isSending) handleEditFile();}}
                    nsfw={isNsfw}
                    isUploading={isUploading}
                    disabled={isSending}
                />
            )}

            {isMobile && actionsExpanded && (
                <MobileActionsPanel>
                    {expressionPicker}
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
                                title={`Safe for Work — ${uploadGuidance || "loading upload limits"}`}
                                label={"SFW"}
                                className="glass-control"
                            />
                            <UploadDragAndDropButton
                                onFileSelect={handleFileSelect}
                                accept={fileAcceptString}
                                disabled={!canSendNewMessage || isUploading}
                                nsfw={true}
                                title={`Not Safe for Work — ${uploadGuidance || "loading upload limits"}`}
                                label={"NSFW"}
                                className="glass-control"
                            />
                        </>
                    )}
                </MobileActionsPanel>
            )}

            {isMobile && actionsExpanded && !editingMessage && (
                <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{uploadGuidance}</p>
            )}

            <div className="flex gap-2 items-center">
                <ChatComposerEditor
                    style={fontPresetStyle(fonts.messageFont)}
                    placeholder={
                        isSending ? (isEditing ? "Saving changes..." : "Sending message...") : canUseTextInput
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

                {!isMobile && expressionPicker}

                {!isMobile && <FormatToggles editor={editor} disabled={!canUseTextInput}/>}

                {!editingMessage && !isMobile && (
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
                            title={`Safe for Work — ${uploadGuidance || "loading upload limits"}`}
                            label={"SFW"}
                            className="glass-control"
                        />

                        <UploadDragAndDropButton
                            onFileSelect={handleFileSelect}
                            accept={fileAcceptString}
                            disabled={!canSendNewMessage || isUploading}
                            nsfw={true}
                            title={`Not Safe for Work — ${uploadGuidance || "loading upload limits"}`}
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
                            disabled={isSending}
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
                            isUploading || isCooldown || isSending
                        }
                        size="icon"
                        title="Send"
                        aria-label={isSending ? "Sending message" : "Send message"}
                    >
                        {isSending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin"/> : <Send aria-hidden="true" className="h-4 w-4"/>}
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
                    {isTextInputAvailable && (
                        <span className="block">Start a line with &gt; for greentext.</span>
                    )}
                    {!isConnected && ` • ${disabledReason || "Connecting to chat..."}`}
                    {!isEditing && messageSendingBlocked && ` • ${messageSendingDisabledReason}`}
                    {isUploading && " • Uploading file..."}
                    {isSending && (isEditing ? " • Saving changes..." : " • Sending message...")}
                    {isListening && (
                        <span className="text-red-500"> • Listening…</span>
                    )}
                </div>
                <div
                    className={`${remainingChars <= maxMessageLength * 0.1 && remainingChars >= 0 ? "text-amber-700 dark:text-amber-300" : ""
                    } ${remainingChars < 0 ? "text-red-600 dark:text-red-400" : ""} tabular-nums`}
                >
                    {remainingChars < 0 ? `${Math.abs(remainingChars).toLocaleString()} character${remainingChars === -1 ? '' : 's'} over limit` : isMobile
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
