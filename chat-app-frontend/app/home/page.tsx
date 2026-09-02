"use client";

import Header from "../../src/components/Header";
import { AiOutlineSend } from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa6";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

export default function Home() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id || user.id;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find(
    (conversation) => conversation._id === conversationId,
  );
  const activeConversationUserName = activeConversation?.participants?.find(
    (participant: any) => participant._id !== userId,
  )?.name;

  useEffect(() => {
    const activeConvo =
      localStorage.getItem("activeConversationId") ||
      localStorage.getItem("conversationId");
    if (activeConvo) {
      setConversationId(activeConvo);
      fetchMessages(activeConvo);
    }
    getconversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    if (userId) {
      newSocket.emit("setup", userId);
    }

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Listen for user status changes
  useEffect(() => {
    if (!socket) return;
    
    const handleStatusChange = ({ userId: updatedUserId, isOnline, lastSeen }: any) => {
      setConversations(prev => prev.map(c => {
        const hasUser = c.participants?.some((p: any) => p._id === updatedUserId);
        if (hasUser) {
          const updatedParticipants = c.participants.map((p: any) => {
            if (p._id === updatedUserId) {
              return { ...p, isOnline, lastSeen };
            }
            return p;
          });
          return { ...c, participants: updatedParticipants };
        }
        return c;
      }));
    };
    
    socket.on("user_status_changed", handleStatusChange);
    
    return () => {
      socket.off("user_status_changed", handleStatusChange);
    };
  }, [socket]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ conversationId: typingConvoId, userId: typingUserId }: any) => {
      if (conversationId === typingConvoId) {
        setTypingUsers(prev => new Set(prev).add(typingUserId));
      }
    };

    const handleUserStopTyping = ({ conversationId: typingConvoId, userId: typingUserId }: any) => {
      if (conversationId === typingConvoId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(typingUserId);
          return newSet;
        });
      }
    };

    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [socket, conversationId]);

  // Join the active conversation room
  useEffect(() => {
    if (socket && conversationId) {
      socket.emit("join_conversation", conversationId);
    }
  }, [socket, conversationId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      // Update active messages if it matches
      if (conversationId === newMessage.conversation) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }

      // Update the sidebar conversations list with the latest message
      setConversations((prev) => {
        return prev.map((c) => {
          if (c._id === newMessage.conversation) {
            return { ...c, lastMessage: newMessage };
          }
          return c;
        });
      });
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, conversationId]);

  const fetchMessages = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`http://localhost:5000/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const selectConversation = (id: string) => {
    setConversationId(id);
    localStorage.setItem("activeConversationId", id);
    fetchMessages(id);
  };

  const getconversations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched conversations:", res.data);
      setConversations(res.data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

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

      // Stop typing indicator before sending
      if (socket && isTyping) {
        socket.emit("stop_typing", { conversationId: convoId, userId });
        setIsTyping(false);
      }

      await axios.post(
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

      // Clear the text input immediately for better UX
      setText("");
      
      // Note: Message will be added via Socket.IO 'new_message' event
      // This prevents duplicate messages for the sender
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (!socket || !conversationId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { conversationId, userId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId, userId });
      setIsTyping(false);
    }, 3000);
  };

  const formatLastSeen = (lastSeen: string | Date) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMs = now.getTime() - lastSeenDate.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return lastSeenDate.toLocaleDateString();
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Header />

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 px-4 py-4 md:px-8 md:py-6">
          {/* Welcome Header */}
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between shrink-0">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">
                Chat Dashboard
              </p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Welcome back, {user?.name || "User"}
              </h1>
            </div>
            <div className="self-start md:self-auto rounded-full border border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 py-2 text-xs md:text-sm text-slate-300 font-medium">
              {conversations.length} active chats
            </div>
          </div>

          {/* Grid/Flex Layout for Conversations & Chat Pane */}
          <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
            {/* Conversations List Section */}
            <section
              className={`w-full lg:w-[360px] rounded-[32px] border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-4 shadow-[0_30px_100px_-80px_rgba(15,23,42,0.9)] flex flex-col min-h-0 ${
                conversationId ? "hidden lg:flex" : "flex"
              }`}
            >
              <div className="mb-4 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    Conversations
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tap a chat to open it.
                  </p>
                </div>
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 border border-slate-700/50">
                  {conversations.length}
                </span>
              </div>

              {/* Chat list container (scrollable) */}
              <div className="flex-1 overflow-y-auto rounded-[24px] border border-slate-800/80 bg-slate-950/40 custom-scrollbar">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No conversations yet.
                    <br />
                    Start one from Contacts.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-900">
                    {conversations.map((conversation) => {
                      if (!conversation || !conversation.participants)
                        return null;

                      const otherUser = conversation.participants.find(
                        (participant: any) => participant._id !== userId,
                      );
                      const isActive = conversationId === conversation._id;

                      return (
                        <li
                          key={conversation._id}
                          onClick={() => selectConversation(conversation._id)}
                          className={`cursor-pointer px-4 py-4 transition-all duration-200 hover:bg-slate-900/60 ${
                            isActive
                              ? "bg-slate-900 border-l-4 border-blue-500"
                              : "border-l-4 border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white truncate">
                                  {otherUser?.name || "Unknown"}
                                </p>
                                {otherUser?.isOnline && (
                                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {otherUser?.email || "No email"}
                              </p>
                            </div>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 shrink-0">
                              {otherUser?.isOnline 
                                ? "Online" 
                                : otherUser?.lastSeen 
                                ? formatLastSeen(otherUser.lastSeen)
                                : "Offline"}
                            </span>
                          </div>
                          <p className="mt-2 truncate text-xs text-slate-400">
                            {conversation.lastMessage?.text ||
                              "No messages yet."}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            {/* Active Conversation Chat Window */}
            <section
              className={`flex-1 rounded-[32px] border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-4 md:p-6 shadow-[0_30px_100px_-80px_rgba(15,23,42,0.9)] flex flex-col min-h-0 ${
                conversationId ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Chat Header */}
              <div className="mb-4 flex flex-col gap-2 border-b border-slate-800 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  {conversationId && (
                    <button
                      onClick={() => setConversationId(null)}
                      className="lg:hidden p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
                      title="Back to Conversations"
                    >
                      <FaChevronLeft className="text-base" />
                    </button>
                  )}
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">
                      Active Conversation
                    </p>
                    <h2 className="mt-0.5 text-xl md:text-2xl font-bold tracking-tight text-white">
                      {activeConversationUserName || "Select a conversation"}
                    </h2>
                    {activeConversation && activeConversation.participants && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        {(() => {
                           const partner = activeConversation.participants.find((p: any) => p._id !== userId);
                           if (!partner) return null;
                           
                           // Check if partner is typing
                           if (typingUsers.has(partner._id)) {
                             return (
                               <span className="flex items-center gap-1.5 text-green-400 font-medium">
                                 <span className="flex gap-0.5">
                                   <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                   <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                   <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                 </span>
                                 typing...
                               </span>
                             );
                           }
                           
                           if (partner.isOnline) {
                             return <><span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span> Online</>;
                           } else if (partner.lastSeen) {
                             return `Last seen ${new Date(partner.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date(partner.lastSeen).toLocaleDateString()}`;
                           } else {
                             return "Offline";
                           }
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto rounded-[24px] border border-slate-800/80 bg-slate-950/40 p-4 min-h-0 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-slate-500">
                    <div>
                      <p className="text-base font-medium text-slate-300">
                        Choose a conversation to view messages.
                      </p>
                      <p className="mt-1.5 text-xs text-slate-500">
                        Your selected chat will appear here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isMine =
                        msg.sender?._id === userId || msg.sender === userId;
                      return (
                        <div
                          key={index}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-[20px] px-4 py-3 text-sm shadow-md ${
                              isMine
                                ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-br-none"
                                : "bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {msg.text}
                            </p>
                            <div
                              className={`mt-1.5 flex items-center gap-2 text-[10px] font-medium tracking-wide ${isMine ? "text-slate-300 justify-end" : "text-slate-500 justify-start"}`}
                            >
                              <span>{isMine ? "You" : msg.sender?.name || "Partner"}</span>
                              {msg.createdAt && (
                                <>
                                  <span className="w-0.5 h-0.5 rounded-full bg-slate-500/50"></span>
                                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {typingUsers.size > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-slate-900 border border-slate-800 rounded-[20px] rounded-bl-none px-4 py-3 text-sm shadow-md">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </div>
                            <span className="text-xs text-slate-400 ml-1">typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              {activeConversation && (
                <div className="mt-4 flex items-end gap-3 shrink-0">
                  <textarea
                    placeholder="Type a message..."
                    value={text}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="min-h-[50px] max-h-[120px] flex-1 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm resize-none custom-scrollbar"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!text.trim()}
                    className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3.5 text-white shadow-lg shadow-blue-500/10 transition hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100 shrink-0"
                  >
                    <AiOutlineSend className="text-xl" />
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
