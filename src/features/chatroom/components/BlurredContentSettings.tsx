import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {EyeOff, Save} from "lucide-react";
import {Tag} from "@/models/Tag";

interface BlurredContentSettingsProps {
    selectedTags?: Tag[];
    tags?: Tag[];
    onSaveBlurredContentPreferences: (tags: Tag[]) => void;
    isOver18?: boolean;
}

function BlurredContentSettings({
                                    selectedTags = [],
                                    tags = [],
                                    onSaveBlurredContentPreferences,
                                    isOver18 = false,
                                }: BlurredContentSettingsProps) {
    const [localSelectedTags, setLocalSelectedTags] = useState<Tag[]>(selectedTags);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    useEffect(() => {
        setLocalSelectedTags(Array.isArray(selectedTags) ? selectedTags : []);
    }, [selectedTags]);

    useEffect(() => {
        const selectedIds = Array.isArray(selectedTags) ? selectedTags.map(tag => tag.id).sort() : [];
        const localIds = Array.isArray(localSelectedTags) ? localSelectedTags.map(tag => tag.id).sort() : [];
        setHasChanges(JSON.stringify(selectedIds) !== JSON.stringify(localIds));
    }, [selectedTags, localSelectedTags]);

    const handleTagToggle = (tag: Tag) => {
        const isSelected = localSelectedTags.some(selected => selected.id === tag.id);

        if (isSelected) {
            setLocalSelectedTags(prev => prev.filter(selected => selected.id !== tag.id));
        } else {
            setLocalSelectedTags(prev => [...prev, tag]);
        }
    };

    const handleSave = () => {
        onSaveBlurredContentPreferences(localSelectedTags);
    };

    const handleReset = () => {
        setLocalSelectedTags(selectedTags);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <EyeOff className="h-5 w-5"/>
                    Sensitive Content Preferences
                </CardTitle>
                <CardDescription>
                    Choose which types of sensitive content you want to **see**. Unchecked types will remain blurred by
                    default.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No content tags available to configure.
                    </p>
                ) : (
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            Select content types you want to be visible:
                        </Label>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {tags.map((tag) => {
                                const isSelected = localSelectedTags.some(selected => selected.id === tag.id);
                                const isRestricted = !isOver18 && tag.restrictedToAdults

                                return (
                                    <div key={tag.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`tag-${tag.id}`}
                                            checked={isSelected}
                                            onCheckedChange={() => handleTagToggle(tag)}
                                            disabled={isRestricted}
                                        />
                                        <Label
                                            htmlFor={`tag-${tag.id}`}
                                            className={`text-sm font-normal cursor-pointer ${isRestricted ? 'opacity-50' : ''}`}
                                        >
                                            Show {tag.name}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {hasChanges && (
                    <div className="flex items-center justify-end gap-2 border-t pt-4">
                        <Button variant="outline" onClick={handleReset}>
                            Reset
                        </Button>
                        <Button onClick={handleSave} className="flex items-center gap-2">
                            <Save className="h-4 w-4"/>
                            Save Changes
                        </Button>
                    </div>
                )}

                {localSelectedTags.length > 0 && (
                    <div className="pt-2">
                        <p className="text-xs text-right text-muted-foreground">
                            You’ve opted to view {localSelectedTags.length} content
                            type{localSelectedTags.length !== 1 ? 's' : ''}.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default BlurredContentSettings;
