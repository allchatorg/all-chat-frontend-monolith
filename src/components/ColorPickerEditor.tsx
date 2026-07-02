import {useEffect, useState} from "react";
import {Check, RefreshCw, X} from "lucide-react";
import {Label} from "@radix-ui/react-label";
import {Input} from "./ui/input";
import {Button} from "./ui/button";
import {Spinner} from "@/components/Spinner";

interface ColorPickerProps {
    currentColor: string;
    onColorChange: (color: string) => void;
    isLoading?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
                                                            currentColor,
                                                            onColorChange,
                                                            isLoading = false,
                                                        }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempColor, setTempColor] = useState(currentColor);
    const [isValidColor, setIsValidColor] = useState(true);

    const presetColors = [
        "#EF4444", "#F97316", "#F59E0B", "#EAB308",
        "#84CC16", "#22C55E", "#10B981", "#14B8A6",
        "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
        "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
        "#F43F5E", "#6B7280", "#374151", "#111827"
    ];

    useEffect(() => {
        setTempColor(currentColor);
        setIsValidColor(true);
    }, [currentColor]);

    const validateHexColor = (color: string): boolean => {
        const hexRegex = /^#([A-Fa-f0-9]{6})$/;
        return hexRegex.test(color);
    };

    const handleColorSelect = (color: string) => {
        setTempColor(color);
        setIsValidColor(validateHexColor(color));
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setTempColor(color);
        setIsValidColor(validateHexColor(color));
    };

    const handleSave = () => {
        if (!isValidColor || !hasChanges || isLoading) return;
        onColorChange(tempColor);
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (isLoading) return;
        setTempColor(currentColor);
        setIsValidColor(true);
        setIsEditing(false);
    };

    const generateRandomColor = () => {
        const randomColor =
            "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
        setTempColor(randomColor);
        setIsValidColor(true);
    };

    const hasChanges = tempColor !== currentColor;

    if (isLoading) {
        return (
            <div
                className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-xs flex items-center justify-center min-h-[200px]">
                <Spinner size={32}/>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-xs">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label className="text-sm font-medium">Color Selection</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                        Select a color for your outgoing messages.
                    </p>
                </div>
                {isEditing && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCancel}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSave}
                            disabled={!hasChanges || !isValidColor}
                            className="h-8 w-8"
                        >
                            <Check className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium">Current Color</Label>
                <button
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                    className="w-full group relative"
                >
                    <div
                        className="w-full h-16 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-inner transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                        style={{backgroundColor: isEditing ? tempColor : currentColor}}
                    />
                    <div
                        className="absolute inset-0 rounded-lg bg-linear-to-tr from-transparent via-transparent to-white/20 pointer-events-none"/>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                            {(isEditing ? tempColor : currentColor).toUpperCase()}
                        </span>
                    </div>
                </button>
            </div>
            {isEditing && (
                <>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Custom Color</Label>
                        <div className="flex gap-3 items-center">
                            <input
                                type="color"
                                value={tempColor}
                                onChange={handleCustomColorChange}
                                className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform"
                            />
                            <Input
                                type="text"
                                value={tempColor}
                                onChange={handleCustomColorChange}
                                placeholder="#000000"
                                className={`flex-1 font-mono text-sm ${!isValidColor ? "border-red-500 focus:border-red-500" : ""
                                }`}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={generateRandomColor}
                                className="p-1.5 h-auto"
                            >
                                <RefreshCw className="w-4 h-4"/>
                            </Button>
                        </div>
                        {!isValidColor && (
                            <p className="mt-1 text-sm text-red-500">
                                Please enter a valid hex color (e.g., #FF0000)
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Preset Colors</Label>
                        <div className="grid grid-cols-10 gap-2">
                            {presetColors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => handleColorSelect(color)}
                                    className="relative w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:scale-110 transition-all duration-200 hover:shadow-lg"
                                    style={{backgroundColor: color}}
                                    title={color}
                                >
                                    {tempColor === color && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white drop-shadow-lg"/>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};