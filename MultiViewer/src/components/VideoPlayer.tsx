import { XMarkIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useSortable } from "@dnd-kit/react/sortable";
import { useRef } from "react";
import DragIcon from "../assets/DragIcon.tsx";

export default function VideoPlayer({stream,index,setSpotlightStream,removeSpotlight,removeStream,setChat}: {stream:string, index:number, setSpotlightStream:(stream:string)=>void, removeSpotlight:()=>void, removeStream:(steam:string)=>void, setChat:(stream:string)=>void}) {
    const handleRef = useRef<HTMLDivElement>(null);
    const {ref} = useSortable({id:stream, index, handle:handleRef});

    if (!stream) {
        return null;
    }

    return (
        <div className="flex ml-1 mb-1 min-w-0 relative" data-item-id={stream} ref={ref}>
            <iframe
                src={`https://player.twitch.tv/?channel=${stream}&parent=localhost`}
                className={`w-[500px] h-[400px]`}>
            </iframe>
            
            <div className="h-[400px] w-5 ml-1 flex flex-col space-y-1">
                <button className="bg-gray-500 w-5 h-5 rounded hidden" onClick={() => removeStream(stream)}><XMarkIcon></XMarkIcon></button>
                <button className="bg-gray-500 w-5 h-5 rounded hidden" id="moveDownBtn" onClick={() => removeSpotlight()}><ChevronDoubleDownIcon></ChevronDoubleDownIcon></button> 
                <button className="bg-gray-500 w-5 h-5 rounded hidden" id="moveUpBtn" onClick={() => setSpotlightStream(stream)}><ChevronDoubleUpIcon></ChevronDoubleUpIcon></button> 
            </div> 

            <div className="absolute z-10 top-3/4 left-1/2 -translate-x-1/2 -translate-y-6/10 bg-neutral-500 text-slate-200 px-2 py-2 flex flex-wrap hidden">
                <div className="m-1" ref={handleRef} ><DragIcon/></div>
                <div className="m-1" onClick={() => setChat(stream)}><ChatBubbleLeftIcon className="cursor-pointer" width={20} height={20}/></div>
            </div>
        </div>
    );
}