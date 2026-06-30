import {useCallback, useEffect, useMemo, useState} from "react";
import {Attachment} from "@/models/Attachment";
import {useSelector} from "react-redux";
import {selectAttachmentTypesState} from "@/redux/settings/settingsSelector";
import {useThunk} from "@/lib/hooks/useThunk";
import {getAllAttachmentTypesThunk} from "@/redux/settings/settingsThunk";
import {selectUser} from "@/redux/user/userSelectors";

export const useAttachmentHook = () => {
    const user = useSelector(selectUser);

    const {
        attachmentTypes,
        isLoading: attachmentTypesLoading,
        error: attachmentTypesError
    } = useSelector(selectAttachmentTypesState);

    const [getAllAttachmentTypes] = useThunk(getAllAttachmentTypesThunk);

    useEffect(() => {
        const shouldFetch =
            user &&
            !attachmentTypes.length &&
            !attachmentTypesLoading &&
            !attachmentTypesError;

        if (shouldFetch) {
            getAllAttachmentTypes();
        }
    }, [attachmentTypes.length, attachmentTypesLoading, attachmentTypesError]);

    const [unblurredAttachments, setUnblurredAttachments] = useState<Set<number>>(new Set());

    const blurredContentTags = useMemo(() =>
            Array.isArray(user?.blurredContentTags) ? user.blurredContentTags : [],
        [user?.blurredContentTags]
    );

    const isNotOver18 = useMemo(() =>
            !user?.isOver18,
        [user?.isOver18]
    );

    const isRestrictedForUser = useCallback((attachment: Attachment): boolean => {
        if (!attachment.tags?.length) return false;
        return isNotOver18 && attachment.tags.some(tag => tag.restrictedToAdults);
    }, [isNotOver18]);

    const shouldBlurAttachment = useCallback((attachment: Attachment): boolean => {
        if (!attachment.tags?.length) return false;
        return attachment.tags.some(tag =>
            !blurredContentTags.some(userTag => userTag.id === tag.id)
        );
    }, [blurredContentTags]);

    const handleUnblurAttachment = useCallback((attachmentId: number) => {
        setUnblurredAttachments(prev => new Set(prev).add(attachmentId));
    }, []);

    const handleReblurAttachment = useCallback((attachmentId: number) => {
        setUnblurredAttachments(prev => {
            const next = new Set(prev);
            next.delete(attachmentId);
            return next;
        });
    }, []);

    return {
        unblurredAttachments,
        isRestrictedForUser,
        shouldBlurAttachment,
        handleUnblurAttachment,
        handleReblurAttachment,
        attachmentTypes,
        attachmentTypesLoading,
        attachmentTypesError,
    };
};