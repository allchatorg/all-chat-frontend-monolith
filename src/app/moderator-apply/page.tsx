import {ModeratorApplicationForm} from "@/features/moderator/components/ModeratorApplicationForm";
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Apply for Moderator | All Chat',
    description: 'Apply to become a moderator of the community',
};

export default function ModeratorApplyPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <ModeratorApplicationForm/>
        </div>
    );
}
