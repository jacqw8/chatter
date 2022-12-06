import React from "react";
import io from 'socket.io-client';
import { useState } from "react";
import background from "./img/sunset.jpg"
import Typewriter from "typewriter-effect";

import './App.css'
import Chat from "./Chat";
import Dictaphone from "./Dictaphone";

const socket = io.connect("http://localhost:3001");
const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  }

  return (
    <div className="App"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: '100%',
        backgroundRepeat: 'no-repeat',
        opacity: '90%'

      }}>
      {/* <div className='app-header'>
        <h1>Chatter</h1>
      </div> */}
      {!showChat ? (
        <div className="joinChatContainer">
          <h1>Chatter</h1>
          <h2>
            <Typewriter
              options={{
                autoStart: true,
                loop: true
              }}
              onInit={(typewriter) => {
                typewriter
                  .typeString("Welcome to Chatter!")
                  .pauseFor(1000)
                  .deleteAll()
                  .typeString("Each room is accessible")
                  .pauseFor(1000)
                  .deleteChars(10)
                  .typeString("welcoming")
                  .pauseFor(1000)
                  .deleteChars(9)
                  .typeString("for you!")
                  .pauseFor(1000)
                  .start();
              }}
            />
          </h2>
          <h3>Join Chat</h3>
          <input
            type="text"
            placeholder="Username"
            id="inputID"
            onChange={(event) => {
              setUsername(event.target.value);
            }} />
          <input
            type="text"
            placeholder="Room ID"
            id="inputID"
            onChange={(event) => {
              setRoom(event.target.value);
            }} />
          <button onClick={joinRoom}>Join a Room</button>

        </div>
      ) : (
        <div className="room">
          <h1>Room {room}</h1>
          <span className="parent">
            <Chat socket={socket} username={username} room={room} />
            <Dictaphone socket={socket} username={username} room={room} />
          </span>
        </div>
      )}
    </div>
  );
}

export default App;
