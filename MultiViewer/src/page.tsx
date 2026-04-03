import React, { useEffect, useRef, useState } from "react";
import ChatBox from "./components/Chatbox";
import VideoPlayer from "./components/VideoPlayer";
import { PencilIcon,PlusIcon } from "@heroicons/react/24/outline";
import { Resizable } from "re-resizable";
import AddModal from "./components/AddModal";
import { DragDropProvider } from "@dnd-kit/react";
import { localChatWidthString,localStreamsString } from "./constants";
import { move } from "@dnd-kit/helpers";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [streams,setStreams] = useState<string[]>([]);
  const [visualOrder,setVisualOrder] = useState<string[]>([]);
  const [streamChat,setStreamChat] = useState<string>("");
  const [chatWidth,setChatWidth] = useState<number>(parseInt(localStorage.getItem(localChatWidthString) || ((window.innerWidth*25)/100).toString()));

  const handleEditClick = () => {
    const container = containerRef.current;
    if (container) {
      if (container.classList.contains("editMode")) {
        container.classList.remove("editMode");
      } else {
        container.classList.add("editMode");
      }
    }
  }

  const setSpotlightStream = (stream : string) => {
    const container = containerRef.current;
    container?.classList.add("spotlightMode");
  }

  const removeSpotlight = () => {
    const container = containerRef.current;
    container?.classList.remove("spotlightMode");
  }

  const handleStreamsUpdate = (newStreams:string[]) => {
    // Deduplicate and remove empty
    const cleanedStreams = [...new Set(newStreams)].filter(stream => !!stream);
    localStorage.setItem(localStreamsString, cleanedStreams.join("/"));
    window.history.replaceState({}, "", window.location.origin + "/" + cleanedStreams.join("/"));
    
    // Only update if add/remove
    setStreams(prev => prev.length === cleanedStreams.length? prev : cleanedStreams);
    setVisualOrder(cleanedStreams);
  }

  const removeStream = (removedStream:string) => {
    handleStreamsUpdate(streams.filter((stream) => stream != removedStream));
  }

  const addStreams = (addedStreams:string[]) => {
    handleStreamsUpdate([...streams, ...addedStreams]);
  }

  useEffect(() => {
    const urlStreams = window.location.pathname;
    if (urlStreams !== "/"){
      handleStreamsUpdate(urlStreams.split("/"));
      setStreamChat(urlStreams.split("/")[1]);
      return;
    } 
    
    const cachedStreams = localStorage.getItem(localStreamsString);
    if (cachedStreams !== null) {
      handleStreamsUpdate(cachedStreams?.split("/"));
      setStreamChat(cachedStreams?.split("/")[1]);
    }
  }, []);

  return (
    <div className="flex w-full h-full dark:bg-[#18181b]">

      {/* streams */}
      <DragDropProvider
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragEnd={(event) => {
          handleStreamsUpdate(move(visualOrder, event))
        }}
      >
        <div className="flex flex-wrap relative streamContainer h-screen overflow-y-auto max-w-max mt-1 items-start" style={{'--chat-width': `${chatWidth}px`}} ref={containerRef}>
          { streams.length > 0 ? streams.map((stream,index) =>
              <VideoPlayer stream={stream} index={index} visualIndex={visualOrder.indexOf(stream)} setSpotlightStream={setSpotlightStream} removeSpotlight={removeSpotlight} removeStream={removeStream} setChat={setStreamChat} key={stream}/>
            ) 
            :
            <AddModal addStreams={addStreams}/>
          }
        </div>
      </DragDropProvider>

      {/* add/edit buttons */}
      <div className="mr-1 h-screen w-5 ml-auto flex flex-col space-y-1 mt-1">
        <button className="bg-gray-500 w-5 h-5 rounded" command="show-modal" commandfor="add-menu"><PlusIcon></PlusIcon></button>
        <button className="bg-gray-500 w-5 h-5 rounded" onClick={handleEditClick}><PencilIcon></PencilIcon></button>
        <AddModal addStreams={addStreams}></AddModal>
      </div>

      {/* chat */}
      { streamChat ?
        <Resizable 
          className="border-l border-solid border-[#34343c] fixed top-0 right-0"
          enable={{top:false, right:false, bottom:false, left:true, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false}}
          size={{height: "screen", width: chatWidth}}
          onResizeStop={(e, direction, ref, d) => {
            setChatWidth(chatWidth + d.width); 
            localStorage.setItem(localChatWidthString, (chatWidth + d.width).toString())}}>
              <ChatBox stream={streamChat}/>
        </Resizable>
        : null}
    </div>
  );
}
