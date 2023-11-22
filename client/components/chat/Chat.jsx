import React, {createContext, useEffect, useState} from "react";
import ChatRoomListing from "./ChatRoomListing.jsx";
import ChatWindow from "./ChatWindow.jsx";


export const ChatContext = createContext();

export function Chat() {
    const [errorMessage, setErrorMessage] = useState();

    const [ws, setWs] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [activeChatRoom, setActiveChatRoom] = useState(null);


    async function handleFetchChatrooms() {
        try {
            const res = await fetch("/api/v1/chatroom");
            const {message, data} = await res.json();
            if (res.status !== 200) {
                setErrorMessage(message);
                return;
            }
            setChatRooms(data);

        } catch (e) {
            setErrorMessage(e.message);
        }
    }
    useEffect(() => { //Remove any exisiting listeneres and sockets before establishing a new one on active chat room change
        if (ws) {
            ws.onmessage = null;
            ws.close();
        }
    }, [activeChatRoom]);

    useEffect(() => {
        //Try to establish socket here and put it in the context
        const ws = new WebSocket(window.location.origin.replace(/^http/, "ws"));
        setWs(ws);
        ws.onmessage = (event) => {
            const {chatroomid, message} = JSON.parse(event.data);
            if (chatroomid === activeChatRoom) {
                console.log("Updating messages from socket")
                setMessages(prevMessages => [...prevMessages, message]);
            }
        }
    }, [activeChatRoom]);



    async function setChatroom(id) {
        setActiveChatRoom(id);
    }

    useEffect(() => {
        handleFetchChatrooms();
    }, []);


    return <ChatContext.Provider value={{
        chatRooms,
        activeChatRoom,
        ws,
        messages,
        setMessages,
        setChatroom
    }}>
        <div className={"pageContentWrapper"}>
            <div className={"innerWrapper"}>
                <div style={{width: "100%", display: "flex"}}>
                    <div className={"chatRooms"}>
                        <div style={{width: "100%", display: "flex", flexWrap: "nowrap"}}>
                            <h2>Available chatrooms:</h2>
                        </div>
                        <div style={{width: "100%"}}>
                            {chatRooms && chatRooms.map(e => {
                                return (<ChatRoomListing
                                    chatRoom={e}
                                    key={e._id}
                                />)
                            })}
                        </div>
                    </div>


                    <div className={"chatWindow"} style={{padding: "15px"}}>
                        {activeChatRoom && <ChatWindow
                            acticeChatRoom={activeChatRoom}
                        />}
                    </div>


                </div>
            </div>
        </div>
    </ChatContext.Provider>
}