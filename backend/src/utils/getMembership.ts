import {prisma} from "../config/database";

export const getMembership = async (hotelId: string, userId: string) => {
  return await prisma.hotelMember.findFirst({
    where: {
      hotelId,
      userId,
    },
  });
}