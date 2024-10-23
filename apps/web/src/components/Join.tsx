"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Plus, LogIn } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { GetRooms, JoinRoom, createRoom } from '@/action/room'
import Rooms from './Rooms'

export default function Join({ rooms }: any) {
    const [roomId, setRoomId] = useState('')
    const [isCreatingRoom, setIsCreatingRoom] = useState(true)
    const [isLoading, setLoading] = useState(false)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isCreatingRoom) {
            setLoading(true)
            const res = await createRoom()
            setLoading(false)
            if (res.message === "Room created successfully") {
                window.location.reload();
            }
        } else {
            setLoading(true)
            const res = await JoinRoom(roomId)
            setLoading(false)
            if (res?.message === "Joined successfully") {
                window.location.reload();
            }
        }



    }

    return (
        <div className=' min-h-screen bg-gradient-to-b from-primary to-primary-foreground flex flex-row items-center justify-center p-4'>

            <div className=" flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">Welcome to MultiplayerMania!</h1>
                    <p className="text-xl text-white/80 mb-8">Join the excitement and play with friends from around the world!</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="room-toggle" className="text-lg font-medium">
                                {isCreatingRoom ? 'Create a new room' : 'Join existing room'}
                            </Label>
                            <Switch
                                id="room-toggle"
                                checked={isCreatingRoom}
                                onCheckedChange={setIsCreatingRoom}
                            />
                        </div>

                        {!isCreatingRoom && (
                            <div>
                                <Label htmlFor="room-id" className="text-lg font-medium">
                                    Room ID
                                </Label>
                                <Input
                                    id="room-id"
                                    type="text"
                                    placeholder="Enter room ID"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="mt-1"
                                    required
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full text-lg">
                            {!isLoading ? (<>{isCreatingRoom ? (
                                <>
                                    <Plus className="mr-2 h-4 w-4" /> Create Room
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" /> Join Room
                                </>
                            )}</>) : (
                                <span>Loading...</span>
                            )}

                        </Button>
                    </form>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-8 flex items-center text-white"
                >
                    <Users className="mr-2" />

                </motion.div>
            </div>
            <Rooms rooms={rooms} />
        </div>
    )
}