"use client";

import Header from "../../src/components/Header";
import { AiOutlineSend } from "react-icons/ai";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const router = useRouter();

  useEffect(() => {
    setConversationId(
      localStorage.getItem("conversationId") ||
        localStorage.getItem("activeConversationId"),
    );
  }, []);

  const handleSend = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      // ensure we have a conversationId (check state first, then localStorage)
      const convoId =
        conversationId ||
        localStorage.getItem("conversationId") ||
        localStorage.getItem("activeConversationId");

      if (!convoId) {
        console.error("No conversation selected");
        return;
      }

      const res = await axios.post(
        `http://localhost:5000/api/messages`,
        {
          conversationId: convoId,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // append the new message to the list
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div>
      <div className="fixed right-0 h-full">
        <Header />
      </div>
      <div>
        <div className="p-4 border-b border-slate-700 bg-slate-900/95 text-white font-bold text-2xl">
          <h1>My Messages</h1>
        </div>
        <div className="p-4 flex">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-black">username</h1>
            <div className="flex items-center gap-2 mt-4">
              <textarea
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="border-1  rounded-xl px-1 w-full h-20 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                className=" w-[15px] align-center"
                onClick={() => handleSend()}
              >
                <AiOutlineSend className="text-3xl text-purple-500" />
              </button>
            </div>
          </div>
          <div className="flex-2"></div>
        </div>
      </div>
    </div>
  );
}
