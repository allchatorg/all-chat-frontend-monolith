"use client"

import * as React from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {ROUTES} from "@/routes";
import {useDialog} from "@/components/providers/DialogProvider";

type GuestModalWrapperProps = {
    isGuest: boolean
    onProceed?: () => void
    children: React.ReactNode
}

export function GuestModalWrapper({
                                      isGuest,
                                      onProceed,
                                      children,
                                  }: GuestModalWrapperProps) {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const {close} = useDialog();

    const childWithProps = React.cloneElement(
        children as React.ReactElement,
        {
            onPointerDown: (e: React.PointerEvent) => {
                if (isGuest) {
                    e.preventDefault()
                    e.stopPropagation()
                    setOpen(true)
                } else {
                    const originalOnPointerDown = (children as React.ReactElement).props.onPointerDown
                    if (originalOnPointerDown) {
                        originalOnPointerDown(e)
                    }
                }
            },
            onClick: (e: React.MouseEvent) => {
                if (!isGuest) {
                    const originalOnClick = (children as React.ReactElement).props.onClick
                    if (originalOnClick) {
                        originalOnClick(e)
                    }
                    onProceed?.()
                }
            },
        }
    )

    return (
        <>
            {childWithProps}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Login required</DialogTitle>
                        <DialogDescription>
                            You must login or sign up to proceed with this action.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="destructive">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button variant="outline" onClick={() => {
                            router.push(ROUTES.LOGIN)
                            close();
                        }}>Login</Button>
                        <Button
                            onClick={() => {
                                router.push(ROUTES.REGISTER)
                                close();
                            }}
                        >
                            Create Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}