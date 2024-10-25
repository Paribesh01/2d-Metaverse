"use client"

import { JoinRoom, createRoom } from "@/action/room"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Room({ rooms }: any) {
    console.log(rooms)
    const router = useRouter()

    const [id, setId] = useState<string>()
    const JoinRoomHandeler = async () => {
        const res = await JoinRoom(id as string)
        console.log(res)
        if (res?.success) {
            window.location.reload()
        }
    }
    const GoToRoomHandeler = async (roomId: string) => {
        router.push(`/room/${roomId}`)
    }

    const createRoomHandeler = async () => {
        const res = await createRoom()
        console.log(res)
        if (res?.success) {
            window.location.reload()
        }
    }


    return (

        <div>
            {rooms ? (rooms.map((room: any) => (
                <div key={room.id}>
                    <h1>{room.id}</h1>
                    <button onClick={() => {
                        GoToRoomHandeler(room.id)
                    }}>Go To room</button>
                </div>
            ))) : (

                <div>No Rooms</div>

            )}
            <div>

                <input onChange={(e) => {
                    setId(e.target.value)
                }} type="text" />
                <button onClick={JoinRoomHandeler}>Join</button>
                <div>


                    <button onClick={createRoomHandeler}>CreateRoom</button>
                </div>
            </div>

        </div>

    )


}