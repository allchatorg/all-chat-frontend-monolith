import Image from 'next/image';
import {Sticker} from 'lucide-react';
import {getSticker, getStickerLabel} from './catalog';

/** Resolve persisted identities through the local catalog, never as image paths. */
export function StickerMessage({stickerId, deleted = false}: {stickerId: string; deleted?: boolean}) {
    if (deleted) {
        return <span className="px-3 py-2 text-sm italic text-muted-foreground">Message removed</span>;
    }

    const sticker = getSticker(stickerId);
    if (!sticker) {
        return (
            <span className="flex h-36 w-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                <Sticker className="h-8 w-8" aria-hidden="true"/>
                Unavailable sticker
            </span>
        );
    }

    return <Image src={sticker.src} alt={getStickerLabel(stickerId)} width={160} height={160}
                  unoptimized draggable={false} className="h-36 w-36 max-w-full object-contain sm:h-40 sm:w-40"/>;
}
