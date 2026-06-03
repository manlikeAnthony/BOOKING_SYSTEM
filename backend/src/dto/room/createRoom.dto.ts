import { RoomType } from "@prisma/client"

export interface CreateRoomDTO {
    roomNumber : string;
    price : number;
    type: RoomType;
    capacity : number;
}