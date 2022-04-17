import React, { useEffect, useRef, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

// font awesome
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Chat({ socket, userName, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const socketRef = useRef();

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: userName,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:3001");
    socketRef.current.on("receive_message", (data) => {
      // console.log(data);
      setMessageList((list) => [...list, data]);
    });
    return () => socketRef.current.disconnect();
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p className="text-2xl text-center p-5">Live Chat</p>
      </div>
      <div className="mt-10 w-full h-96 bg-gray-300">
        <ScrollToBottom className="w-full h-full overflow-y-scroll overflow-x-hidden">
          {messageList.map((messageContent) => {
            return (
              <div
                id={userName === messageContent.author ? "you" : "other"}
                key={uuidv4()}
              >
                <div className="flex space-x-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {messageContent.author} :{" "}
                    </p>
                  </div>
                  <div>
                    <p className="text-base bg-blue-500 text-white w-full text-center">
                      {messageContent.message}
                    </p>
                    <p className="text-sm">{messageContent.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="flex p-5 fixed w-full bottom-0">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>
          <FontAwesomeIcon
            icon={faPaperPlane}
            className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
          />
        </button>
      </div>
    </div>
  );
}

export default Chat;
