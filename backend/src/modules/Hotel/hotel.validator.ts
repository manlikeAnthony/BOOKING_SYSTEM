import Joi from "joi";

export const createHotelSchema = Joi.object({
  name: Joi.string().trim().max(100).min(3).required().messages({
    "string.max": "Hotel name cannot exceed 100 characters",
    "string.min": "Hotel name must be at least 3 characters",
    "any.required": "Hotel name is required",
  }),
  description: Joi.string().trim().max(500).optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  location: Joi.string().trim().max(200).required().messages({
    "string.max": "Location cannot exceed 200 characters",
    "any.required": "Location is required",
  }),
});

export const updateHotelSchema = Joi.object({
  name: Joi.string().trim().max(100).min(3).optional().messages({
    "string.max": "Hotel name cannot exceed 100 characters",
    "string.min": "Hotel name must be at least 3 characters",
  }),
  description: Joi.string().trim().max(500).optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  location: Joi.string().trim().max(200).optional().messages({
    "string.max": "Location cannot exceed 200 characters",
  }),
});
