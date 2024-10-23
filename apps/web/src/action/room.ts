"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { getServerSession } from "next-auth";
import random from "random-name";

export async function createRoom() {
    const session = await getServerSession(authOptions);

    // Check if session exists
    if (!session?.user) {
        console.log("User is not authenticated");
        return { message: "Unauthorized", status: 401 };
    }

    const email = session.user.email as string;

    // Check if email is present
    if (!email) {
        console.log("Email is required");
        return { message: "Email is required", status: 400 };
    }

    const user = await db.user.findUnique({
        where: { email },
    });

    // Check if user exists
    if (!user) {
        console.log("User not found");
        return { message: "User not found", status: 404 };
    }

    // Create room
    const room = await db.room.create({
        data: {
            name: random.place(),
            author: { connect: { email: user.email } },
            players: {
                connect: { email: user.email }
            }
        },
    });

    return { message: "Room created successfully", room };
}

export async function GetRooms() {
    const session = await getServerSession(authOptions);

    // Check if session exists
    if (!session?.user) {
        console.log("User is not authenticated");
        return { message: "Unauthorized", status: 401 };
    }

    const rooms = await db.room.findMany({
        where: {
            players: {
                some: {
                    email: session.user.email as string
                }
            }
        }
    });

    return { message: "Rooms retrieved successfully", rooms };
}

export async function JoinRoom(id: string) {
    try {

        const session = await getServerSession(authOptions)
        if (!session) {
            return { message: "You are not logged in" }
        }

        const rooms = await db.room.update({
            where: {
                id
            }, data: {
                players: {
                    connect: {
                        email: session.user?.email as string
                    }
                }
            }
        })
        return { message: "Joined successfully", rooms }
    } catch (e) {
        console.log(e)
    }
}