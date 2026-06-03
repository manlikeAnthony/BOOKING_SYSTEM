import Joi from "joi";

export const createGuestSchema = Joi.object({
  fullName: Joi.string().trim().max(100).required().messages({
    "string.max": "Full name cannot exceed 100 characters",
    "any.required": "Full name is required",
  }),
  phone: Joi.string().trim().max(20).required().messages({
    "string.max": "Phone number cannot exceed 20 characters",
    "any.required": "Phone number is required",
  }),
  gender: Joi.string().valid("MALE", "FEMALE", "FOOL").required().messages({
    "any.only": "Gender must be one of MALE,FEMALE,FOOL",
    "any.required": "Gender is required",
  }),
  idType: Joi.string().trim().max(50).optional().messages({
    "string.max": "ID type cannot exceed 50 characters",
  }),
  idNumber: Joi.string().trim().max(50).optional().messages({
    "string.max": "ID number cannot exceed 50 characters",
  }),
  notes: Joi.string().trim().max(500).optional().messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
});

export const updateGuestSchema = Joi.object({
  fullName: Joi.string().trim().max(100).optional().messages({
    "string.max": "Full name cannot exceed 100 characters",
  }),
  phone: Joi.string().trim().max(20).optional().messages({
    "string.max": "Phone number cannot exceed 20 characters",
  }),
    gender: Joi.string().valid("MALE", "FEMALE", "FOOL").optional().messages({
    "any.only": "Gender must be one of  MALE,FEMALE,FOOL",
  }),
    idType: Joi.string().trim().max(50).optional().messages({
    "string.max": "ID type cannot exceed 50 characters",
  }),
  idNumber: Joi.string().trim().max(50).optional().messages({
    "string.max": "ID number cannot exceed 50 characters",
  }),
  notes: Joi.string().trim().max(500).optional().messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
}).or("fullName", "phone", "gender", "idType", "idNumber", "notes").messages({
  "object.missing": "At least one field (fullName, phone, gender, idType, idNumber, notes) must be provided for update",
});