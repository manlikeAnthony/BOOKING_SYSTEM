import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { CustomError } from "../errors/CustomError";
import { HttpCodes } from "../errors/HttpCodes";
import { AppCodes } from "../errors/AppCodes";
import { Http } from "winston/lib/winston/transports";

export const validate = (schema : ObjectSchema)=>{
    return (req:Request, _res : Response , next : NextFunction)=>{
        const {error , value} = schema.validate(req.body , {
            abortEarly : false,
            stripUnknown : true
        })

        if(error){
            const message = error.details.map(d => d.message).join(", ")

            CustomError.throwError(
                HttpCodes.BAD_REQUEST,
                AppCodes.VALIDATION_FAILED,
                message
            )
        }
        
        req.body = value,
        next()
    }
}