import { Request } from "express";

export type HotelMemberQuery = {
    filters: {
        role?: string;
    };

    pagination: {
        page: number;
        limit: number;
        skip: number;
    };

    sort: {
        field: string;
        order: "asc" | "desc";
    };
};

export const parseHotelMemberQuery = (req: Request): HotelMemberQuery => {
    const {
        role,
        sort,
        page = "1",
        limit = "10",
    } = req.query;

    const allowedSortFields = [
        "createdAt",
        "name",
    ];

    let sortField = "createdAt";
    let sortOrder: "asc" | "desc" = "desc";

    if (typeof sort === "string") {
        if (sort.startsWith("-")) {
            const field = sort.slice(1);

            if (allowedSortFields.includes(field)) {
                sortField = field;
                sortOrder = "desc";
            }
        } else if (allowedSortFields.includes(sort)) {
                sortField = sort;
                sortOrder = "asc";
            }
    }

    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));

    return {
        filters: {
            role:
                typeof role === "string"
                    ? role.trim()
                    : undefined,
        },

        pagination: {
            page: parsedPage,
            limit: parsedLimit,
            skip: (parsedPage - 1) * parsedLimit,
        },

        sort: {
            field: sortField,
            order: sortOrder,
        },
    };
}