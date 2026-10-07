import {useEffect, useMemo, useRef, useState} from "react";
import {useThunk} from "@/lib/hooks/useThunk";
import {searchChatRoomsByNameThunk} from "@/redux/chatRoom/chatRoomThunk";
import {useSelector} from "react-redux";
import {selectJoinedUserChatRoomsState} from "@/redux/chatRoom/chatRoomSelectors";
import {RoomPopulation} from "@/models/roomPopulation";
import {useChatRooms} from "@/lib/hooks/useChatRooms";
import {useUser} from "@/lib/hooks/useUser";
import {apiErrorMessage} from "@/lib/apiError";
import {Role} from "@/models/Role";
import {useJoinRandomRoom} from "@/features/chatroom/hooks/useJoinRandomRoom";

const DEBOUNCE_DELAY = 400;

export const useRoomSearch = (initialSearchTerm = "") => {
    const [runSearchRoomThunk, searchRoomIsLoading] = useThunk(searchChatRoomsByNameThunk);
    const {handleJoinRandomRoom: joinRandomRoom, joinRandomRoomIsLoading} = useJoinRandomRoom();
    const userChatRooms = useSelector(selectJoinedUserChatRoomsState);

    const {user} = useUser();
    const {handleJoinRoom, handleCreateRoom} = useChatRooms(user);

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [proOnly, setProOnly] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [creationError, setCreationError] = useState<string | null>(null);
    const creatingRef = useRef(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [rooms, setRooms] = useState<RoomPopulation[]>([]);
    const [lastSearchedTerm, setLastSearchedTerm] = useState("");

    const joinedRoomIds = useMemo(
        () => new Set(userChatRooms.map(r => r.chatRoomId)),
        [userChatRooms]
    );

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        if (!debouncedSearchTerm) {
            setRooms([]);
            setLastSearchedTerm("");
            return;
        }
        let active = true;
        runSearchRoomThunk(debouncedSearchTerm)
            .then((data) => {
                if (!active) return;
                setRooms(data);
                setLastSearchedTerm(debouncedSearchTerm);
            })
            .catch(() => {
                if (active) setRooms([]);
            });
        return () => {
            active = false;
        };
    }, [debouncedSearchTerm, runSearchRoomThunk]);

    useEffect(() => {
        setCreationError(null);
    }, [searchTerm, proOnly]);

    useEffect(() => {
        if (!user?.proActive) setProOnly(false);
    }, [user?.proActive]);

    const clearSearch = () => {
        setProOnly(false);
        setCreationError(null);
        setSearchTerm("");
        setRooms([]);
        setLastSearchedTerm("");
    };

    const handleJoinRandomRoom = async () => {
        const joinedRoom = await joinRandomRoom();
        clearSearch();
        return joinedRoom;
    };

    const filteredRooms = useMemo(() => {
        const normalizedQuery = searchTerm.trim().toLowerCase();
        if (!normalizedQuery) return rooms;
        return rooms.filter((room) =>
            room.roomName.toLowerCase().includes(normalizedQuery)
        );
    }, [searchTerm, rooms]);

    const exactRooms = useMemo(() => rooms.filter(room =>
        room.roomName.trim().toLowerCase() === searchTerm.trim().toLowerCase()
    ), [rooms, searchTerm]);
    const standardExists = exactRooms.some(room => !room.proOnly);
    const proExists = exactRooms.some(room => room.proOnly);
    // When one variant of the name already exists, only the other one can be created.
    const proModeLocked = standardExists || proExists;
    const effectiveProOnly = standardExists || (!proExists && proOnly);

    const validateName = (value: string) => {
        if (!value.trim()) return "Name cannot be empty.";
        if (/[^a-zA-Z0-9 ]/.test(value)) return "Only letters, numbers, and spaces are allowed.";
        if (/\s{2,}/.test(value)) return "No double spaces allowed.";
        return true;
    };

    const validationResult: string | true = validateName(searchTerm);
    const showCreateOption =
        searchTerm.trim().length >= 1 &&
        !(standardExists && proExists) &&
        !searchRoomIsLoading &&
        lastSearchedTerm === searchTerm.trim() &&
        validationResult === true;

    const canCreate = showCreateOption && !isCreating;
    const handleCreateChatRoom = async (): Promise<boolean> => {
        if (!canCreate || creatingRef.current || !user || user.role === Role.GUEST) return false;
        if (effectiveProOnly && !user.proActive) return false;
        creatingRef.current = true;
        setIsCreating(true);
        setCreationError(null);
        try {
            await handleCreateRoom({name: searchTerm.trim(), proOnly: effectiveProOnly});
            clearSearch();
            return true;
        } catch (error) {
            setCreationError(apiErrorMessage(error));
            return false;
        } finally {
            creatingRef.current = false;
            setIsCreating(false);
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        rooms: filteredRooms,
        searchRoomIsLoading,
        joinRandomRoomIsLoading,
        handleJoinRoom,
        handleJoinRandomRoom,
        handleCreateChatRoom,
        clearSearch,
        showCreateOption,
        proOnly: effectiveProOnly,
        setProOnly,
        proModeLocked,
        isCreating,
        creationError,
        canCreate,
        validationResult,
        lastSearchedTerm,
        joinedRoomIds,
        user
    };
};
