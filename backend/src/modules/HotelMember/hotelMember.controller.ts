import {Request , Response} from "express";
import {
  addHotelMemberService,
  getAllHotelMembersService,
  removeHotelMemberService,
  updateHotelMemberRoleService,
  getSingleHotelMemberService,

} from "./hotelMember.service";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { parseHotelMemberQuery } from "./hotelMember.query";
import { HotelParams } from "../../types/params.types";

export const addHotelMemberController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const { targetUserId, role } = req.body;

  const member = await addHotelMemberService(hotelId, userId, targetUserId, role);

  res.status(HttpCodes.CREATED).json({
    code: AppCodes.HOTEL_MEMBER_ADDED,
    message: "Hotel member added successfully",
    data: member,
  });
};

export const getAllHotelMembersController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const query = parseHotelMemberQuery(req);

  const members = await getAllHotelMembersService(hotelId, userId, query);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "Hotel members retrieved successfully",
    data: members,
  });
};

export const getSingleHotelMemberController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const targetUserId = req.params.userId;

  const member = await getSingleHotelMemberService(hotelId, userId, targetUserId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "Hotel member retrieved successfully",
    data: member,
  });
};


export const removeHotelMemberController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const targetUserId  = req.params.userId;

  await removeHotelMemberService(hotelId, userId, targetUserId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.HOTEL_MEMBER_REMOVED,
    message: "Hotel member removed successfully",
  });
};

export const updateHotelMemberRoleController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const targetUserId = req.params.userId;
  const { role } = req.body;

  await updateHotelMemberRoleService(hotelId, userId, targetUserId, role);

  res.status(HttpCodes.OK).json({
    code: AppCodes.HOTEL_MEMBER_ROLE_UPDATED,
    message: "Hotel member role updated successfully",
  });
};
