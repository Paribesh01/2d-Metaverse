import express from "express";
import { createRoom, getRooms } from "../controller/createRoom";

const RoomRouter = express.Router();

// Define the POST route for creating a room
RoomRouter.post("/", createRoom);
RoomRouter.get("/", getRooms)



export default RoomRouter;
