import React, { useEffect, useState, useRef } from 'react';
import Container from '@material-ui/core/Container';
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { Link, Redirect } from 'react-router-dom';
import TextContainer from '../Messaging/chatComponents/TextContainer/TextContainer';
import Messages from '../Messaging/chatComponents/Messages/Messages';
import InfoBar from '../Messaging/chatComponents/InfoBar/InfoBar';
import ReactNotifications from 'react-browser-notifications'
import Input from '../Messaging/chatComponents/Input/Input';
import { ToastContainer, toast } from 'react-toastify';
import Tile from "./Tile";
import Tray from "./Tray/Tray";
/* import Requests from "./MyRequests.js"; */
const Video = styled.video`
  padding:10px;
  border: 1px solid blue;
  width: 100%;
  height: 50%;
  margin:10px
 
`;

const Page = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  align-items: center;
  background-color: #46516e;
  flex-direction: column;
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
const Row = styled.div`
  display: flex;
  width: 100%;
`;



function App(props) {

    const [yourID, setYourID] = useState("");
    const [users, setUsers] = useState({});
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [stream, setStream] = useState();
    const [isCalling, setIsCalling] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const userVideo = useRef();
    const partnerVideo = useRef();

    const [show, setShow] = useState(true);
    let socket = useRef();
    let user = JSON.parse(localStorage.getItem('user'));
    const [rerender, setRerender] = useState(false);

    // socket.current = io('ws://localhost:8000', {transports: ['websocket']});
    let roomId = props.request._id + '' + props.request.userId + '' + user._id;
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            setStream(stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

        })

        socket.current = io.connect("/");

        socket.current.on('connect', function (id) {
            // call the server-side function 'adduser' and send one parameter (value of prompt)
            socket.current.emit('join', { userId: user._id, userName: user.name, name: props.userName, room: props.request._id + '' + props.request.userId + '' + user._id });
            socket.current.emit("getHistory", { roomId: roomId });
            /* socket.current.emit("callUser", { userToCall: null, signalData: null, from: null })
            socket.current.emit("acceptCall", { signal: null, to: null })
            socket.current.emit("acceptCall", { signal: data, to: caller })
            setReceivingCall(false); */
            setRoom(props.request._id + '' + user._id);
            setName(props.userName)
            /*   socket.current.emit('join', { name: name, room: room }); */


        });
        socket.current.on("yourID", (id) => {
            setYourID(id);
            console.log(id)
        })
        /*  socket.current.on("allUsers", (users) => {
              setUsers(users);
          })
   */
        socket.current.on("roomData", ({ users }) => {
            setUsers(users);

        });
        socket.current.on('message', message => {
            setMessages(messages => [...messages, message]);
        });
        /*  socket.current.on("message", (message) => {
             console.log("here");
             receivedMessage(message);
         }) */
        socket.current.on("userChats", (chats) => {

            if (chats.length > 0) {
                if (roomId == chats[0].roomId) {

                   

                    Object.keys(chats).map(key => {

                        setMessages(oldMsgs => [...oldMsgs, chats[key]]);

                    })
                }
            }
            socket.current.on("endCall", (data) => {
                console.log('edning')
                setCallAccepted(false);
                setIsCalling(false);
                setReceivingCall(false);

            })
        })
        socket.current.on("hey", (data) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                setStream(stream);
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }

            })
            setReceivingCall(true);
            setCaller(data.from);
            setCallerSignal(data.signal);

        })
    }, []);

    function callPeer() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            setStream(stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

        })

        let idToCall = 0;
        users.map(user => {
            if ((user.id !== yourID.id) && (user.name !== yourID.name)) {
                idToCall = user.id
            }
        })
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });
        if (idToCall == 0) {
            toast.error('User is not connected right now, he will be informed about your call')
            const notificationObject = {

                sender: user._id,
                roomId: roomId,
                senderName: user.name,
                receiver: props.request.userId,
                requestId: props.request._id,
                requestTitle: props.request.title,
                requestUserId: props.request.userId
            };
            socket.current.emit('video notification', notificationObject);
        }
        else {
            setIsCalling(true);
        }

        peer.on("signal", data => {

            socket.current.emit("callUser", { userToCall: idToCall, signalData: data, from: yourID.id })

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
        //stun server - turn server
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
            roomId: roomId,
            senderName: user.name,
            receiver: props.request.userId,
            requestId: props.request._id,
            requestTitle: props.request.title,
            requestUserId: props.request.userId
        };
        /*  console.log(messageObject) */
        if (message) {
            /*   console.log(message, 'message');
              console.log(messageObject) */
            socket.current.emit('send message', messageObject, () => setMessage(''));
            setMessage('');
        }
    }



    function handleChange(e) {
        setMessage(e.target.value);
    }
    let UserVideo;
    if (isCalling || receivingCall) {
        if (stream) {
            UserVideo = (
                <Video playsInline muted ref={userVideo} autoPlay />
            );
        }
    }

    let PartnerVideo;
    if (callAccepted) {
        PartnerVideo = (
            <Video playsInline ref={partnerVideo} autoPlay />
        );

    }
    function leaveCall() {

        socket.current.emit('leaveCall', { roomId: roomId })

    }
    let incomingCall;
    if (receivingCall) {
        incomingCall = (
            <div>
                <h1>{props.userName} is calling you</h1>
                <button onClick={acceptCall}>Accept</button>
            </div>
        )
    }
    function toggleMic() {

        if (stream.getAudioTracks()[0].enabled)
            stream.getAudioTracks()[0].enabled = false;
        else {
            stream.getAudioTracks()[0].enabled = true;
        }

        setRerender(true);

    }
    function toggleVideo() {

        if (stream.getVideoTracks()[0].enabled)
            stream.getVideoTracks()[0].enabled = false;
        else {
            stream.getVideoTracks()[0].enabled = true;
        }
        socket.current.emit("toggleVideo", { id: user._id })
    }

    if (isCalling || callAccepted || incomingCall) {

        if (show) {
            if (callAccepted) {
                return (<Container maxWidth={12}   >

                    <Tile style={{ height: '70%' }}
                        acceptCall={() => acceptCall()} othername={props.userName}
                        isLarge={true}
                        videoRef={partnerVideo}
                    />
                    <Tile

                        isLarge={false}
                        videoRef={userVideo}
                    />
                    <Tray leaveCall={() => leaveCall()} toggleMic={() => toggleMic()} toggleVideo={() => toggleVideo()}></Tray>
                </Container>)
            }
            return (<Container maxWidth={12}   >

                <Tile style={{ height: '70%' }}
                    acceptCall={() => acceptCall()} isCalling={isCalling} receivingCall={receivingCall} othername={props.userName}
                    isLarge={true}
                    videoRef={partnerVideo}
                />
                <Tile

                    isLarge={false}
                    videoRef={userVideo}
                />
                <Tray leaveCall={() => leaveCall()} toggleMic={() => toggleMic()} toggleVideo={() => toggleVideo()}></Tray>
            </Container>)
        }
        else {
            return (<Container maxWidth={12}   >

                <Tile style={{ height: '70%' }}

                    isLarge={true}

                />
                <Tile

                    isLarge={false}
                    videoRef={userVideo}
                />
                <Tray leaveCall={() => leaveCall()} toggleMic={() => toggleMic()} toggleVideo={() => toggleVideo()}></Tray>
            </Container>)
        }
    }
    return (
        <div style={{display: 'flex', justifyContent: 'center'}} className="rowContainer">
            <div className="container" style={{ display: "flex" }}>
                <ToastContainer />
                <InfoBar back={()=>props.back()} room={props.userName} />
                <Messages messages={messages} name={user._id} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
                <Button onClick={() => {

                    callPeer()
                }}>Call </Button>

          
            </div >


        </div>
    );


    /*  if (didCall) {
         console.log(UserVideo)
         return (
             <div className="container" style={{ width: '100%', display: "flex" }}>
                 <Row>
                     {UserVideo}
                     {PartnerVideo}
                 </Row>
             </div>
         );
     }
  */
}

export default App;
