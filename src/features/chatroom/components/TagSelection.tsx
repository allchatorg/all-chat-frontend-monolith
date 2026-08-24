import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Tag as TagIcon} from 'lucide-react';
import {Tag} from '@/models/Tag';
import {useSelector} from "react-redux";
import {selectUser} from "@/redux/user/userSelectors";

interface TagSelectionProps {
    availableTags: Tag[];
    selectedTags: Tag[];
    onTagsSelected: (tags: Tag[]) => void;
    file: File;
    onCancel: () => void;
    isEditing?: boolean;
}

const TagSelection: React.FC<TagSelectionProps> = ({
                                                       availableTags,
                                                       selectedTags,
                                                       onTagsSelected,
                                                       onCancel,
                                                       file,
                                                       isEditing = false
                                                   }) => {
    const [currentSelectedTags, setCurrentSelectedTags] = useState<Tag[]>(selectedTags);
    const user = useSelector(selectUser);

    const toggleTag = (tag: Tag) => {
        setCurrentSelectedTags(prev => {
            const isSelected = prev.some(t => t.id === tag.id);
            if (isSelected) {
                return prev.filter(t => t.id !== tag.id);
            } else {
                return [...prev, tag];
            }
        });
    };

    const handleConfirm = () => {
        onTagsSelected(currentSelectedTags);
    };

    const isTagSelected = (tag: Tag) => currentSelectedTags.some(t => t.id === tag.id);

    return (
        <div className="flex flex-col text-foreground p-2 w-[300px] max-h-[80vh]">
            <div className="mb-4 flex shrink-0 items-center">
                <TagIcon className="mr-2 h-5 w-5"/>
                <h2 className="text-lg font-semibold">
                    {isEditing ? 'Edit Tags' : 'Select Tags'}
                </h2>
            </div>

            <div className="mb-4 shrink-0">
                <p className="text-sm text-muted-foreground">Select tags that apply to this file:</p>
            </div>

            <div className="mb-6 grow overflow-y-auto space-y-2">
                {availableTags.map((tag) => {
                    const isSelected = isTagSelected(tag);
                    const isRestricted = tag.restrictedToAdults && !user?.isOver18;

                    return (
                        <div
                            key={tag.id}
                            className={`
                flex min-h-12 items-center justify-between px-3 py-2 rounded-lg border transition-colors
                ${isRestricted
                                ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                : 'bg-background hover:bg-accent cursor-pointer'}
            `}
                            onClick={() => {
                                if (!isRestricted) toggleTag(tag);
                            }}
                        >
                            <span className="text-sm font-medium">
                                {tag.name}
                            </span>

                            {isRestricted ? (
                                <span className="text-xs italic text-muted-foreground">18+</span>
                            ) : isSelected ? (
                                <Badge variant="secondary"
                                       className="bg-blue-600 text-white hover:bg-blue-600">
                                    Selected
                                </Badge>
                            ) : null}
                        </div>
                    );
                })}

            </div>

            <div className="flex shrink-0 justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleConfirm}>
                    Update Tags
                </Button>
            </div>
        </div>
    );
};

export default TagSelection;
