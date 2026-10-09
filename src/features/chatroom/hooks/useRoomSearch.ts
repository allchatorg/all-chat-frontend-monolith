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

export type RoomVipFilter = "all" | "vip" | "standard";

export const useRoomSearch = (initialSearchTerm = "") => {
    const [runSearchRoomThunk, searchRoomIsLoading] = useThunk(searchChatRoomsByNameThunk);
    const {handleJoinRandomRoom: joinRandomRoom, joinRandomRoomIsLoading} = useJoinRandomRoom();
    const userChatRooms = useSelector(selectJoinedUserChatRoomsState);

    const {user} = useUser();
    const {handleJoinRoom, handleCreateRoom} = useChatRooms(user);

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [vipOnly, setVipOnly] = useState(false);
    const [vipFilter, setVipFilter] = useState<RoomVipFilter>("all");
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
    }, [searchTerm, vipOnly]);

    useEffect(() => {
        if (!user?.vipActive) setVipOnly(false);
    }, [user?.vipActive]);

    const clearSearch = () => {
        setVipOnly(false);
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
        return rooms.filter((room) =>
            (!normalizedQuery || room.roomName.toLowerCase().includes(normalizedQuery)) &&
            (vipFilter === "all" || (vipFilter === "vip") === (room.vipOnly === true))
        );
    }, [searchTerm, rooms, vipFilter]);

    const exactRooms = useMemo(() => rooms.filter(room =>
        room.roomName.trim().toLowerCase() === searchTerm.trim().toLowerCase()
    ), [rooms, searchTerm]);
    const standardExists = exactRooms.some(room => !room.vipOnly);
    const vipExists = exactRooms.some(room => room.vipOnly);
    // When one variant of the name already exists, only the other one can be created.
    const vipModeLocked = standardExists || vipExists;
    const effectiveVipOnly = standardExists || (!vipExists && vipOnly);

    const validateName = (value: string) => {
        if (!value.trim()) return "Name cannot be empty.";
        if (/[^a-zA-Z0-9 ]/.test(value)) return "Only letters, numbers, and spaces are allowed.";
        if (/\s{2,}/.test(value)) return "No double spaces allowed.";
        return true;
    };

    const validationResult: string | true = validateName(searchTerm);
    const showCreateOption =
        searchTerm.trim().length >= 1 &&
        !(standardExists && vipExists) &&
        !searchRoomIsLoading &&
        lastSearchedTerm === searchTerm.trim() &&
        validationResult === true;

    const canCreate = showCreateOption && !isCreating;
    const handleCreateChatRoom = async (): Promise<boolean> => {
        if (!canCreate || creatingRef.current || !user || user.role === Role.GUEST) return false;
        if (effectiveVipOnly && !user.vipActive) return false;
        creatingRef.current = true;
        setIsCreating(true);
        setCreationError(null);
        try {
            await handleCreateRoom({name: searchTerm.trim(), vipOnly: effectiveVipOnly});
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
        vipOnly: effectiveVipOnly,
        setVipOnly,
        vipFilter,
        setVipFilter,
        vipModeLocked,
        isCreating,
        creationError,
        canCreate,
        validationResult,
        lastSearchedTerm,
        joinedRoomIds,
        user
    };
};
