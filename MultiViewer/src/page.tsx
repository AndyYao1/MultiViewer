import React, { useEffect, useRef, useState } from "react";
import ChatBox from "./components/Chatbox";
import VideoPlayer from "./components/VideoPlayer";
import { PencilIcon,PlusIcon } from "@heroicons/react/24/outline";
import { Resizable } from "re-resizable";
import AddModal from "./components/AddModal";
import { createRoot, type Root } from "react-dom/client";
import { DragDropProvider } from "@dnd-kit/react";
import { localChatWidthString,localStreamsString } from "./constants";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [streamChat,setStreamChat] = useState<string>("");
  const [chatWidth,setChatWidth] = useState<number>(parseInt(localStorage.getItem(localChatWidthString) || ((window.innerWidth*25)/100).toString()));
  const rootRef = useRef<Root>(null);

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
    if (container) {
      container.classList.add("spotlightMode");
      const element = container.querySelector(`[data-item-id="${stream}"]`);
      if (element) {
        container.insertBefore(element, container.firstChild);

      }

      const allStreams = Array.from(container.children).map((child) => child.getAttribute("data-item-id") || "");
      localStorage.setItem(localStreamsString, allStreams.join("/"));
      window.history.replaceState({},"","/"+allStreams.join("/"));
    }
  }

  const removeSpotlight = () => {
    const container = containerRef.current;
    container?.classList.remove("spotlightMode");
  }

  const removeStream = (removedStream:string) => {
    const container = containerRef.current;
    if (container) {
      if (!rootRef.current){
        rootRef.current = createRoot(container);
      }

      let allStreams = Array.from(container.children)
        .map((child) => child.getAttribute("data-item-id") || "")
        .filter(id => id !== removedStream);

      localStorage.setItem(localStreamsString, allStreams.join("/"));
      window.history.replaceState({},"","/"+allStreams.join("/"));

      rootRef.current.render(
        <>
          {allStreams.map((stream, index) =>
            <VideoPlayer 
              key={stream}
              stream={stream} 
              index={index} 
              setSpotlightStream={setSpotlightStream} 
              removeSpotlight={removeSpotlight} 
              removeStream={removeStream}
              setChat={setChat}
            />
          )}
        </>
      );
    }
  }

  const addStreams = (streams:string[]) => {
    const container = containerRef.current;
    if (container) {
      if (!rootRef.current){
        rootRef.current = createRoot(container);
      }

      let allStreams = Array.from(container.children).map((child) => child.getAttribute("data-item-id") || "");
      for (const newStream of streams) {
        if (!allStreams.includes(newStream)){
          allStreams.push(newStream);
        }
      }

      localStorage.setItem(localStreamsString, allStreams.join("/"));
      window.history.replaceState({},"","/"+allStreams.join("/"));
      
      rootRef.current.render(
        <>
          {allStreams.map((stream,index) =>
            <VideoPlayer 
              key={stream} 
              stream={stream} 
              index={index} 
              setSpotlightStream={setSpotlightStream} 
              removeSpotlight={removeSpotlight} 
              removeStream={removeStream}
              setChat={setChat}
            />
          )}
        </>
      );
    }
  }

  const setChat = (stream:string) => {
    setStreamChat(stream);
  }

  const [streams,setStreams] = useState<string[]>([]);

  useEffect(() => {
    const urlStreams = window.location.pathname;
    if (urlStreams !== "/"){
      localStorage.setItem(localStreamsString,urlStreams);
      setStreams(urlStreams.split("/"));
      setStreamChat(urlStreams.split("/")[1]);
      return;
    } 
    
    const cachedStreams = localStorage.getItem(localStreamsString);
    if (cachedStreams !== null) {
      setStreams(cachedStreams?.split("/"));
      setStreamChat(cachedStreams?.split("/")[1]);
    }
    
  }, [])

  return (
    <div className="flex w-full h-full dark:bg-[#18181b]">

      {/* streams */}
      <DragDropProvider
        onDragEnd={() => {
          const container = containerRef.current;
          if (container) {
            const allStreams = [...new Set(Array.from(container.children).map((child) => child.getAttribute("data-item-id") || ""))];
            localStorage.setItem(localStreamsString, allStreams.join("/"));
            console.log(`order: ${allStreams.join("/")}`);
            window.history.replaceState({},"","/"+allStreams.join("/"));
          }
      }}
      >
        <div className="flex flex-wrap relative streamContainer h-screen overflow-y-auto max-w-max mt-1 items-start" style={{'--chat-width': `${chatWidth}px`}} ref={containerRef}>
          { streams ? streams.map((stream,index) =>
              <VideoPlayer stream={stream} index={index} setSpotlightStream={setSpotlightStream} removeSpotlight={removeSpotlight} removeStream={removeStream} setChat={setChat} key={stream}/>
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
