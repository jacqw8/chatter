import React, { useEffect, useState } from 'react';
import ScrollToBottom from "react-scroll-to-bottom";
import { useSpeechSynthesis } from 'react-speech-kit';
import axios from "axios";

function Chat({ socket, username, room }) {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const { speak } = useSpeechSynthesis();
    const [msg, setMsg] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [sentiment, setSentiment] = useState("");

    useEffect(() => {

        function fetchData() {

            const options = {
                method: 'POST',
                url: 'https://text-analysis12.p.rapidapi.com/sentiment-analysis/api/v1.1',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': '79d583b800msha09b009baa19566p13aa3cjsnc39e7ea1d149',
                    'X-RapidAPI-Host': 'text-analysis12.p.rapidapi.com'
                },
                data: {
                    language: "english",
                    text: currentMessage
                }
            };

            axios.request(options)
                .then(function (response) {
                    setSentiment(response.data.sentiment);
                    setIsLoading(false);
                    // return response.data.sentiment;
                }).catch(function (error) {
                    console.error(error);
                });
        }

        fetchData();
    })

    const sendMessage = async () => {
        // fetchData();

        if (currentMessage !== "") {
            console.log(currentMessage, sentiment)
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
                emotion: sentiment,
                time: new Date(Date.now()).getHours() + ":"
                    + new Date(Date.now()).getMinutes()
            };
            console.log(messageData);
            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
            setIsLoading(true);
        }
    };

    useEffect(() => {

        socket.on("receive_message", (data) => {
            setMessageList((list) => [...list, data]);
            setMsg(data.message);
        });
    }, [socket]);

    if (msg) {
        speak({ text: msg });
        setMsg("");
    }


    return (
        <div className='chat-window'>
            <div className='chat-header'>
                <p>Text Chat</p>
            </div>
            <div className='chat-body'>
                <ScrollToBottom className='message-container'>
                    {messageList.map((messageContent) => {
                        return (
                            <div className="message"
                                id={username === messageContent.author ? "you" : "other"}>
                                <div>
                                    <div className='message-content'
                                    >
                                        <p>{messageContent.message}</p>
                                    </div>
                                    <div className='message-meta'>
                                        <p id="time">{messageContent.time}</p>
                                        <p id="author">{messageContent.author}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </ScrollToBottom>
            </div>
            <div className='chat-footer'>
                <input
                    type="text"
                    value={currentMessage}
                    id="inputID"
                    placeholder="Send a message"
                    onChange={(event) => {
                        setCurrentMessage(event.target.value)
                    }}
                    onKeyPress={(event) => {
                        event.key === "Enter" && sendMessage()
                    }}
                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
        </div>
    )
}

export default Chat