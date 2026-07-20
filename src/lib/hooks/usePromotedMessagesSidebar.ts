import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {selectActiveLeftPanel} from "@/redux/settings/settingsSelector";
import {setActiveLeftSidebar} from "@/redux/settings/settingsSlice";

export const usePromotedMessagesSidebar = () => {
    const dispatch = useDispatch<AppDispatch>();
    const activeLeftPanel = useSelector(selectActiveLeftPanel);

    const isActive = activeLeftPanel === 'promoted-messages';

    const toggleSidebar = () => {
        if (isActive) {
            dispatch(setActiveLeftSidebar(null));
        } else {
            dispatch(setActiveLeftSidebar('promoted-messages'));
        }
    };

    return {isActive, toggleSidebar};
};
