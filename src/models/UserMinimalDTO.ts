import type {FontSnapshot} from "@/lib/fontPresets";
export interface UserMinimalDTO extends Partial<FontSnapshot> {
    id: number;
    username: string;
    proBadgeVisible?: boolean;
    proBadgeRevision?: number;
}
