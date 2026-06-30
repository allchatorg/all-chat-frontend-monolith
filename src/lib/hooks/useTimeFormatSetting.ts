import {useSelector} from "react-redux";
import {selectTimeFormatSetting} from "@/redux/user/userSelectors";
import {TimeFormat} from "@/models/TimeFormat";

export const useFormatMessageDate = () => {
    const timeFormat = useSelector(selectTimeFormatSetting) ?? TimeFormat.H24;

    const formatMessageDate = (date: string | Date): string => {
        const messageDate = new Date(date);
        const now = new Date();

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

        const diffTime = today.getTime() - msgDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const timeStr = messageDate.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: timeFormat === TimeFormat.H12,
        });

        if (diffDays === 0) {
            return timeStr;
        }

        if (diffDays === 1) {
            return `Yesterday ${timeStr}`;
        }

        const options: Intl.DateTimeFormatOptions = {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: timeFormat === TimeFormat.H12,
        };

        if (messageDate.getFullYear() !== now.getFullYear()) {
            options.year = "numeric";
        }

        return messageDate.toLocaleString([], options);
    };

    return {timeFormat, formatMessageDate};
};
