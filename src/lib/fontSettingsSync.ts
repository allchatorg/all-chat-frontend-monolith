import {store} from '@/redux/store';
import {selectUser} from '@/redux/user/userSelectors';
import {setUser} from '@/redux/user/userSlice';
import {FontSnapshot} from './fontPresets';
import {applyFontUpdate, getFontSnapshot} from './fontStore';

/** Ignore late settings responses after switching accounts. */
export function syncOwnFontSettings(userId: number, snapshot: FontSnapshot): void {
    const user = selectUser(store.getState());
    if (user?.id !== userId) return;
    applyFontUpdate({userId, ...snapshot});
    const resolved = getFontSnapshot(userId);
    if (resolved) store.dispatch(setUser({user: {...user, ...resolved}}));
}
