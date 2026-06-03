import Joi from "joi";
import { add } from "winston";

export const createHotelSchema = Joi.object({
  name: Joi.string().trim().max(100).min(3).required().messages({
    "string.max": "Hotel name cannot exceed 100 characters",
    "string.min": "Hotel name must be at least 3 characters",
    "any.required": "Hotel name is required",
  }),
  email: Joi.string().email().trim().max(100).required().messages({
    "string.email": "Invalid email format",
    "string.max": "Email cannot exceed 100 characters",
    "any.required": "Email is required",
  }),
  phone: Joi.string().trim().max(20).required().messages({
    "string.max": "Phone number cannot exceed 20 characters",
    "any.required": "Phone number is required",
  }),
      // description: Joi.string().trim().max(500).optional().messages({
      //   "string.max": "Description cannot exceed 500 characters",
      // }), -- IGNORE ---
  address: Joi.string().trim().max(200).required().messages({
    "string.max": "Address cannot exceed 200 characters",
    "any.required": "Address is required",
  }),
});

export const updateHotelSchema = Joi.object({
  name: Joi.string().trim().max(100).min(3).optional().messages({
    "string.max": "Hotel name cannot exceed 100 characters",
    "string.min": "Hotel name must be at least 3 characters",
  }),
  email: Joi.string().email().trim().max(100).optional().messages({
    "string.email": "Invalid email format",
    "string.max": "Email cannot exceed 100 characters",
  }),
  phone: Joi.string().trim().max(20).optional().messages({
    "string.max": "Phone number cannot exceed 20 characters",
  }),
  // description: Joi.string().trim().max(500).optional().messages({
  //   "string.max": "Description cannot exceed 500 characters",
  // }), -- IGNORE ---
  address: Joi.string().trim().max(200).optional().messages({
    "string.max": "Address cannot exceed 200 characters",
  }),
});
