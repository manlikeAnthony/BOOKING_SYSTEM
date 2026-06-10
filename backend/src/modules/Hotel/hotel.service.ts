import { prisma } from "../../config/database";
import slugify from "slugify";
import { CustomError } from "../../errors/CustomError";
import { HttpCodes } from "../../errors/HttpCodes";
import { AppCodes } from "../../errors/AppCodes";
import { HotelQuery } from "./hotel.query";

export const createHotelService = async (
  userId: string,
  data: {
    name: string;
    email?: string;
    phone: string;
    address: string;
  },
) => {
  const { name, email, phone, address } = data;

  if (!name || !phone || !address) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELDS,
      "Name, phone, and address are required",
    );
  }

  const slug = slugify(name, {
    lower: true,
    strict: true,
  });

  const existingHotel = await prisma.hotel.findUnique({
    where: { slug },
  });

  if (existingHotel) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.HOTEL_ALREADY_EXISTS,
      "A hotel with the same name already exists",
    );
  }

  const hotel = await prisma.$transaction(async(tx)=>{
    const createdHotel = await tx.hotel.create({
      data: {
        name,
        slug,
        email,
        phone,
        address,
      },
    });
    
    await tx.hotelMember.create({
      data : {
        hotelId : createdHotel.id,
        userId,
        role : "HOTEL_OWNER"
      }
    })


    return createdHotel;
  })

  return hotel;
};

export const getPublicHotelsService = async (query: HotelQuery) => {
  const { filters, sort, pagination } = query;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        address: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }
  const hotels = await prisma.hotel.findMany({
    where,
    skip: pagination.skip,
    take: pagination.limit,
    orderBy: {
      [sort.field]: sort.order,
    },
    include: {
      members: true,
    },
  });

  const totalHotels = await prisma.hotel.count({
    where,
  });

  return {
    hotels,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: totalHotels,
      totalPages: Math.ceil(totalHotels / pagination.limit),
    },
  };
};


export const getHotelByIdService = async (hotelId: string) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }

  return hotel;
};

export const deleteHotelService = async (hotelId: string , userId: string) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }
  const membership = await prisma.hotelMember.findFirst({
    where : {
      hotelId,
      userId,
      role : "HOTEL_OWNER"
    }
  })

if (!membership) {
  CustomError.throwError(
    HttpCodes.FORBIDDEN,
    AppCodes.UNAUTHORIZED,
    "You are not allowed to delete this hotel",
  );
}

  await prisma.$transaction(async(tx)=>{
    await tx.hotel.update({
      where:{id: hotelId},
      data : {
        isActive : false
       }
     })
     await tx.room.updateMany({
      where : {
        hotelId
      },
      data : {
        isActive : false
       }
    })

    await tx.hotelMember.deleteMany({
      where : {
        hotelId
      }
    })

    await tx.booking.updateMany({
      where:{
        hotelId,
        status:{
          in: ["PENDING_PAYMENT" , "CHECKED_IN"]
        }
      },
      data:{
        status: "CANCELLED"
      }
    })
  })

};

export const updateHotelService = async (
  hotelId: string,
  userId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  },
) => {
  const { name, email, phone, address } = data;

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }
  const membership = await prisma.hotelMember.findFirst({
    where : {
      hotelId,
      userId,
      role:{
        in : ["HOTEL_OWNER", "MANAGER"]
      }
    }
  })

if (!membership) {
  CustomError.throwError(
    HttpCodes.FORBIDDEN,
    AppCodes.UNAUTHORIZED,
    "You are not allowed to update this hotel",
  );
}
  let slug: string | undefined;

  if (name && name !== hotel.name) {
    slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const existingHotel = await prisma.hotel.findUnique({
      where: { slug },
    });

    if (existingHotel && existingHotel.id !== hotelId) {
      CustomError.throwError(
        HttpCodes.BAD_REQUEST,
        AppCodes.HOTEL_ALREADY_EXISTS,
        "A hotel with the same name already exists",
      );
    }
  }

  const updatedHotel = await prisma.hotel.update({
    where: { id: hotelId },
    data: {
      name,
      slug,
      email,
      phone,
      address,
    },
    include: {
      members: true,
    },
  });

  return updatedHotel;
};

export const adminDeactivateHotelService = async (hotelId: string , userId: string) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }

  const user = await prisma.user.findUnique({
    where : {
      id : userId
    }
  })

if (!user || user?.role !== "SUPER_ADMIN") {
  CustomError.throwError(
    HttpCodes.FORBIDDEN,
    AppCodes.UNAUTHORIZED,
    "You are not allowed to deactivate this hotel",
  );
}

  await prisma.$transaction(async(tx)=>{
    await tx.hotel.update({
      where:{id: hotelId},
      data : {
        isActive : false
       }
     })
     await tx.room.updateMany({
      where : {
        hotelId
      },
      data : {
        isActive : false
       }
    })
  })

};

export const adminActivateHotelService = async (hotelId: string , userId: string) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }

  const user = await prisma.user.findUnique({
    where : {
      id : userId
    }
  })

if (!user || user?.role !== "SUPER_ADMIN") {
  CustomError.throwError(
    HttpCodes.FORBIDDEN,
    AppCodes.UNAUTHORIZED,
    "You are not allowed to activate this hotel",
  );
}

if(hotel.isActive){
  CustomError.throwError(
    HttpCodes.BAD_REQUEST,
    AppCodes.HOTEL_ACTIVATED,
    "Hotel is already active",
  );
}
  await prisma.$transaction(async(tx)=>{
    await tx.hotel.update({
      where:{id: hotelId},
      data : {
        isActive : true
       }
     })
     await tx.room.updateMany({
      where : {
        hotelId
      },
      data : {
        isActive : true
       }
    })
  })

};