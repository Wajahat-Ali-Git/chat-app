"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FaMagnifyingGlass,
  FaComment,
  FaRegEnvelope,
  FaUser,
  FaSpinner,
} from "react-icons/fa6";
import Header from "../../src/components/Header";

const ContactsPage = () => {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatStarting, setChatStarting] = useState<string | null>(null);

  const fetchContacts = async (query: string = "") => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/users?search=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setContacts(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(searchQuery);
  }, [searchQuery]);

  const handleStartChat = async (contactId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setChatStarting(contactId);
    try {
      // API expects "reciverId"
      const res = await axios.post(
        "http://localhost:5000/api/conversations",
        { reciverId: contactId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Store the active conversation ID so the home page can auto-select it
      localStorage.setItem("activeConversationId", res.data._id);
      router.push("/home");
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
      setChatStarting(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";
  };

  // Curated gradient palettes for avatars
  const avatarGradients = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-violet-500 to-fuchsia-500",
  ];

  const getGradient = (name: string) => {
    const charCode = name ? name.charCodeAt(0) : 0;
    const index = charCode % avatarGradients.length;
    return avatarGradients[index];
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Title & Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">
                Contact Directory
              </h1>
              <p className="text-slate-400 mt-1">
                Find and start instant conversations with members of your
                network.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs md:text-sm text-slate-400">
              Total Network:{" "}
              <span className="text-orange-400 font-bold">
                {contacts.length}
              </span>{" "}
              members
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaMagnifyingGlass className="text-slate-500 text-sm" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts by name or email..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl pl-11 pr-4 py-3.5 text-slate-200 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-lg"
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <FaSpinner className="text-4xl text-orange-500 animate-spin" />
              <p className="text-slate-500 font-medium">
                Fetching directory...
              </p>
            </div>
          ) : (
            <>
              {/* Contacts Grid */}
              {contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contacts.map((contact) => {
                    const gradClass = getGradient(contact.name);
                    const initials = getInitials(contact.name);
                    const isStarting = chatStarting === contact._id;

                    return (
                      <div
                        key={contact._id}
                        className="relative group rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 backdrop-blur-sm p-6 shadow-xl hover:shadow-orange-950/10 hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between h-[230px]"
                      >
                        {/* Background subtle glow effect */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>

                        {/* Card Top: Avatar & Info */}
                        <div className="flex gap-4 items-start">
                          <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${gradClass} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                              {contact.name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate mt-1 flex items-center gap-1">
                              <FaRegEnvelope /> {contact.email}
                            </p>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-950/50 text-slate-400 border border-slate-800/80 mt-3.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Offline
                            </span>
                          </div>
                        </div>

                        {/* Card Bottom: Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-4 border-t border-slate-800/60 pt-4">
                          <button
                            onClick={() => handleStartChat(contact._id)}
                            disabled={isStarting}
                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-950/20 disabled:opacity-50 transition duration-200"
                          >
                            {isStarting ? (
                              <FaSpinner className="animate-spin text-sm" />
                            ) : (
                              <>
                                <FaComment />
                                <span>Message</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80 text-slate-400 hover:text-white text-xs font-medium transition duration-200"
                          >
                            <FaRegEnvelope className="text-sm" />
                            <span>Email</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty State */
                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <FaUser className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    No Contacts Found
                  </h3>
                  <p className="text-slate-500 text-sm">
                    We couldn't find anyone matching "{searchQuery}". Try
                    updating your search criteria.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContactsPage;
