
import express from "express";
import RoomRouter from "./room";

const router = express.Router();


router.use("/room", RoomRouter);


export default router;