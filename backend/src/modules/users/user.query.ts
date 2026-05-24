import {Request} from 'express';

export type UserQuery = {
  filters: {
    search?: string;
    role?: string;
    status?: string;
  };
  pagination: {
    page: number;
    limit: number;
    skip: number;
  };
  sort: {
    field: string;
    order: 1 | -1;
  };
};

export const parseUserQuery = (req : Request): UserQuery => {
     const {
    search,
    role,
    status,
    sort,
    page = "1",
    limit = "10",
  } = req.query;

  const allowedSortFields = ["createdAt", "name", "email"];

  let sortField = "createdAt";
  let sortOrder: 1 | -1 = -1;

  if (typeof sort === "string") {
    if (sort.startsWith("-")) {
      const field = sort.slice(1);
      if (allowedSortFields.includes(field)) {
        sortField = field;
        sortOrder = -1;
      }
    } else {
      if (allowedSortFields.includes(sort)) {
        sortField = sort;
        sortOrder = 1;
      }
    }
  }

  return {
    filters: {
      search: typeof search === "string" ? search.trim() : undefined,
      role: typeof role === "string" ? role : undefined,
      status: typeof status === "string" ? status : undefined,
    },
    pagination: {
      page: Math.max(1, Number(page)),
      limit: Math.max(1, Number(limit)),
      skip:
        (Math.max(1, Number(page)) - 1) *
        Math.max(1, Number(limit)),
    },
    sort: {
      field: sortField,
      order: sortOrder,
    },
  };
}