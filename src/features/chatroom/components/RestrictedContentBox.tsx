import React from "react";
import {ShieldX} from "lucide-react";

export const RestrictedContentBox: React.FC = () => (
    <div
        className="flex flex-col items-center justify-center rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center max-w-[200px]">
        <ShieldX className="mb-2 h-8 w-8 text-red-500"/>
        <div className="text-sm font-semibold text-red-700">
            Restricted Content
        </div>
        <div className="mt-1 text-xs text-red-600">
            18+ Only
        </div>
    </div>
);