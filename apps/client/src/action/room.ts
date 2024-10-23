"use server"

import { db } from "@/db"
import { getServerSession } from "next-auth"
import random from "random-name"



export async function createRoom() {

    const Session = await getServerSession()

    if (Session?.user) {
        const email = Session.user.email as string

        if (!email) {
            console.log("email is required")
        }

        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log("user not found")
        }

        const room = await db.room.create({
            data: {
                name: random.place(),
                author: { connect: { email: user?.email } },
            },
        });

        return { message: "Room created successfully", room }
    }



}


export async function GetRooms() {
    const rooms = await db.room.findMany();

    return { message: "Rooms retrieved successfully", rooms }
}