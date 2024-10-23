
import { GetRooms } from "@/action/room";
import JoinedRooms from "./Joined-Rooms";


export default function Rooms({ rooms }: any) {




    return (
        <div>
            <JoinedRooms rooms={rooms} />

        </div>
    )
}