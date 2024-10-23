import { useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, LogOut } from "lucide-react"
import { JoinRoom } from '@/action/room'
import { useRouter } from 'next/navigation'



export default function rooms({ rooms }: any) {
    const router = useRouter()
    const handelRoomJoin = async (roomId: string) => {
        router.push(`/room/${roomId}`)
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Your Joined Rooms</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    {rooms.length > 0 ? (
                        <ul className="space-y-4">
                            {rooms.map((room: any) => (

                                <li key={room.id} className="flex items-center justify-between bg-secondary p-3 rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">{room.name}</h3>
                                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                                            <Users className="mr-1 h-4 w-4" />
                                            <span>{room.players} players</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">{room.id}</Badge>

                                    </div>
                                    <button onClick={e => {
                                        handelRoomJoin(room.id)
                                    }}>Join</button>
                                </li>

                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted-foreground">You haven't joined any rooms yet.</p>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}