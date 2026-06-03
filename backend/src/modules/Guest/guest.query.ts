import { Request } from "express";
import { Gender } from "@prisma/client";

export type GuestQuery = {
  filters: {
    fullName?: string;
    phone?: string;
    idType?: string;
    idNumber?: string;
    gender?: Gender;
    notes?: string;
  };
  pagination: {
    page: number;
    limit: number;
    skip: number;
  };
  sort: {
    field: "createdAt";
    order: "asc" | "desc";
  };
};

// strict enum validation
const isValidGender = (value: any): value is Gender => {
  return ["MALE", "FEMALE", "FOOL"].includes(value);
};

export const parseGuestQuery = (req: Request): GuestQuery => {
  const {
    fullName,
    phone,
    idType,
    idNumber,
    gender,
    notes,
    sort,
    page = "1",
    limit = "10",
  } = req.query;

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(100, Math.max(1, Number(limit)));

  let sortField = "createdAt" as const;
  let sortOrder: "asc" | "desc" = "desc";

  const allowedSortFields = ["createdAt"] as const;

  if (typeof sort === "string") {
    if (sort.startsWith("-")) {
      const field = sort.slice(1);
      if (allowedSortFields.includes(field as any)) {
        sortField = field as "createdAt";
        sortOrder = "desc";
      }
    } else {
      if (allowedSortFields.includes(sort as any)) {
        sortField = sort as "createdAt";
        sortOrder = "asc";
      }
    }
  }

  return {
    filters: {
      fullName: typeof fullName === "string" ? fullName.trim() : undefined,
      phone: typeof phone === "string" ? phone.trim() : undefined,
      idType: typeof idType === "string" ? idType : undefined,
      idNumber: typeof idNumber === "string" ? idNumber : undefined,
      gender: isValidGender(gender) ? gender : undefined,
      notes: typeof notes === "string" ? notes : undefined,
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
};