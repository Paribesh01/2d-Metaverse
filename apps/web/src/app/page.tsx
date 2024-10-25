import { GetRooms } from "@/action/room";
import Room from "@/components/new/room";

export default async function Home() {

  const { rooms } = await GetRooms()


  return (

    <div id="app">

      <Room rooms={rooms} />



    </div>



  )



}
