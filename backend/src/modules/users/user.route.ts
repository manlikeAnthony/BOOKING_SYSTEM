import express from "express";
import {
  getAllUsersController,
  getUserByIdController,
  deleteUserController,
} from "./user.controller";
import { authenticateUser, authorizeRoles } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles("admin"));

router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.delete("/:id", deleteUserController);

export default router;