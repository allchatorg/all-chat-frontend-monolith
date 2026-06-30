import type {ElementType} from "react";
import {Mail, Phone} from "lucide-react";

export type RecoveryMethod = "email" | "phone";

export type MethodConfig = {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    inputType: string;
    icon: ElementType;
};

export const methodConfigs: Record<RecoveryMethod, MethodConfig> = {
    email: {
        title: "Continue with email",
        description: "Use the email linked to your account.",
        label: "Email",
        placeholder: "m@example.com",
        inputType: "email",
        icon: Mail,
    },
    phone: {
        title: "Continue with phone",
        description: "Use the phone number on your account.",
        label: "Phone number",
        placeholder: "",
        inputType: "tel",
        icon: Phone,
    },
};

export const methodOrder: RecoveryMethod[] = ["email", "phone"];
