/* another apology for the inconsistency in the join hotel request naming , i just dont know what to name it and i am too lazy to think of a better name so please forgive me for this */
import { Request, Response } from "express";
import {
  addHotelMemberService,
  getAllHotelMembersService,
  requestJoinHotelService,
  rejectJoinHotelRequestService,
  approveJoinHotelRequestService,
  getAllHotelJoinRequestsService,
  removeHotelMemberService,
  updateHotelMemberRoleService,
  getSingleHotelMemberByUserIdService,
  getHotelMemberByIdService,
} from "./hotelMember.service";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { parseHotelMemberQuery } from "./hotelMember.query";
import { HotelParams } from "../../types/params.types";

export const addHotelMemberController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const { targetUserId, role } = req.body;

  const member = await addHotelMemberService(
    hotelId,
    userId,
    targetUserId,
    role,
  );

  res.status(HttpCodes.CREATED).json({
    code: AppCodes.HOTEL_MEMBER_ADDED,
    message: "Hotel member added successfully",
    data: member,
  });
};

export const requestJoinHotelController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const { role } = req.body;

  await requestJoinHotelService(hotelId, userId, role);

  res.status(HttpCodes.OK).json({
    code: AppCodes.JOIN_HOTEL_REQUESTED,
    message: "Join hotel request sent successfully",
  });
};

export const approveJoinHotelRequestController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const requestId = req.params.requestId;

  await approveJoinHotelRequestService(hotelId, userId, requestId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.JOIN_HOTEL_APPROVED,
    message: "Join hotel request approved successfully",
  });
};

export const rejectJoinHotelRequestController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const requestId = req.params.requestId;

  await rejectJoinHotelRequestService(hotelId, userId, requestId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.JOIN_HOTEL_REJECTED,
    message: "Join hotel request rejected successfully",
  });
};

export const getAllHotelJoinRequestsController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;

  const requests = await getAllHotelJoinRequestsService(hotelId, userId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "Hotel join requests retrieved successfully",
    data: requests,
  });
};

export const getHotelMemberByIdController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const memberId = req.params.memberId;

  const member = await getHotelMemberByIdService(hotelId, userId, memberId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "Hotel member retrieved successfully",
    data: member,
  });
};

export const getAllHotelMembersController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
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

export const getSingleHotelMemberByUserIdController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const targetUserId = req.params.userId;

  const member = await getSingleHotelMemberByUserIdService(
    hotelId,
    userId,
    targetUserId,
  );

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "Hotel member retrieved successfully",
    data: member,
  });
};

export const removeHotelMemberController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const targetUserId = req.params.userId;

  await removeHotelMemberService(hotelId, userId, targetUserId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.HOTEL_MEMBER_REMOVED,
    message: "Hotel member removed successfully",
  });
};

export const updateHotelMemberRoleController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
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
