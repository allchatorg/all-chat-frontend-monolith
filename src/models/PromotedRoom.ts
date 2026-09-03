import {RoomPopulation} from "@/models/roomPopulation";

/**
 * Row of GET /chat-rooms/promoted — live room stats plus the timestamp of the
 * most recent APPROVED promotion (which also decides the list order).
 */
export interface PromotedRoom extends RoomPopulation {
    promotedAt: string;
}
