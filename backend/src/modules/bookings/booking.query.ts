import { Request } from "express";
import { BookingStatus, BookingSource } from "@prisma/client";

export type BookingQuery = {
  filters: {
    createdBy?: string;
    bookingSource?: BookingSource;
    status?: BookingStatus;
  };

  pagination: {
    page: number;
    limit: number;
    skip: number;
  };

  sort: {
    field: "createdAt" | "checkInDate" | "expectedCheckoutDate";
    order: "asc" | "desc";
  };
};

const allowedSortFields = [
  "createdAt",
  "checkInDate",
  "expectedCheckoutDate",
] as const;

const allowedStatuses: BookingStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
  "NO_SHOW",
];

const allowedSources: BookingSource[] = [
  "WALK_IN",
  "PHONE",
  "WHATSAPP",
  "ONLINE",
  "AGENT",
];

export const parseBookingQuery = (req: Request): BookingQuery => {
  const {
    createdBy,
    bookingSource,
    status,
    page = "1",
    limit = "10",
    sort,
  } = req.query;

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(100, Math.max(1, Number(limit)));

  // -----------------------------
  // SORT HANDLING (FIXED LOGIC)
  // -----------------------------
  let sortField: BookingQuery["sort"]["field"] = "createdAt";
  let sortOrder: "asc" | "desc" = "desc";

  if (typeof sort === "string") {
    const isDesc = sort.startsWith("-");
    const rawField = isDesc ? sort.slice(1) : sort;

    if (allowedSortFields.includes(rawField as any)) {
      sortField = rawField as BookingQuery["sort"]["field"];
      sortOrder = isDesc ? "desc" : "asc";
    }
  }

  // -----------------------------
  // FILTERS
  // -----------------------------
  let parsedBookingSource: BookingSource | undefined;
  if (
    typeof bookingSource === "string" &&
    allowedSources.includes(bookingSource as BookingSource)
  ) {
    parsedBookingSource = bookingSource as BookingSource;
  }

  let parsedStatus: BookingStatus | undefined;
  if (
    typeof status === "string" &&
    allowedStatuses.includes(status as BookingStatus)
  ) {
    parsedStatus = status as BookingStatus;
  }

  return {
    filters: {
      createdBy: typeof createdBy === "string" ? createdBy : undefined,
      bookingSource: parsedBookingSource,
      status: parsedStatus,
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