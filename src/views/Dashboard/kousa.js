import React, { useEffect, useState, useRef } from 'react';
import '../Messaging/video.css';
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { Link, Redirect } from 'react-router-dom';
import TextContainer from '../Messaging/chatComponents/TextContainer/TextContainer';
import Messages from '../Messaging/chatComponents/Messages/Messages';
import InfoBar from '../Messaging/chatComponents/InfoBar/InfoBar';
import Input from '../Messaging/chatComponents/Input/Input';
/* import Requests from "./MyRequests.js"; */
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

function App(props) {
    console.log(props.request)
    const [yourID, setYourID] = useState("");
    const [users, setUsers] = useState({});
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const userVideo = useRef();
    const partnerVideo = useRef();
    let socket = useRef();
    let user = JSON.parse(localStorage.getItem('user'));
    // socket.current = io('ws://localhost:8000', {transports: ['websocket']});
    useEffect(() => {
        let bla=props.request._id+''+user._id;
        setRoom(bla);
        setName(props.userName)
        socket.current = io.connect("/");
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            setStream(stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
        })
        socket.current.on('connect', function (id) {
            // call the server-side function 'adduser' and send one parameter (value of prompt)
           // socket.current.emit('addUser', { userId: user._id, userName: user.name });
           // socket.current.emit("getHistory", { userId: user._id, requestId: props.request._id });
            /* socket.current.emit("callUser", { userToCall: null, signalData: null, from: null })
            socket.current.emit("acceptCall", { signal: null, to: null })
            socket.current.emit("acceptCall", { signal: data, to: caller })
            setReceivingCall(false); */
          
           
            console.log(room);
            console.log(props.userName);
            socket.current.emit('join', { name, room }, (error) => {
               
                if (error) {
                    alert(error);
                }
            });

        });
        socket.current.on("yourID", (id) => {
            setYourID(id);
            console.log(id)
        })
        socket.current.on("allUsers", (users) => {
            setUsers(users);
        })

        socket.current.on("message", (message) => {
            console.log("here");
            receivedMessage(message);
        })
        socket.current.on("userChats", (chats) => {

            console.log(chats, 'waynek')

            if (chats) {
                setMessages(oldMsgs => [oldMsgs,]);
                Object.keys(chats).map(key => {

                    setMessages(oldMsgs => [...oldMsgs, chats[key]]);

                })
            }

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
    }
    const sendMessage = (event) => {

        event.preventDefault();
        const messageObject = {
            body: message,
            sender: user._id,
            senderName: user.name,
            receiver: props.request.userId,
            requestId: props.request._id
        };
        console.log(messageObject)
        if (message) {
            console.log(message, 'message');
            console.log(messageObject)
            socket.current.emit('send message', messageObject, () => setMessage(''));
            setMessage('');
        }
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

    
    return (

        <div className="container">
            <InfoBar room={props.userName} />
            <Messages messages={messages} name={user._id} />
            <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            <Button onClick={() => callPeer(key)}>Call {users[key][1]}</Button>
        </div>

    );


}

export default App;
