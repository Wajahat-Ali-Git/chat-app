"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaRegUser, FaEnvelope, FaShieldHalved, FaBell, FaPalette, FaCommentDots, FaRegCopy, FaCheck } from "react-icons/fa6";
import Header from "../../src/components/Header";

function Profile() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings states (simulated)
  const [notifications, setNotifications] = useState(true);
  const [activeStatus, setActiveStatus] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data;
        setCurrentUser(userData);
        setName(userData.name || "");
        setEmail(userData.email || "");
        localStorage.setItem("user", JSON.stringify(userData));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to local storage if API fails
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          setCurrentUser(u);
          setName(u.name || "");
          setEmail(u.email || "");
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleCopyId = () => {
    if (currentUser?._id) {
      navigator.clipboard.writeText(currentUser._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Simulate saving profile data
    const updatedUser = { ...currentUser, name, email };
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getInitials = (n: string) => {
    return n ? n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "U";
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen justify-center items-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Header />

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:p-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
                Profile Settings
              </h1>
              <p className="text-slate-400 mt-1">
                Manage your user details, app preferences, and account status.
              </p>
            </div>
            
            {saveSuccess && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-sm animate-fade-in">
                <FaCheck /> Profile updated successfully!
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Glassmorphic Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl flex flex-col items-center text-center">
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                
                {/* Avatar */}
                <div className="relative group mb-6">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/20 ring-4 ring-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                    {getInitials(currentUser?.name)}
                  </div>
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-900 rounded-full shadow-lg"></span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                  {currentUser?.name}
                </h2>
                <p className="text-slate-400 text-sm mb-4 flex items-center gap-1">
                  <FaEnvelope className="text-xs text-slate-500" /> {currentUser?.email}
                </p>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Active Now
                </span>

                {/* ID Copier */}
                <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate mr-2 font-mono">ID: {currentUser?._id}</span>
                  <button 
                    onClick={handleCopyId}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Copy User ID"
                  >
                    {copied ? <FaCheck className="text-emerald-400" /> : <FaRegCopy />}
                  </button>
                </div>
              </div>

              {/* Account Quick Stats */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
                <h3 className="font-semibold text-slate-300">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40 text-center">
                    <span className="block text-2xl font-bold text-indigo-400">Active</span>
                    <span className="text-xs text-slate-500">Account Status</span>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40 text-center">
                    <span className="block text-2xl font-bold text-purple-400">Pro</span>
                    <span className="text-xs text-slate-500">Account Tier</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Edit Profile & Simulated Settings */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Details Edit Form */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaRegUser className="text-purple-400 text-lg" /> Profile Details
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-1.5 rounded-xl border border-slate-700 bg-slate-855/40 hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-slate-200 transition focus:outline-none ${
                        isEditing
                          ? "border-purple-500 bg-slate-950/80 focus:ring-2 focus:ring-purple-500/20"
                          : "border-slate-800 bg-slate-950/30 text-slate-400 cursor-not-allowed"
                      }`}
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-slate-200 transition focus:outline-none ${
                        isEditing
                          ? "border-purple-500 bg-slate-950/80 focus:ring-2 focus:ring-purple-500/20"
                          : "border-slate-800 bg-slate-950/30 text-slate-400 cursor-not-allowed"
                      }`}
                      placeholder="email@example.com"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setName(currentUser?.name || "");
                          setEmail(currentUser?.email || "");
                        }}
                        className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/20 transition duration-200"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Preferences Settings Panel */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaShieldHalved className="text-indigo-400 text-lg" /> Preferences & Security
                </h3>

                <div className="space-y-4">
                  {/* Active status */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800/40 rounded-2xl">
                    <div className="flex gap-3 items-center">
                      <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <FaPalette className="text-lg" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm">Show Active Status</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Allow contacts to see when you are online.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeStatus}
                        onChange={() => setActiveStatus(!activeStatus)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800/40 rounded-2xl">
                    <div className="flex gap-3 items-center">
                      <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                        <FaBell className="text-lg" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm">Push Notifications</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Receive real-time notifications for direct messages.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  {/* Sounds */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800/40 rounded-2xl">
                    <div className="flex gap-3 items-center">
                      <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                        <FaCommentDots className="text-lg" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm">Message Sounds</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Play a notification sound when a message is received.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={() => setSoundEnabled(!soundEnabled)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
