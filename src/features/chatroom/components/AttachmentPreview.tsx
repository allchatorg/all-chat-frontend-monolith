import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Edit, FileAudio, FileImage, FileVideo, Loader2, X} from "lucide-react";

interface AttachmentPreviewProps {
    file: File,
    onRemove: () => void,
    onEdit: () => void,
    isUploading?: boolean,
    nsfw?: boolean
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
                                                                 file,
                                                                 onRemove,
                                                                 onEdit,
                                                                 isUploading = false,
                                                                 nsfw
                                                             }) => {
    const [previewUrl, setPreviewUrl] = useState<string>("");

    React.useEffect(() => {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) {
            return <FileImage className="h-8 w-8 text-blue-500"/>;
        } else if (fileType.startsWith('video/')) {
            return <FileVideo className="h-8 w-8 text-purple-500"/>;
        } else if (fileType.startsWith('audio/')) {
            return <FileAudio className="h-8 w-8 text-green-500"/>;
        } else {
            return <FileImage className="h-8 w-8 text-blue-500"/>;
        }
    };

    const getFileTypeLabel = (fileType: string) => {
        if (fileType.startsWith('image/')) return 'Image';
        if (fileType.startsWith('video/')) return 'Video';
        if (fileType.startsWith('audio/')) return 'Audio';
        return 'File';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="glass-surface mb-3 rounded-lg p-2">
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    {file.type.startsWith('image/') ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-16 w-16 rounded border object-fit dark:border-zinc-700"
                        />
                    ) : (
                        <div
                            className="glass-surface flex h-16 w-16 items-center justify-center rounded">
                            {getFileIcon(file.type)}
                        </div>
                    )}

                    {/* Loading overlay */}
                    {isUploading && (
                        <div
                            className="absolute inset-0 flex items-center justify-center rounded bg-black bg-opacity-50">
                            <Loader2 className="h-6 w-6 animate-spin text-white"/>
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-700 dark:text-zinc-200">
                        {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {getFileTypeLabel(file.type)} • {formatFileSize(file.size)}
                        {isUploading && " • Uploading..."}
                    </p>
                </div>

                <div className="flex gap-1">
                    {nsfw && <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEdit}
                        className="glass-control h-8 w-8 p-1 dark:text-zinc-400 dark:hover:text-zinc-200"
                        title="Edit file"
                        disabled={isUploading}
                    >
                        <Edit className="h-4 w-4"/>
                    </Button>}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="glass-control h-8 w-8 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove file"
                        disabled={isUploading}
                    >
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AttachmentPreview;
