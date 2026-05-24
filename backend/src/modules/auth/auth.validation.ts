import Joi from "joi";
import { PassThrough } from "node:stream";

export const registerSchema = Joi.object({
  name: Joi.string().trim().max(50).min(3).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }), 
});

export const loginSchema = Joi.object({
  email : Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }), 
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Verification token cannot be empty",
    "any.required": "Verification token is required",
  }),
  email : Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
})

export const resendVerificationEmailSchema = Joi.object({
  email : Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
})

export const forgotPasswordSchema = Joi.object({
  email : Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
})

export const resetPasswordSchema = Joi.object({
  email : Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  token: Joi.string().required().messages({
    "string.empty": "Reset token cannot be empty",
    "any.required": "Reset token is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "New password is required",
  }),
})