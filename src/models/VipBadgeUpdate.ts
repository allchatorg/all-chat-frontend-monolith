import type {FontSnapshot} from '@/lib/fontPresets';

export interface VipBadgeUpdate extends Partial<FontSnapshot> {
    userId: number;
    vipBadgeVisible: boolean;
    vipBadgeRevision: number;
}
