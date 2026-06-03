import Joi from "joi"


export const createRoomSchema = Joi.object({
    roomNumber : Joi.string().trim().max(10).required().messages({
        "string.max": "Room number cannot exceed 10 characters",
        "any.required": "Room number is required",
    }),
    price : Joi.number().positive().required().messages({
        "number.positive": "Price must be a positive number",
        "any.required": "Price is required",
    }),
    type: Joi.string().valid("SINGLE", "DOUBLE", "SUITE").required().messages({
        "any.only": "Type must be one of SINGLE, DOUBLE, SUITE",
        "any.required": "Type is required",
    }),
    capacity : Joi.number().integer().positive().required().messages({
        "number.integer": "Capacity must be an integer",
        "number.positive": "Capacity must be a positive number",
        "any.required": "Capacity is required",
    }),
    status: Joi.string().valid("AVAILABLE", "OCCUPIED", "MAINTENANCE").optional().messages({
        "any.only": "Status must be one of AVAILABLE, OCCUPIED, MAINTENANCE",
        "any.required": "Status is required",
    }),
})