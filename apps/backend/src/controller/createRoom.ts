import { Request, Response, NextFunction } from 'express';
import random from 'random-name';
import { db } from '../db';

export async function createRoom(req: Request, res: Response,) {

    try {

        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
        }

        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }

        const room = await db.room.create({
            data: {
                name: random.place(),
                author: { connect: { email: user?.email } },
            },
        });

        res.status(201).json({ message: 'Room created successfully', room });
    }
    catch (e) {
        console.log("error:", e)
    }
}

export async function getRooms(req: Request, res: Response) {

    const rooms = await db.room.findMany();

    res.status(200).json({ message: 'Rooms retrieved successfully', rooms });



}