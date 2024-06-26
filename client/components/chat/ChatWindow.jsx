import React, { createContext, useContext, useEffect, useState } from "react";
import ErrorMessage from "../globals/ErrorMessage.jsx";
import { useFetcher } from "react-router-dom";
import Message from "./Message.jsx";
import { AppContext } from "../App.jsx";
import { ChatContext } from "./Chat.jsx";

function ChatWindow(props) {
  const [errorMessage, setErrorMessage] = useState();

  const {
    setChatroom,
    activeChatRoom,
    ws,
    messages,
    setMessages,
    activeChatRoomTitle,
  } = useContext(ChatContext);
  const { user } = useContext(AppContext);

  const [newMessage, setNewMessage] = useState("");

  async function getMessages() {
    try {
      const res = await fetch(`/api/v1/chatroom/${activeChatRoom}`);
      const { message, data } = await res.json();
      if (res.status !== 200) {
        setMessages([]);
        setErrorMessage(message || "En ukjent feil har oppstått");
        return;
      }
      setMessages(data.messages);
      setErrorMessage(null);
    } catch (e) {
      setErrorMessage(e.message);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (newMessage.length === 0) {
      setErrorMessage("Meldingen må bestå av noe!");
      return;
    }
    ws.send(
      JSON.stringify({
        chatroomid: activeChatRoom,
        message: newMessage,
        user: user,
      }),
    );
    setNewMessage("");
    setErrorMessage(null);
  }

  useEffect(() => {
    getMessages();
  }, [activeChatRoom]);

  return (
    <>
      <div style={{ width: "100%", flexWrap: "wrap" }}>
        {activeChatRoomTitle && <h2>{activeChatRoomTitle}</h2>}
        <div className={"messageWindow"}>
          {messages &&
            messages.map((e) => {
              return (
                <Message
                  message={e}
                  key={e.time}
                /> /*TODO Should proabably have ID on the messages.. Will fix if enough time*/
              );
            })}
        </div>
        <div style={{ width: "100%" }}>
          <form onSubmit={handleSendMessage}>
            <input
              placeholder={"message"}
              value={newMessage}
              onInput={(e) => setNewMessage(e.target.value)}
            />
            <button>Send message</button>
          </form>
          <ErrorMessage message={errorMessage} />
        </div>
      </div>
    </>
  );
}

export default ChatWindow;
