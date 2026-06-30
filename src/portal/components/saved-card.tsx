import {PaymentMethodDto} from "@ads/store/services/paymentApi";
import {IconBrandMastercard, IconBrandVisa, IconCreditCard, IconX} from "@tabler/icons-react";
import {cn} from "@ads/lib/utils";
import {Button} from "@ads/components/ui/button";
import {useState} from "react";
import {ConfirmationDialog} from "@ads/components/ui/confirmation-dialog";
import {useIsMobile} from "@ads/hooks/use-mobile";

interface SavedCardProps {
    card: PaymentMethodDto;
    className?: string;
    onRemove?: (cardId: string) => void;
}

export function SavedCard({card, className, onRemove}: SavedCardProps) {
    const isMobile = useIsMobile();
    const isVisa = card.brand.toLowerCase() === "visa";
    const isMastercard = card.brand.toLowerCase() === "mastercard";
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <>
            <div
                className={cn(
                    "min-w-[250px] relative w-full max-w-sm aspect-[1.586/1] rounded-xl p-6 text-white shadow-xl transition-transform hover:scale-[1.02] group",
                    "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900",
                    "border border-white/10",
                    className
                )}
            >
                {/* Delete Button */}
                {onRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "absolute top-2 right-2 h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 z-10 transition-opacity",
                            isMobile
                                ? "opacity-100" // always visible on mobile
                                : "opacity-0 group-hover:opacity-100" // hover on desktop
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDeleteDialogOpen(true);
                        }}
                    >
                        <IconX className="h-4 w-4"/>
                    </Button>
                )}

                <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <IconCreditCard className="h-6 w-6 text-white/50"/>
                        </div>
                        {isVisa && <IconBrandVisa className="h-12 w-12 text-white"/>}
                        {isMastercard && <IconBrandMastercard className="h-12 w-12 text-white"/>}
                        {!isVisa && !isMastercard && (
                            <span className="text-lg font-bold uppercase tracking-wider">{card.brand}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                            </div>
                            <div className="flex gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                            </div>
                            <div className="flex gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80"/>
                            </div>
                            <span className="font-mono text-xl tracking-widest text-white">
                                {card.last4}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-white/60">
                                    Card Holder
                                </span>
                                <span className="font-medium tracking-wide">{card.cardholderName}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase tracking-wider text-white/60">
                                    Expires
                                </span>
                                <span className="font-mono font-medium tracking-wide">
                                    {card.expMonth.toString().padStart(2, "0")}/{card.expYear.toString().slice(-2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => onRemove?.(card.id)}
                title="Remove Payment Method"
                description="Are you sure you want to remove this card? This action cannot be undone."
                confirmText="Remove"
                variant="destructive"
            />
        </>
    );
}

