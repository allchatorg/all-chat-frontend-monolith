import {createAction} from '@reduxjs/toolkit';

// A new credential session must not reuse the previous account's profile.
export const sessionEstablished = createAction('auth/sessionEstablished');
