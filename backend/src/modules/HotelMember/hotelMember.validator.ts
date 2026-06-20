import Joi from "joi";

export const addHotelMemberSchema = Joi.object({
    targetUserId: Joi.string().required().messages({
      "string.empty": "Target user ID cannot be empty",
      "any.required": "Target user ID is required",
    }),
  role: Joi.string()
    .valid("OWNER", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING", "ACCOUNTANT", "STAFF")
    .required()
    .messages({
      "any.only": "Role must be one of OWNER, MANAGER, RECEPTIONIST, HOUSEKEEPING, ACCOUNTANT, or STAFF",
      "any.required": "Role is required",
    }),
});

export const requestJoinHotelSchema = Joi.object({
    role: Joi.string().required().messages({
      "string.empty": "Role cannot be empty",
      "any.required": "Role is required",
    }),
});

export const removeHotelMemberSchema = Joi.object({
    targetUserId: Joi.string().required().messages({
      "string.empty": "Target user ID cannot be empty",
      "any.required": "Target user ID is required",
    }),
});

export const updateHotelMemberRoleSchema = Joi.object({
    targetUserId: Joi.string().required().messages({
      "string.empty": "Target user ID cannot be empty",
      "any.required": "Target user ID is required",
    }),
  role: Joi.string()
    .valid( "RECEPTIONIST", "HOUSEKEEPING", "MANAGER", "ACCOUNTANT" , "STAFF")
    .required()
    .messages({
      "any.only": "New role must be one of HOTEL_OWNER, RECEPTIONIST, HOUSEKEEPING, MANAGER, ACCOUNTANT, or STAFF",
      "any.required": "New role is required",
    }),
});

