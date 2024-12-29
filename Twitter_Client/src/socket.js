import { io } from "socket.io-client";
import { accessToken } from "./utils";
const socket = io(import.meta.env.VITE_API_URL ,{
    autoConnect : false,
    auth: {
        Authorization: `Bearer ${accessToken}`,
    }
});

export default socket