import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition/lib/SpeechRecognition';
import ScrollToBottom from "react-scroll-to-bottom";
import axios from "axios";
import { compareTwoStringsUsingDiceCoefficient } from 'react-speech-recognition/lib/utils';

function Dictaphone({ socket, username, room }) {

    const commands = [
        {
            command: 'reset',
            callback: () => resetTranscript()
        },

        {
            command: 'turn off',
            callback: () => SpeechRecognition.stopListening()
        },

    ]
    const {
        transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
        listening,
    } = useSpeechRecognition({ commands });

    const [messageList, setMessageList] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [sentiment, setSentiment] = useState("");
    const [off, setOff] = useState(true);

    useEffect(() => {
        if (finalTranscript !== '') {
            console.log(finalTranscript);
        }
    }, [interimTranscript, finalTranscript]);

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return <span>Your browser does not support speech recognition software!</span>
    }

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        console.log('Your browser does not support speech recognition software!');
    }


    const listenContinuously = () => {
        setOff(!off);
        if (!off) {
            resetTranscript();
            SpeechRecognition.startListening({
                continuous: true,
                language: 'en',
            });
        } else {
            SpeechRecognition.stopListening();
        }
        // console.log(transcript);
    };

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
                    text: transcript
                }
            };

            axios.request(options)
                .then(function (response) {
                    setSentiment(response.data.sentiment);
                    setIsLoading(false);
                    console.log(response);
                }).catch(function (error) {
                    console.error(error);
                });
        }

        fetchData();
    })

    if (listening) {
        const messageData = {
            room: room,
            author: username,
            time: new Date(Date.now()).getHours() + ":"
                + new Date(Date.now()).getMinutes(),
            message: transcript,
            emotion: sentiment
        }
        socket.emit("send_voice", messageData);
    }

    useEffect(() => {
        socket.on("receive_voice", (data) => {
            setMessageList((list) => [data]);
        });
    }, [socket]);

    return (
        <div className='chat-window-voice'>
            <div className='chat-header'>
                <p>Voice Chat</p>
            </div>
            <div className='chat-body'>
                <ScrollToBottom className='message-container-voice'>

                    <div className='message'
                        id="you">

                        <div>
                            <div className='message-content'>
                                <p>{transcript}</p>
                            </div>
                            <div className='message-meta1'>
                                <p id="time">{new Date(Date.now()).getHours() + ":"
                                    + new Date(Date.now()).getMinutes()}</p>
                                <p id="author">{username}</p>
                            </div>
                        </div>
                    </div>
                    {messageList.map((messageContent) => {
                        return (
                            <div className="message"
                                id={username === messageContent.author ? "you" : "other"}>
                                <div>
                                    <div className='message-content'
                                        id={messageContent.emotion}>
                                        <p>{messageContent.message}</p>
                                    </div>
                                    <div className='message-meta1'>
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
                <div>
                    <button type="button" onClick={listenContinuously}
                        id={listening ? "on" : "off"}>&#9658;</button>
                    {/* <button type="button" onClick={SpeechRecognition.stopListening}
                        id={listening ? "off" : "on"}>Stop</button> */}
                    {/* <button type="button" onClick={resetTranscript}>Reset</button> */}
                </div>
            </div>

        </div>
    );
};

export default Dictaphone;