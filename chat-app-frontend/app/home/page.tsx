"use client";

import Image from "next/image";
import { BsChatQuote, BsSendFill } from "react-icons/bs";
import { MdOutlineGroups2 } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import logo from "../logo/chat-we.png";
import Header from "../../src/components/Header";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      router.push("/login");
      return;
    }
    setCurrentUser(JSON.parse(userStr));

    const fetchConversations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, [router]);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await axios.get(
            `http://localhost:5000/api/messages/${selectedConversation._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setMessages(res.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/messages",
        {
          conversationId: selectedConversation._id,
          text: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getOtherParticipant = (participants: any[]) => {
    return participants.find((p) => p._id !== currentUser?.id);
  };

  return (
    <div>
      <div className="fixed right-0 h-full">
        <Header />
      </div>
    </div>
  );
}
