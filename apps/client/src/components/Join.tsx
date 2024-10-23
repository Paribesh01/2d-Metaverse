"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Plus, LogIn } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { createRoom } from '@/action/room'

export default function Join() {
    const [roomId, setRoomId] = useState('')
    const [isCreatingRoom, setIsCreatingRoom] = useState(true)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (isCreatingRoom) {
            const res = createRoom()
            console.log(res)
        }




    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary to-primary-foreground flex flex-col items-center justify-center p-4">
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
                        {isCreatingRoom ? (
                            <>
                                <Plus className="mr-2 h-4 w-4" /> Create Room
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" /> Join Room
                            </>
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
    )
}