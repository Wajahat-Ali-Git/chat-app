"use client";

import Header from "../../src/components/Header";
import { AiOutlineSend } from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa6";
import { BsEmojiSmile } from "react-icons/bs";
import { BsSearch, BsXCircleFill } from "react-icons/bs";
import axios from "axios";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  // Map of conversationId -> unread count for the current user
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const messagesCacheRef = useRef<Record<string, any[]>>({});

  // When navigating from a search result, scroll to this message ID
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
  // Per-message DOM refs for targeted scrolling
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // localStorage is only available in the browser, not during SSR
  const [user] = useState(() => {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("user") || "{}");
  });
  const userId = user._id || user.id;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find(
    (conversation) => conversation._id === conversationId,
  );
  const activeConversationUserName = activeConversation?.isGroup
    ? activeConversation?.groupName || "Unnamed Group"
    : activeConversation?.participants?.find(
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

  // Scroll to a specific message if one is targeted; otherwise scroll to bottom
  useEffect(() => {
    if (messages.length === 0) return;

    if (targetMessageId && messageRefs.current[targetMessageId]) {
      messageRefs.current[targetMessageId]!.scrollIntoView({ behavior: "smooth", block: "center" });
      // Clear target so subsequent new messages go back to scrolling to bottom
      setTargetMessageId(null);
    } else if (!targetMessageId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, targetMessageId]);

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
      const incomingConvoId: string = newMessage.conversation;
      const isFromMe =
        newMessage.sender?._id === userId || newMessage.sender === userId;

      if (conversationId === incomingConvoId) {
        // This conversation is currently open — append (dedup guarded)
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        // No badge for the active conversation
      } else if (!isFromMe) {
        // Message in a background conversation not sent by me — bump badge
        setUnreadCounts((prev) => ({
          ...prev,
          [incomingConvoId]: (prev[incomingConvoId] || 0) + 1,
        }));
      }

      // Always refresh the sidebar last-message preview (skip if no change)
      setConversations((prev) =>
        prev.map((c) =>
          c._id === incomingConvoId ? { ...c, lastMessage: newMessage } : c,
        ),
      );
      // Invalidate the message cache so the next search picks up this message
      delete messagesCacheRef.current[incomingConvoId];
    };

    // The other user opened the conversation and read the messages — clear badge
    const handleMessagesRead = ({ conversationId: readConvoId }: any) => {
      setUnreadCounts((prev) => {
        if (!prev[readConvoId]) return prev;
        const next = { ...prev };
        delete next[readConvoId];
        return next;
      });
    };

    // When the recipient responds to an invite, update that message in state
    const handleInviteResponse = (updatedMessage: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
    };

    // Live reaction updates — replace the message in state with the server copy
    const handleReactionUpdated = (updatedMessage: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);
    socket.on("invite_response", handleInviteResponse);
    socket.on("reaction_updated", handleReactionUpdated);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
      socket.off("invite_response", handleInviteResponse);
      socket.off("reaction_updated", handleReactionUpdated);
    };
  }, [socket, conversationId, userId]);

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

  const selectConversation = (id: string, scrollToMessageId?: string) => {
    setConversationId(id);
    localStorage.setItem("activeConversationId", id);
    if (scrollToMessageId) setTargetMessageId(scrollToMessageId);
    fetchMessages(id);
    // Clear the unread badge immediately when the user opens the conversation
    setUnreadCounts((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const getconversations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);

      // Seed unread counts from the server response
      const counts: Record<string, number> = {};
      res.data.forEach((c: any) => {
        if (c.unreadCount > 0) counts[c._id] = c.unreadCount;
      });
      setUnreadCounts(counts);
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

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prevText) => prevText + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // ── Search types ──────────────────────────────────────────────────────────
  type MatchReason = {
    type: "name" | "message" | "date";
    label: string;
    snippet: string;
    matchedMessage?: any;
  };
  type SearchResult = {
    conversation: any;
    otherUser: any;
    matchReasons: MatchReason[];
  };

  // ── Search helpers ────────────────────────────────────────────────────────

  /** Try to parse the query as a date expression, returning a ms range. */
  const parseDateQuery = (q: string): { from: number; to: number } | null => {
    const lower = q.trim().toLowerCase();
    const now = new Date();

    if (lower === "today") {
      const from = new Date(now); from.setHours(0, 0, 0, 0);
      const to   = new Date(now); to.setHours(23, 59, 59, 999);
      return { from: from.getTime(), to: to.getTime() };
    }
    if (lower === "yesterday") {
      const d = new Date(now); d.setDate(d.getDate() - 1);
      const from = new Date(d); from.setHours(0, 0, 0, 0);
      const to   = new Date(d); to.setHours(23, 59, 59, 999);
      return { from: from.getTime(), to: to.getTime() };
    }
    if (lower === "this week") {
      const from = new Date(now); from.setDate(now.getDate() - now.getDay()); from.setHours(0,0,0,0);
      return { from: from.getTime(), to: now.getTime() };
    }
    if (lower === "last week") {
      const end   = new Date(now); end.setDate(now.getDate() - now.getDay() - 1); end.setHours(23,59,59,999);
      const start = new Date(end); start.setDate(end.getDate() - 6); start.setHours(0,0,0,0);
      return { from: start.getTime(), to: end.getTime() };
    }
    if (lower === "this month") {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: from.getTime(), to: now.getTime() };
    }
    const parsed = new Date(q);
    if (!isNaN(parsed.getTime())) {
      const hasTime = /\d{1,2}:\d{2}/.test(q);
      if (hasTime) {
        return { from: parsed.getTime() - 60_000, to: parsed.getTime() + 60_000 };
      }
      const from = new Date(parsed); from.setHours(0, 0, 0, 0);
      const to   = new Date(parsed); to.setHours(23, 59, 59, 999);
      return { from: from.getTime(), to: to.getTime() };
    }
    return null;
  };

  /** Highlight the matching substring in a string, returning JSX. */
  const highlight = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span className="text-slate-400 truncate">{text}</span>;
    const before = text.slice(0, idx);
    const match  = text.slice(idx, idx + query.length);
    const after  = text.slice(idx + query.length);
    return (
      <span className="text-slate-300">
        {before}
        <mark className="bg-blue-500/30 text-blue-200 rounded px-0.5 not-italic">{match}</mark>
        {after}
      </span>
    );
  };

  /** Fetch messages for a conversation, using an in-memory cache. */
  const getConversationMessages = async (convoId: string): Promise<any[]> => {
    if (messagesCacheRef.current[convoId]) return messagesCacheRef.current[convoId];
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];
      const res = await axios.get(`http://localhost:5000/api/messages/${convoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      messagesCacheRef.current[convoId] = res.data;
      return res.data;
    } catch {
      return [];
    }
  };

  /** Run the full search across all loaded conversations. */
  const runSearch = async (q: string) => {
    const query = q.trim();
    if (!query) { setSearchResults(null); setIsSearching(false); return; }

    setIsSearching(true);
    const results: SearchResult[] = [];
    const dateRange = parseDateQuery(query);
    const lowerQuery = query.toLowerCase();

    for (const convo of conversations) {
      if (!convo.participants) continue;
      const otherUser = convo.participants.find((p: any) => p._id !== userId);
      if (!otherUser) continue;

      const matchReasons: MatchReason[] = [];

      // 1 — Name match (no extra fetch needed)
      if (otherUser.name?.toLowerCase().includes(lowerQuery)) {
        matchReasons.push({ type: "name", label: "Name", snippet: otherUser.name });
      }

      // 2 — Message content + date (fetch once, cached)
      const msgs = await getConversationMessages(convo._id);

      // Content match (only when not a date query) — most recent matching msg
      if (!dateRange) {
        const contentMatches = msgs.filter((m: any) =>
          m.text?.toLowerCase().includes(lowerQuery),
        );
        if (contentMatches.length > 0) {
          const best = contentMatches[contentMatches.length - 1];
          matchReasons.push({
            type: "message",
            label: "Message",
            snippet: best.text,
            matchedMessage: best,
          });
        }
      }

      // Date match
      if (dateRange) {
        const dateMatches = msgs.filter((m: any) => {
          const t = new Date(m.createdAt).getTime();
          return t >= dateRange.from && t <= dateRange.to;
        });
        if (dateMatches.length > 0) {
          const best = dateMatches[dateMatches.length - 1];
          matchReasons.push({
            type: "date",
            label: "Date",
            snippet: `${dateMatches.length} message${dateMatches.length !== 1 ? "s" : ""} · ${new Date(best.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`,
            matchedMessage: best,
          });
        }
      }

      if (matchReasons.length > 0) {
        results.push({ conversation: convo, otherUser, matchReasons });
      }
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!val.trim()) { setSearchResults(null); setIsSearching(false); return; }
    setIsSearching(true);
    searchDebounceRef.current = setTimeout(() => runSearch(val), 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setIsSearching(false);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
  };

  // Badge colours per match type
  const matchTypeBadge: Record<string, string> = {
    name:    "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    message: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    date:    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  };

  // ── Close emoji picker when clicking outside ──────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

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
              {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold px-1.5">
                  {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
                </span>
              )}
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

              {/* Search bar */}
              <div className="mb-3 shrink-0 relative">
                <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by name, message, date…"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 pl-9 pr-9 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <BsXCircleFill className="text-sm" />
                  </button>
                )}
              </div>

              {/* Chat list container (scrollable) */}
              <div className="flex-1 overflow-y-auto rounded-[24px] border border-slate-800/80 bg-slate-950/40 custom-scrollbar">
                {searchQuery
                  ? /* ── Search results ── */ (
                      isSearching ? (
                        <div className="flex flex-col items-center justify-center gap-2 p-8 text-slate-500 text-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          Searching…
                        </div>
                      ) : searchResults && searchResults.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          <p className="text-slate-300 font-medium mb-1">No results</p>
                          <p>Try a name, keyword, or date like "today" or "Jan 15".</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-900">
                          {(searchResults ?? []).map(({ conversation, otherUser, matchReasons }) => {
                            const isActive = conversationId === conversation._id;
                            return (
                              <li
                                key={conversation._id}
                                onClick={() => {
                                  // Find the most relevant matched message to scroll to
                                  const msgReason = matchReasons.find(
                                    r => r.type === "message" || r.type === "date"
                                  );
                                  selectConversation(
                                    conversation._id,
                                    msgReason?.matchedMessage?._id,
                                  );
                                  clearSearch();
                                }}
                                className={`cursor-pointer px-4 py-3.5 transition-all duration-200 hover:bg-slate-900/60 ${
                                  isActive ? "bg-slate-900 border-l-4 border-blue-500" : "border-l-4 border-transparent"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {matchReasons.some(r => r.type === "name")
                                      ? highlight(otherUser.name, searchQuery)
                                      : otherUser.name}
                                  </p>
                                  {otherUser.isOnline && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  {matchReasons.map((reason, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wide ${matchTypeBadge[reason.type]}`}>
                                        {reason.label}
                                      </span>
                                      <span className="text-xs text-slate-400 truncate leading-relaxed">
                                        {reason.type === "message"
                                          ? highlight(reason.snippet, searchQuery)
                                          : reason.snippet}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )
                    )
                  : /* ── Default conversation list ── */ (
                      conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          No conversations yet.<br />Start one from Contacts.
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-900">
                          {conversations.map((conversation) => {
                            if (!conversation || !conversation.participants) return null;
                            const isGroup = conversation.isGroup;
                            const otherUser = !isGroup
                              ? conversation.participants.find(
                                  (participant: any) => participant._id !== userId,
                                )
                              : null;
                            const displayName = isGroup
                              ? conversation.groupName || "Unnamed Group"
                              : otherUser?.name || "Unknown";
                            const isActive = conversationId === conversation._id;

                            // Last message preview — for groups prefix with sender name
                            const lastMsg = conversation.lastMessage;
                            let lastMsgPreview = "No messages yet.";
                            if (lastMsg?.text) {
                              if (isGroup && lastMsg.sender) {
                                const senderName =
                                  lastMsg.sender._id === userId
                                    ? "You"
                                    : lastMsg.sender.name || "Member";
                                lastMsgPreview = `${senderName}: ${lastMsg.text}`;
                              } else {
                                lastMsgPreview = lastMsg.text;
                              }
                            }

                            return (
                              <li
                                key={conversation._id}
                                onClick={() => selectConversation(conversation._id)}
                                className={`cursor-pointer px-4 py-4 transition-all duration-200 hover:bg-slate-900/60 ${
                                  isActive
                                    ? "bg-slate-900 border-l-4 border-blue-500"
                                    : unreadCounts[conversation._id]
                                    ? "border-l-4 border-blue-400/60 bg-slate-900/20"
                                    : "border-l-4 border-transparent"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      {isGroup && (
                                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">
                                          Group
                                        </span>
                                      )}
                                      <p className="text-sm font-semibold text-white truncate">
                                        {displayName}
                                      </p>
                                      {!isGroup && otherUser?.isOnline && (
                                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                      )}
                                    </div>
                                    {!isGroup && (
                                      <p className="text-xs text-slate-500 truncate mt-0.5">
                                        {otherUser?.email || "No email"}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    {!isGroup && (
                                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                        {otherUser?.isOnline
                                          ? "Online"
                                          : otherUser?.lastSeen
                                          ? formatLastSeen(otherUser.lastSeen)
                                          : "Offline"}
                                      </span>
                                    )}
                                    {unreadCounts[conversation._id] > 0 && (
                                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold px-1.5 shadow-md shadow-blue-500/30">
                                        {unreadCounts[conversation._id] > 99 ? "99+" : unreadCounts[conversation._id]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className={`mt-2 truncate text-xs ${unreadCounts[conversation._id] ? "text-slate-200 font-medium" : "text-slate-400"}`}>
                                  {lastMsgPreview}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      )
                    )
                }
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
                           // ── Group conversation ──────────────────────────
                           if (activeConversation.isGroup) {
                             const memberCount = activeConversation.participants.length;
                             const anyTyping = [...typingUsers].some((uid) =>
                               activeConversation.participants.some((p: any) => p._id === uid)
                             );
                             if (anyTyping) {
                               const typer = activeConversation.participants.find((p: any) =>
                                 typingUsers.has(p._id)
                               );
                               return (
                                 <span className="flex items-center gap-1.5 text-green-400 font-medium">
                                   <span className="flex gap-0.5">
                                     <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                     <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                     <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                   </span>
                                   {typer?.name ?? "Someone"} is typing...
                                 </span>
                               );
                             }
                             return (
                               <>
                                 <span className="text-indigo-400 font-semibold">Group</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                 {memberCount} {memberCount === 1 ? "member" : "members"}
                               </>
                             );
                           }

                           // ── 1-on-1 conversation ─────────────────────────
                           const partner = activeConversation.participants.find((p: any) => p._id !== userId);
                           if (!partner) return null;
                           
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
                      const isTarget = msg._id === targetMessageId;

                      // ── Group invite card ────────────────────────────────
                      if (msg.type === "group_invite") {
                        const invite = msg.groupInvite;
                        const status: string = invite?.status ?? "pending";
                        const isPending = status === "pending";
                        // Only the recipient (non-sender) can respond
                        const canRespond = !isMine && isPending;

                        const statusStyles: Record<string, string> = {
                          pending:  "border-indigo-500/30 bg-indigo-500/5",
                          accepted: "border-emerald-500/30 bg-emerald-500/5",
                          rejected: "border-red-500/20 bg-red-500/5",
                        };
                        const statusLabel: Record<string, string> = {
                          pending:  "",
                          accepted: "✓ Accepted",
                          rejected: "✗ Declined",
                        };
                        const statusLabelStyle: Record<string, string> = {
                          accepted: "text-emerald-400",
                          rejected: "text-red-400",
                        };

                        const handleRespond = async (response: "accepted" | "rejected") => {
                          const token = localStorage.getItem("token");
                          if (!token) return;
                          try {
                            const res = await axios.post(
                              `http://localhost:5000/api/messages/${msg._id}/respond-invite`,
                              { response },
                              { headers: { Authorization: `Bearer ${token}` } },
                            );
                            // Optimistically update local state
                            setMessages((prev) =>
                              prev.map((m) =>
                                m._id === msg._id ? res.data.inviteMessage : m,
                              ),
                            );
                            // Refresh groups list if accepted
                            if (response === "accepted") {
                              const convRes = await axios.get(
                                "http://localhost:5000/api/conversations",
                                { headers: { Authorization: `Bearer ${token}` } },
                              );
                              setConversations(convRes.data);
                            }
                          } catch (err: any) {
                            console.error("Invite response failed:", err?.response?.data?.message);
                          }
                        };

                        return (
                          <div
                            key={msg._id || index}
                            ref={(el) => { if (msg._id) messageRefs.current[msg._id] = el; }}
                            className="flex justify-center my-2"
                          >
                            <div className={`w-full max-w-sm rounded-2xl border p-4 ${statusStyles[status] ?? statusStyles.pending} backdrop-blur-sm`}>
                              {/* Header */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
                                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" />
                                  </svg>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                                    Group Invitation
                                  </p>
                                  <p className="text-sm font-bold text-white truncate">
                                    {invite?.groupName ?? "Unknown Group"}
                                  </p>
                                </div>
                              </div>

                              {/* Invite text */}
                              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                                {isMine
                                  ? `You invited ${activeConversation?.participants?.find((p: any) => p._id !== userId)?.name ?? "them"} to join this group.`
                                  : `${msg.sender?.name ?? "Someone"} invited you to join this group.`}
                              </p>

                              {/* Status / actions */}
                              {!isPending ? (
                                <p className={`text-xs font-semibold text-center ${statusLabelStyle[status] ?? ""}`}>
                                  {statusLabel[status]}
                                </p>
                              ) : canRespond ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleRespond("accepted")}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold transition-all"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRespond("rejected")}
                                    className="flex-1 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 text-center">
                                  Waiting for response…
                                </p>
                              )}

                              {/* Timestamp */}
                              {msg.createdAt && (
                                <p className="text-[10px] text-slate-600 text-center mt-2">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // ── Normal text message ──────────────────────────────
                      // Group reactions by emoji for display
                      const reactionGroups: Record<string, { count: number; myReaction: boolean }> = {};
                      (msg.reactions ?? []).forEach((r: any) => {
                        const e = r.emoji;
                        if (!reactionGroups[e]) reactionGroups[e] = { count: 0, myReaction: false };
                        reactionGroups[e].count++;
                        if (r.userId === userId || r.userId?._id === userId) {
                          reactionGroups[e].myReaction = true;
                        }
                      });
                      const reactionEntries = Object.entries(reactionGroups);

                      const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

                      const handleReact = async (emoji: string) => {
                        const token = localStorage.getItem("token");
                        if (!token) return;
                        try {
                          const res = await axios.post(
                            `http://localhost:5000/api/messages/${msg._id}/react`,
                            { emoji },
                            { headers: { Authorization: `Bearer ${token}` } },
                          );
                          setMessages((prev) =>
                            prev.map((m) => (m._id === msg._id ? res.data : m)),
                          );
                        } catch (err) {
                          console.error("React failed:", err);
                        }
                      };

                      return (
                        <div
                          key={msg._id || index}
                          ref={(el) => { if (msg._id) messageRefs.current[msg._id] = el; }}
                          className={`group/msg flex transition-colors duration-300 rounded-[24px] ${
                            isMine ? "justify-end" : "justify-start"
                          } ${isTarget ? "bg-blue-500/10 -mx-2 px-2 py-1" : ""}`}
                        >
                          {/* Reaction picker — shown on hover, placed opposite the bubble */}
                          <div className={`flex items-center self-end mb-1 ${isMine ? "order-first mr-1.5" : "order-last ml-1.5"}`}>
                            <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 bg-slate-900 border border-slate-700/60 rounded-full px-2 py-1 shadow-lg backdrop-blur-sm">
                              {QUICK_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReact(emoji)}
                                  className="text-base leading-none hover:scale-125 active:scale-110 transition-transform duration-100 px-0.5"
                                  title={emoji}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Bubble + reactions */}
                          <div className="flex flex-col max-w-[75%]">
                            <div
                              className={`rounded-[20px] px-4 py-3 text-sm shadow-md ${
                                isMine
                                  ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-br-none"
                                  : "bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none"
                              } ${isTarget ? "ring-2 ring-blue-400/60 ring-offset-1 ring-offset-transparent" : ""}`}
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
                                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Reaction chips */}
                            {reactionEntries.length > 0 && (
                              <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                                {reactionEntries.map(([emoji, { count, myReaction }]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReact(emoji)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all duration-150 hover:scale-105 active:scale-95 ${
                                      myReaction
                                        ? "bg-blue-500/20 border-blue-500/50 text-blue-200"
                                        : "bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-500"
                                    }`}
                                    title={myReaction ? "Remove reaction" : "React"}
                                  >
                                    <span>{emoji}</span>
                                    {count > 1 && <span className="font-semibold">{count}</span>}
                                  </button>
                                ))}
                              </div>
                            )}
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
                <div className="mt-4 shrink-0">
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-24 right-8 z-50">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        theme={Theme.DARK}
                        searchDisabled={false}
                        skinTonesDisabled={false}
                        width={350}
                        height={400}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-end gap-3">
                    <div className="relative flex-1">
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
                        className="min-h-[50px] max-h-[120px] w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm resize-none custom-scrollbar"
                      />
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-3 bottom-3 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                        title="Add emoji"
                      >
                        <BsEmojiSmile className="text-xl" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleSend()}
                      disabled={!text.trim()}
                      className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3.5 text-white shadow-lg shadow-blue-500/10 transition hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100 shrink-0"
                    >
                      <AiOutlineSend className="text-xl" />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
