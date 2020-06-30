import React, { useEffect, useState, useRef } from 'react';
import './video.css';
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { Link, Redirect } from 'react-router-dom';
/* import Requests from "./MyRequests.js"; */
import Container from '@material-ui/core/Container';
import Messages from './chatComponents/Messages/Messages';
import InfoBar from './chatComponents/InfoBar/InfoBar';
import { ToastContainer, toast } from 'react-toastify';
import Input from './chatComponents/Input/Input';
import Tile from "./Tile";
import Tray from "./Tray/Tray";
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
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [rerender, setRerender] = useState("");
  const show = useRef(true);
  const userVideo = useRef();
  const partnerVideo = useRef();
  const [didCall, setDidCall] = useState(false);

  let socket = useRef();
  let user = JSON.parse(localStorage.getItem('user'));
  let roomId = props.request._id + '' + user._id + '' + props.user._id;

  // socket.current = io('ws://localhost:8000', {transports: ['websocket']});
  useEffect(() => {
    socket.current = io.connect("/");

    socket.current.on('connect', function (id) {
      // call the server-side function 'adduser' and send one parameter (value of prompt)
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      })
      socket.current.emit('join', { userId: user._id, userName: user.name, name: props.userName, room: props.request._id + '' + user._id + '' + props.user._id });
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
    socket.current.on("userChats", (chats) => {

      if (chats.length > 0) {
        if (roomId == chats[0].roomId) {

         /*  setMessages(oldMsgs => [oldMsgs,]); */
          Object.keys(chats).map(key => {

            setMessages(oldMsgs => [...oldMsgs, chats[key]]);

          })
        }
      }
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
    socket.current.on("doToggleVideo", (data) => {

      console.log(data, '')
      if (!(user._id == data.id)) {

        if (show.current) {
          show.current = false;

        }
        else {
          show.current = true;

        }
      }

    })
    socket.current.on("endCall", (data) => {
      console.log('ending')
      setCallAccepted(false);
      setIsCalling(false);
      setReceivingCall(false);

    })
  }, [show.current]);

  function callPeer(id) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }

    })
    setIsCalling(true);
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
      setDidCall(true);
      peer.signal(signal);
    })

  }


  function acceptCall() {
    setCallAccepted(true);
    setDidCall(true);
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
      roomId: roomId,
      receiver: props.user._id,
      requestId: props.request._id,
      requestTitle: props.request.title,
      requestUserId: props.request.userId
    };

    if (message) {
      socket.current.emit('send message', messageObject, () => setMessage(''));
      setMessage('');
    }
  }
  function handleChange(e) {
    setMessage(e.target.value);
  }
  let UserVideo;

  if (receivingCall || isCalling) {

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

  let incomingCall;
  if (receivingCall) {
    /*  console.log('receiveing') */
    incomingCall = (
      <div>
        <h1>{props.user.name} is calling you</h1>
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
    socket.current.emit("toggleMic")


  }
  function toggleVideo() {

    if (stream.getVideoTracks()[0].enabled)
      stream.getVideoTracks()[0].enabled = false;
    else {
      stream.getVideoTracks()[0].enabled = true;
    }
    socket.current.emit("toggleVideo", { id: user._id })
  }
  function leaveCall() {

    socket.current.emit('leaveCall', { roomId: roomId })

  }
  if (isCalling || callAccepted || incomingCall) {
    console.log('rerendering')
    console.log(show)
    if (show.current) {
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
          acceptCall={() => acceptCall()} receivingCall={receivingCall} othername={props.user.name} isCalling={isCalling}
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
      console.log('3m a3mel rerender')
      return (<Container maxWidth={12}   >

        <Tile style={{ height: '70%' }}

          isLarge={true}
          videoRef=''
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

    <div  style={{display: 'flex', justifyContent: 'center'}} className="rowContainer">
      <div className="container" style={{ display: "flex" }}>
        <ToastContainer />
        <InfoBar back={()=>props.back()} room={props.user.name} />
        <Messages messages={messages} name={user._id} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
        <Button onClick={() => callPeer()}>Call </Button>
        <Row>
          {incomingCall}
        </Row>
      </div>

    </div>)



  /*   return (
      <div className="container" style={{ width: '100%', display: "flex" }}>
        <Row>
          {UserVideo}
          {PartnerVideo}
        </Row>
      </div>
    ); */

}

export default App;
