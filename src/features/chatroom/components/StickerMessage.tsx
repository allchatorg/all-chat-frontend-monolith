import {Sticker} from "lucide-react";
import {getStickerById} from "@/features/stickers/catalog";

/** Render only catalog assets, never a URL supplied in a message. */
export function StickerMessage({stickerId}: {stickerId: string}) {
    const sticker = getStickerById(stickerId);

    if (!sticker) {
        return (
            <span className="inline-flex items-center gap-1.5 py-2 text-sm text-muted-foreground">
                <Sticker className="h-4 w-4" aria-hidden="true"/>
                Sticker unavailable
            </span>
        );
    }

    return (
        <img
            src={sticker.src}
            alt={`${sticker.name} sticker`}
            title={sticker.name}
            width={160}
            height={160}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="my-1 h-40 w-40 max-w-full select-none object-contain"
        />
    );
}
