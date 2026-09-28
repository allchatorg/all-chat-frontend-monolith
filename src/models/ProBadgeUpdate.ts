import type {FontSnapshot} from '@/lib/fontPresets';

export interface ProBadgeUpdate extends Partial<FontSnapshot> {
    userId: number;
    proBadgeVisible: boolean;
    proBadgeRevision: number;
}
