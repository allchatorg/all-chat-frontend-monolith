import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {selectActiveRightPanel} from "@/redux/settings/settingsSelector";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";

export const usePopularitySidebar = () => {
    const dispatch = useDispatch<AppDispatch>();
    const activeRightPanel = useSelector(selectActiveRightPanel);

    const isActive = activeRightPanel === 'top-online';

    const toggleSidebar = () => {
        if (isActive) {
            dispatch(setActiveRightSidebar(null));
        } else {
            dispatch(setActiveRightSidebar('top-online'));
        }
    };

    return {isActive, toggleSidebar};
};
