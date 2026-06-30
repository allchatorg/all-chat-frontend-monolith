import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {searchUsersThunk} from "@/redux/privateChat/privateChatThunk";
import {selectUserSearchLoading, selectUserSearchResults} from "@/redux/privateChat/privateChatSelectors";
import {UserMinimalDTO} from "@/models/UserMinimalDTO";

const DEBOUNCE_DELAY = 400;

export interface UseUserSearch {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    users: UserMinimalDTO[];
    isLoading: boolean;
    lastSearchedTerm: string;
    clearSearch: () => void;
}

export const useUserSearch = (): UseUserSearch => {
    const dispatch = useDispatch<AppDispatch>();
    const searchResults = useSelector(selectUserSearchResults);
    const isLoading = useSelector(selectUserSearchLoading);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [lastSearchedTerm, setLastSearchedTerm] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        if (!debouncedSearchTerm) {
            setLastSearchedTerm("");
            return;
        }
        dispatch(searchUsersThunk({q: debouncedSearchTerm}))
            .unwrap()
            .then(() => setLastSearchedTerm(debouncedSearchTerm))
            .catch(() => setLastSearchedTerm(debouncedSearchTerm));
    }, [debouncedSearchTerm, dispatch]);

    const clearSearch = () => {
        setSearchTerm("");
        setLastSearchedTerm("");
    };

    return {
        searchTerm,
        setSearchTerm,
        users: searchResults?.content ?? [],
        isLoading,
        lastSearchedTerm,
        clearSearch,
    };
};
