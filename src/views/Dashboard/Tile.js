import React, { useEffect, useRef } from "react";
import "./Tile.css";

/**
 * Props
 * - videoTrack: MediaStreamTrack?
 * - audioTrack: MediaStreamTrack?
 * - isLocalPerson: boolean
 * - isLarge: boolean
 * - isLoading: boolean
 */
export default function Tile(props) {
  /* const videoEl = useRef(null);
  const audioEl = useRef(null); */

  /**
   * When video track changes, update video srcObject
   */
  

  /**
   * When audio track changes, update audio srcObject
   */
 /*  useEffect(() => {
    audioEl.current &&
      (audioEl.current.srcObject = new MediaStream([props.audioTrack]));
  }, [props.audioTrack]); */

 /*  function getLoadingComponent() {
    return props.isLoading && <p className="loading">Loading...</p>;
  }
 */
  function getVideoComponent() {
    
    if(props.isLarge)
    return (
      <video style={{ height: '100%' }}  autoPlay playsInline ref={props.videoRef} />
    );
    else
    return (
      <video  autoPlay muted playsInline ref={props.videoRef} />
    );
  }

  /* function getAudioComponent() {
    return (
      !props.isLocalPerson &&
      props.audioTrack && <audio autoPlay playsInline ref={audioEl} />
    );
  } */
  function getLoadingComponent() {
    if(props.receivingCall)
    {
      console.log('receving call b tile')
    return <p className="loading"><h1>{props.othername} is calling you</h1>
    <button onClick={()=>props.acceptCall()}>Accept</button></p>;
    }
    if(props.isCalling)
    return <p className="loading"><h1>Ringing</h1></p>
  }
  function getClassNames() {
    let classNames = "tile";
    classNames += props.isLarge ? " large" : " small";
    props.isLocalPerson && (classNames += " local");
    return classNames;
  }
  if(props.videoRef=='')
  {
    return (
      <div className={getClassNames()}>
        <div className="background" />
      
      </div>
    );
  }
  return (
    <div className={getClassNames()}>
      <div className="background" />
     
      {getVideoComponent()}
      {getLoadingComponent()}
     {/*  {getAudioComponent()} */}
    </div>
  );
}
