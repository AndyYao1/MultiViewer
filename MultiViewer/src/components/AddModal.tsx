import { useEffect, useRef, useState, type FormEvent } from "react";
import { localStreamsString } from "../constants";

export default function AddModal({addStreams}: {addStreams:(streams:string[])=>void}){
    const [fields, setFields] = useState<{id: number; value: string;}[]>([{id: 0, value: ''}]);
    const [nextId, setNextId] = useState<number>(1);
    const lastItemRef = useRef<HTMLInputElement>(null);
    const focusNeeded = useRef<boolean>(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const handleChange = (id:number, value:string) => {
        setFields(prev =>
            prev.map(field => 
                field.id === id ? {id, value} : field
            )
        );

        // adds empty field once user types
        const isLastField = fields[fields.length - 1].id === id;
        if (isLastField && value.trim() !== ''){
            setFields(prev => [...prev, { id: nextId, value: ''}]);
            setNextId(prev => prev + 1);
        }

        // removes field after user deletes field if there's more than one
        if (!isLastField && value.trim() === ''){
            setFields(prev => prev.filter(field => field.id !== id));
            focusNeeded.current = true;
        } else {
            focusNeeded.current = false;
        }
    }

    const handleAddStreams = () => {
        addStreams(fields.map((field) => field.value));
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleAddStreams();
        dialogRef.current?.close();
    }

    // focuses last field after removing a field
    useEffect(() => {
        if (lastItemRef.current && focusNeeded.current){
            lastItemRef.current.focus();
            focusNeeded.current = false;
        }
    },[fields]);

    useEffect(() => {
        if (window.location.pathname === "/" && localStorage.getItem(localStreamsString) === null) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, []);

    return(
        <dialog 
            id="add-menu"
            ref={dialogRef} 
            className="backdrop:bg-black/50 rounded-lg shadow-xl p-0 w-[25vw] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-6/10"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    e.currentTarget.close();
                }
            }}
            onClose={() => {
                setFields([{id: 0, value: ''}]);
                setNextId(1);
            }}
        >   
            <form onSubmit={handleSubmit}>
                <div className="bg-neutral-800 text-slate-200 rounded-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b">
                        <h2 className="text-xl font-semibold">Add Streams</h2>
                    </div>

                    {/* Content */}
                    <div className="space-y-2 py-2 max-h-[50vh] overflow-y-auto">
                        {fields.map((field,index) => (
                            <div key={field.id} className="items-center">
                                <input
                                    type="text"
                                    value={field.value}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    placeholder={"Enter channel"}
                                    className="flex-1 px-3 py-2 ml-1 mr-1 w-[24vw] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    ref={index === fields.length - 1 ? lastItemRef : null}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 p-2 border-t rounded-b-lg">
                        <button
                            className="px-4 py-2 bg-zinc-600 text-slate-300 rounded hover:bg-zinc-700 transition"
                            type="submit"
                        >
                            Add
                        </button>

                        <button
                            command="close"
                            commandfor="add-menu"
                            type="button"
                            className="px-4 py-2 bg-zinc-600 text-slate-300 rounded hover:bg-zinc-700 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </dialog>
    )
}