// In the merged monolith there is a single Redux store (the chat store at
// src/redux/store.ts). The ads portal's RTK Query APIs are registered into it.
// This module just re-exports the unified store types so existing portal code
// (`@ads/store/hooks`, `@ads/store/slices/authSlice`) keeps type-checking
// against the real store shape.
export type {RootState, AppDispatch} from '@/redux/store';
export {store} from '@/redux/store';
