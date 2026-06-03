import {Request} from "express";
import { RoomStatus, RoomType } from "@prisma/client";

export type RoomQuery = {
    filters : {
        roomNumber?: string,
        price?: number,
        type?: RoomType,
        capacity?:number,
        isActive?:boolean,
        status?:RoomStatus,
    },
    pagination: {
        page:number,
        limit:number,
        skip: number
    },
    sort:{
        field: string,
        order: 'asc' | "desc"
    }
}

export const parseRoomQuery = (req: Request)=>{
    const {
        roomNumber,
        price, 
        type,
        capacity,
        isActive,
        status,
        sort,
        page = "1",
        limit = "10"
    } = req.query;

    const allowedSortFields = [
        "createdAt",
        "price",
        "capacity",
        "roomNumber"
    ];
    
    let sortField = "createdAt";
    let sortOrder: 'asc' | "desc" = "desc";
    
    if (typeof sort === "string") {
        if(sort.startsWith("-")) {
            const field = sort.slice(1);
            if(allowedSortFields.includes(field)) {
                sortField = field;
                sortOrder = "desc";
            }
        } else {
            if(allowedSortFields.includes(sort)) {
                sortField = sort;
                sortOrder = "asc";
            }
        }
    }

    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));

    return {
        filters: {
            roomNumber: typeof roomNumber === "string" ? roomNumber.trim() : undefined,
            price: typeof price === "string" ? Number(price) : undefined,
            type: typeof type === "string" ? type as RoomType : undefined,
            capacity: typeof capacity === "string" ? Number(capacity) : undefined,
            isActive: typeof isActive === "string" ? isActive.toLowerCase() === "true" : undefined,
            status: typeof status === "string" ? status as RoomStatus : undefined
        },
        pagination: {
            page: parsedPage,
            limit: parsedLimit,
            skip: (parsedPage - 1) * parsedLimit
        },
        sort: {
            field: sortField,
            order: sortOrder
        }
    };
}