import {useEffect, useMemo, useState} from "react";
import {useThunk} from "@/lib/hooks/useThunk";
import {
    joinChatRoomThunk,
    joinRandomAndSelectChatRoomThunk,
    searchChatRoomsByNameThunk
} from "@/redux/chatRoom/chatRoomThunk";
import {useSelector} from "react-redux";
import {selectJoinedUserChatRoomsState} from "@/redux/chatRoom/chatRoomSelectors";
import {RoomPopulation} from "@/models/roomPopulation";
import {useChatRooms} from "@/lib/hooks/useChatRooms";
import {useUser} from "@/lib/hooks/useUser";
import {toast} from "sonner";

const DEBOUNCE_DELAY = 400;

export const useRoomSearch = () => {
    const [runSearchRoomThunk, searchRoomIsLoading] = useThunk(searchChatRoomsByNameThunk);
    const [runJoinChatRoom] = useThunk(joinChatRoomThunk);
    const [runJoinRandomChatRoom, joinRandomRoomIsLoading] = useThunk(joinRandomAndSelectChatRoomThunk);
    const userChatRooms = useSelector(selectJoinedUserChatRoomsState);

    const {user} = useUser();
    const {handleCreateRoom: createAndJoinChatRoom, createLoading} = useChatRooms(user);

    const [searchTerm, setSearchTerm] = useState("");
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
        runSearchRoomThunk(debouncedSearchTerm)
            .then((data) => {
                setRooms(data);
                setLastSearchedTerm(debouncedSearchTerm);
            })
            .catch(() => setRooms([]));
    }, [debouncedSearchTerm, runSearchRoomThunk]);

    const handleJoinRoom = (roomId: number) => {
        runJoinChatRoom(roomId);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setRooms([]);
        setLastSearchedTerm("");
    };

    const handleJoinRandomRoom = async () => {
        try {
            const joinedRoom = await runJoinRandomChatRoom();
            toast.success(`Joined ${joinedRoom.chatRoomName}`);
            clearSearch();
            return joinedRoom;
        } catch (err: any) {
            toast.error(err?.message || "Failed to join a random chatroom.");
            throw err;
        }
    };

    const filteredRooms = useMemo(() => {
        if (!searchTerm.trim()) return rooms;
        return rooms.filter((room) =>
            room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, rooms]);

    // This handles local filtering to see if we have an exact match in the *currently searching* result or existing list
    const hasExactMatch = useMemo(() => {
        if (!searchTerm.trim()) return true;
        const normalizedQuery = searchTerm.trim().toLowerCase();
        return rooms.some((room) => room.roomName.trim().toLowerCase() === normalizedQuery);
    }, [searchTerm, rooms]);

    const validateName = (value: string) => {
        if (!value.trim()) return "Name cannot be empty.";
        if (/[^a-zA-Z0-9 ]/.test(value)) return "Only letters, numbers, and spaces are allowed.";
        if (/\s{2,}/.test(value)) return "No double spaces allowed.";
        return true;
    };

    const validationResult: string | true = validateName(searchTerm);
    const showCreateOption =
        searchTerm.trim().length >= 1 &&
        !hasExactMatch &&
        !searchRoomIsLoading &&
        lastSearchedTerm === searchTerm.trim() &&
        validationResult === true;

    const handleCreateChatRoom = async () => {
        const validationError = validateName(searchTerm);
        if (validationError !== true) {
            toast.error(validationError);
            return Promise.reject(validationError);
        }
        return createAndJoinChatRoom({name: searchTerm.trim()})
            .then(() => {
                toast.success("Chat room created and joined!");
                clearSearch();
            })
            .catch((err) => {
                toast.error(err.message || "Failed to create chat room.");
                throw err;
            });
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
        validationResult,
        lastSearchedTerm,
        joinedRoomIds,
        user
    };
};
