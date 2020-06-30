import React, { useEffect, useState, useRef } from 'react';
import './video.css';
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { Link, Redirect } from 'react-router-dom';
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  max-height: 500px;
  overflow: auto;
  width: 400px;
  border: 1px solid lightgray;
  border-radius: 10px;
  padding-bottom: 10px;
  margin-top: 25px;
`;


const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 50%;
  height: 50%;
`;
const Page = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  align-items: center;
  background-color: #46516e;
  flex-direction: column;
`;


const TextArea = styled.textarea`
  width: 98%;
  height: 100px;
  border-radius: 10px;
  margin-top: 10px;
  padding-left: 10px;
  padding-top: 10px;
  font-size: 17px;
  background-color: transparent;
  border: 1px solid lightgray;
  outline: none;
  color: lightgray;
  letter-spacing: 1px;
  line-height: 20px;
  ::placeholder {
    color: lightgray;
  }
`;

const Button = styled.button`
  background-color: pink;
  width: 100%;
  border: none;
  height: 50px;
  border-radius: 10px;
  color: #46516e;
  font-size: 17px;
`;

const Form = styled.form`
  width: 400px;
`;

const MyRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

const MyMessage = styled.div`
  width: 45%;
  background-color: pink;
  color: #46516e;
  padding: 10px;
  margin-right: 5px;
  text-align: center;
  border-top-right-radius: 10%;
  border-bottom-right-radius: 10%;
`;

const PartnerRow = styled(MyRow)`
  justify-content: flex-start;
`;

const PartnerMessage = styled.div`
  width: 45%;
  background-color: transparent;
  color: lightgray;
  border: 1px solid lightgray;
  padding: 10px;
  margin-left: 5px;
  text-align: center;
  border-top-left-radius: 10%;
  border-bottom-left-radius: 10%;
`;

function App() {
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef();
  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();
  let user = JSON.parse(localStorage.getItem('user'));


  useEffect(() => {

    socket.current = io.connect("/");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    })
    socket.current.on('connect', function (id) {
      // call the server-side function 'adduser' and send one parameter (value of prompt)

      socket.current.emit('addUser', { userId: user._id, userName: user.name });
      /* socket.current.emit("callUser", { userToCall: null, signalData: null, from: null })
      socket.current.emit("acceptCall", { signal: null, to: null })
      socket.current.emit("acceptCall", { signal: data, to: caller })
      setReceivingCall(false); */

    });
    socket.current.on("yourID", (id) => {
      setYourID(id);
      console.log(id)
    })
    socket.current.on("allUsers", (users) => {
      setUsers(users);
    })
    socket.current.on("userChats", (chats) => {
     
      console.log(chats[0]);
      if (chats) {
        Object.keys(chats).map(key => {
          console.log(key)
          setMessages(oldMsgs => [...oldMsgs, chats[key]]);

        })

      }
    })
    socket.current.on("message", (message) => {
      console.log("here");
      receivedMessage(message);
    })

    socket.current.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    })
  }, []);

  function callPeer(id) {

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });


    peer.on("signal", data => {

      socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID })

    })

    peer.on("stream", stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socket.current.on("callAccepted", signal => {
      setCallAccepted(true);
      peer.signal(signal);
    })

  }

  function acceptCall() {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", data => {

      socket.current.emit("acceptCall", { signal: data, to: caller })
    })

    peer.on("stream", stream => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  }
  function receivedMessage(message) {
    setMessages(oldMsgs => [...oldMsgs, message]);
    console.log(message)
  }

  function sendMessage(e) {
    e.preventDefault();
    const messageObject = {
      body: message,
      sender: user._id,
      receiver: window.location.href.substring(36)
    };
    setMessage("");
    console.log('sending message')
    socket.current.emit("send message", messageObject);
  }

  function handleChange(e) {
    setMessage(e.target.value);
  }
  let UserVideo;
  if (stream) {
    UserVideo = (
      <Video playsInline muted ref={userVideo} autoPlay />
    );
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = (
      <Video playsInline ref={partnerVideo} autoPlay />
    );
  }

  let incomingCall;
  if (receivingCall) {
    console.log('receiveing')
    let userName = '';
    Object.keys(users).map(key => {

      if (key === caller) {
        userName = users[key][1];
      }

    })
    incomingCall = (
      <div>
        <h1>{userName} is calling you</h1>
        <button onClick={acceptCall}>Accept</button>
      </div>
    )
  }

  if (window.location.href.substring(36)) {
    return (

      <Page>
        <Container>
          {messages.map((message, index) => {
            if (message.id === yourID) {
              console.log('here')
              return (  
                <MyRow key={index}>
                  <MyMessage>
                    {message.body}
                  </MyMessage>
                </MyRow>
              )
            }
            return (
              <PartnerRow key={index}>
                <PartnerMessage>
                  {message.body}
                </PartnerMessage>
              </PartnerRow>
            )
          })}
        </Container>
        <Form onSubmit={sendMessage}>
          <TextArea value={message} onChange={handleChange} placeholder="Say something..." />
          <Button>Send</Button>

        </Form>
        {Object.keys(users).map(key => {
          if (window.location.href.substring(36)) {
            if (users[key][0] === user._id && Object.keys(users).length === 1) {
              return (<div>

                User is not online right now
              </div>
              );
            }
            if (!(users[key][0] === window.location.href.substring(36))) {
              if (users[key][0] === user._id) {
                console.log('hon')
                return null;
              }
              return (<div key="a">

                User is not online right now
              </div>
              );
            }
          }

          if (users[key][0] === user._id) {
            console.log('ana hon')
            return null;
          }

          if (window.location.href.substring(36)) {

            if (users[key][0] === window.location.href.substring(36)) {

              return (<div key="a">

                <Button onClick={() => callPeer(key)}>Call {users[key][1]}</Button>
              </div>
              );

            }
            return (<div key="a">

              User is not online right now
            </div>
            );
          }
          else {
            return (<div key="a">

              Start helping people to have Conversations
            </div>
            );
          }

        })}
        <Row>
          {UserVideo}
          {PartnerVideo}
        </Row>
        <Row>

        </Row>
        <Row>


          {incomingCall}
        </Row>
      </Page>
    );
  }
  else {
    return (<div key="a">

      Start helping people to have Conversations
    </div>
    );
  }
}

export default App;
