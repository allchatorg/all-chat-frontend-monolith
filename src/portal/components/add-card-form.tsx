"use client"

import {CardElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {useEffect, useState} from "react";
import {useTheme} from "next-themes";
import {Label} from "@ads/components/ui/label";
import {Input} from "@ads/components/ui/input";
import {Lock} from "lucide-react";
import {ActionButton} from "./ui/action-button";
import {useAddPaymentMethodMutation} from "@ads/store/services/paymentApi";
import {toast} from "sonner";

interface AddCardFormProps {
    onSuccess?: () => void;
}

export function AddCardForm({onSuccess}: AddCardFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [addPaymentMethod] = useAddPaymentMethodMutation();

    // Stripe's CardElement renders in an iframe and can't read our Tailwind/CSS
    // variables, so feed it explicit colors derived from the active theme.
    const {resolvedTheme} = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isDark = mounted && resolvedTheme === "dark";
    const cardElementStyle = {
        base: {
            fontSize: '16px',
            color: isDark ? '#e5e7eb' : '#424770',
            '::placeholder': {color: isDark ? '#6b7280' : '#aab7c4'},
        },
        invalid: {color: isDark ? '#fca5a5' : '#9e2146'},
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const cardElement = elements.getElement(CardElement);
        const nameInput = (document.getElementById('name') as HTMLInputElement).value;

        if (cardElement) {
            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {name: nameInput},
            });

            if (error) {
                toast.error(error.message || "Failed to create payment method");
            } else {
                try {
                    await addPaymentMethod({paymentMethodId: paymentMethod.id}).unwrap();
                    toast.success("Payment method added successfully");
                    cardElement.clear();
                    onSuccess?.();
                } catch {
                    toast.error("Failed to save payment method on server");
                }
            }
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Name on Card</Label>
                <Input id="name" placeholder="John Doe"/>
            </div>
            <div className="grid gap-2">
                <Label>Card Details</Label>
                <div className="p-3 border rounded-md bg-background">
                    <CardElement options={{style: cardElementStyle}}/>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3"/>
                    <span>Payments processed securely by</span>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                        alt="Stripe"
                        className="h-5 opacity-80 grayscale hover:grayscale-0 transition-all"
                    />
                </div>
            </div>
            <ActionButton type="submit" className="w-full" disabled={!stripe || isLoading}>
                {isLoading ? "Adding..." : "Add Card"}
            </ActionButton>
        </form>
    );
}
