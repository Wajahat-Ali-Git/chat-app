"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "../../src/components/Header";
import {
  MdOutlineGroups2,
  MdOutlineGroupAdd,
  MdPersonAddAlt1,
  MdClose,
  MdCheck,
} from "react-icons/md";
import {
  FaMagnifyingGlass,
  FaSpinner,
  FaRegEnvelope,
  FaArrowRightFromBracket,
} from "react-icons/fa6";
import { BsSearch, BsXCircleFill, BsShieldCheck } from "react-icons/bs";
import { HiOutlineUserGroup } from "react-icons/hi2";

// ── Types ──────────────────────────────────────────────────────────────────

type User = {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
};

type Group = {
  _id: string;
  groupName: string;
  participants: User[];
  createdBy?: string;
  lastMessage?: { text: string; createdAt: string } | null;
  createdAt: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const avatarGradients = [
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-orange-500 to-amber-500",
  "from-violet-500 to-fuchsia-500",
];

const getGradient = (seed: string) =>
  avatarGradients[(seed?.charCodeAt(0) ?? 0) % avatarGradients.length];

const getInitials = (name: string) =>
  (name ?? "G")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ── Component ─────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const router = useRouter();

  const [user] = useState<User>(() => {
    if (typeof window === "undefined") return { _id: "", name: "", email: "" };
    return JSON.parse(localStorage.getItem("user") || "{}");
  });
  const userId = user._id;

  // ── Data state ────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Create group modal ────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ── Invite modal ──────────────────────────────────────────────────────
  const [inviteTargetGroup, setInviteTargetGroup] = useState<Group | null>(null);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviting, setInviting] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // ── Leave confirmation ────────────────────────────────────────────────
  const [leaveTarget, setLeaveTarget] = useState<Group | null>(null);
  const [leaving, setLeaving] = useState(false);

  // ── Tab ───────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"all" | "mine">("all");

  // ── Fetch on mount ─────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/conversations?type=group", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter to only group conversations
      const groupConvos = (res.data as Group[]).filter((c: any) => c.isGroup);
      setGroups(groupConvos);
    } catch {
      // API may not support the query param yet — fall back to unfiltered
      try {
        const token2 = localStorage.getItem("token");
        const res2 = await axios.get("http://localhost:5000/api/conversations", {
          headers: { Authorization: `Bearer ${token2}` },
        });
        setGroups((res2.data as any[]).filter((c: any) => c.isGroup));
      } catch {
        setGroups([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Exclude self
      setAllUsers((res.data as User[]).filter((u) => u._id !== userId));
    } catch {
      setAllUsers([]);
    }
  };

  // ── Create group ────────────────────────────────────────────────────────

  const handleCreateGroup = async () => {
    if (!groupName.trim()) { setCreateError("Group name is required."); return; }
    if (selectedMembers.length === 0) { setCreateError("Add at least one member."); return; }

    setCreating(true);
    setCreateError("");
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/api/conversations/group",
        {
          groupName: groupName.trim(),
          participantIds: selectedMembers.map((m) => m._id),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setGroupName("");
      setSelectedMembers([]);
      setMemberSearch("");
      setShowCreateModal(false);
      await fetchGroups();
    } catch (err: any) {
      setCreateError(err?.response?.data?.message ?? "Failed to create group. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const toggleMember = (u: User) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m._id === u._id)
        ? prev.filter((m) => m._id !== u._id)
        : [...prev, u],
    );
  };

  // ── Invite member ───────────────────────────────────────────────────────

  const handleInvite = async (targetUser: User) => {
    if (!inviteTargetGroup) return;
    setInviting(targetUser._id);
    setInviteSuccess(null);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/conversations/${inviteTargetGroup._id}/invite`,
        { userId: targetUser._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setInviteSuccess(targetUser._id);
      // Refresh groups so the member list updates
      await fetchGroups();
      setTimeout(() => setInviteSuccess(null), 2000);
    } catch (err: any) {
      // Silently show inline error — keep modal open
      console.error("Invite failed:", err?.response?.data?.message);
    } finally {
      setInviting(null);
    }
  };

  // ── Leave group ──────────────────────────────────────────────────────────

  const handleLeave = async () => {
    if (!leaveTarget) return;
    setLeaving(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/conversations/${leaveTarget._id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLeaveTarget(null);
      await fetchGroups();
    } catch (err: any) {
      console.error("Leave failed:", err?.response?.data?.message);
      setLeaveTarget(null);
    } finally {
      setLeaving(false);
    }
  };

  // ── Derived lists ────────────────────────────────────────────────────────

  const displayedGroups =
    tab === "mine"
      ? groups.filter(
          (g) =>
            g.createdBy === userId ||
            g.participants?.some((p) => p._id === userId),
        )
      : groups;

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  const inviteFilteredUsers = inviteTargetGroup
    ? allUsers.filter(
        (u) =>
          !inviteTargetGroup.participants?.some((p) => p._id === u._id) &&
          (u.name?.toLowerCase().includes(inviteSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(inviteSearch.toLowerCase())),
      )
    : [];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header />

      <main className="flex-1 overflow-y-auto px-6 py-8 md:p-12 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* ── Page header ─────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">
                Group Conversations
              </p>
              <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                Groups
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Create and manage your group conversations.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs md:text-sm text-slate-400">
                <span className="text-emerald-400 font-bold">{groups.length}</span>{" "}
                {groups.length === 1 ? "group" : "groups"}
              </div>

              <button
                onClick={() => { setShowCreateModal(true); setCreateError(""); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MdOutlineGroupAdd className="text-lg" />
                <span>New Group</span>
              </button>
            </div>
          </div>

          {/* ── Tabs ───────────────────────────────────────────────── */}
          <div className="flex gap-2 p-1 rounded-2xl bg-slate-900/60 border border-slate-800 w-fit">
            {(["all", "mine"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t === "all" ? "All Groups" : "My Groups"}
              </button>
            ))}
          </div>

          {/* ── Loading ─────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <FaSpinner className="text-4xl text-emerald-500 animate-spin" />
              <p className="text-slate-500 font-medium">Loading groups…</p>
            </div>
          ) : displayedGroups.length === 0 ? (

          /* ── Empty state ──────────────────────────────────────────── */
            <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/10 p-14 text-center max-w-md mx-auto mt-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
                <HiOutlineUserGroup className="text-3xl text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No groups yet</h3>
              <p className="text-slate-500 text-sm mb-6">
                {tab === "mine"
                  ? "You haven't created or joined any groups."
                  : "No groups exist yet. Create the first one!"}
              </p>
              <button
                onClick={() => { setShowCreateModal(true); setCreateError(""); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold transition-all duration-200"
              >
                <MdOutlineGroupAdd className="text-lg" />
                Create a group
              </button>
            </div>

          ) : (

          /* ── Group cards grid ─────────────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedGroups.map((group) => {
                const grad = getGradient(group.groupName);
                const initials = getInitials(group.groupName);
                const isCreator = group.createdBy === userId;
                const memberCount = group.participants?.length ?? 0;

                return (
                  <div
                    key={group._id}
                    className="relative group rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 backdrop-blur-sm p-6 shadow-xl hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between gap-4"
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

                    {/* ── Card top ─────────────────────────────────── */}
                    <div className="flex gap-4 items-start">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${grad} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Group name + creator badge */}
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {group.groupName}
                          </h3>
                          {isCreator && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                              <BsShieldCheck className="text-xs" /> Admin
                            </span>
                          )}
                        </div>

                        {/* Member count */}
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <MdOutlineGroups2 className="text-sm" />
                          {memberCount} {memberCount === 1 ? "member" : "members"}
                        </p>

                        {/* Last message preview */}
                        {group.lastMessage?.text && (
                          <p className="text-xs text-slate-400 mt-1.5 truncate">
                            {group.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ── Member avatar stack ───────────────────────── */}
                    {group.participants && group.participants.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {group.participants.slice(0, 5).map((p) => (
                            <div
                              key={p._id}
                              title={p.name}
                              className={`w-7 h-7 rounded-full bg-gradient-to-tr ${getGradient(p.name)} flex items-center justify-center text-white text-[10px] font-bold border-2 border-slate-900 ring-0`}
                            >
                              {getInitials(p.name)}
                            </div>
                          ))}
                          {group.participants.length > 5 && (
                            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-[10px] font-bold border-2 border-slate-900">
                              +{group.participants.length - 5}
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {group.participants.length > 5
                            ? `${group.participants.length} members`
                            : group.participants.map((p) => p.name?.split(" ")[0]).join(", ")}
                        </span>
                      </div>
                    )}

                    {/* ── Card actions ──────────────────────────────── */}
                    <div className="flex gap-2 border-t border-slate-800/60 pt-4 mt-auto">
                      {/* Open chat */}
                      <button
                        onClick={() => {
                          localStorage.setItem("activeConversationId", group._id);
                          router.push("/home");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/20 transition-all duration-200"
                      >
                        <MdOutlineGroups2 className="text-sm" />
                        Open Chat
                      </button>

                      {/* Invite */}
                      <button
                        onClick={() => {
                          setInviteTargetGroup(group);
                          setInviteSearch("");
                          setInviteSuccess(null);
                        }}
                        title="Invite someone"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200"
                      >
                        <MdPersonAddAlt1 className="text-base" />
                        <span className="hidden sm:inline">Invite</span>
                      </button>

                      {/* Leave */}
                      <button
                        onClick={() => setLeaveTarget(group)}
                        title="Leave group"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-medium transition-all duration-200"
                      >
                        <FaArrowRightFromBracket className="text-sm" />
                        <span className="hidden sm:inline">Leave</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════
          CREATE GROUP MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-md">
                  <MdOutlineGroupAdd className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create a Group</h2>
                  <p className="text-xs text-slate-400">Give it a name and add members</p>
                </div>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setGroupName(""); setSelectedMembers([]); setMemberSearch(""); setCreateError(""); }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 custom-scrollbar">

              {/* Group name input */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => { setGroupName(e.target.value); setCreateError(""); }}
                  placeholder="e.g. Design Team, Weekend Plans…"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 text-sm"
                />
              </div>

              {/* Selected members chips */}
              {selectedMembers.length > 0 && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                    Selected ({selectedMembers.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((m) => (
                      <span
                        key={m._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                      >
                        {m.name}
                        <button
                          onClick={() => toggleMember(m)}
                          className="text-emerald-400/70 hover:text-emerald-200 transition-colors"
                        >
                          <MdClose className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Member search */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                  Add Members
                </label>
                <div className="relative mb-3">
                  <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 pl-9 pr-4 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 text-sm"
                  />
                </div>

                {/* User list */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 overflow-y-auto max-h-52 custom-scrollbar">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-slate-500 text-sm py-6">No users found.</p>
                  ) : (
                    <ul className="divide-y divide-slate-900">
                      {filteredUsers.map((u) => {
                        const selected = selectedMembers.some((m) => m._id === u._id);
                        return (
                          <li
                            key={u._id}
                            onClick={() => toggleMember(u)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                              selected
                                ? "bg-emerald-500/10"
                                : "hover:bg-slate-900/60"
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getGradient(u.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                              {getInitials(u.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                <FaRegEnvelope className="text-xs" /> {u.email}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              selected
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-slate-600"
                            }`}>
                              {selected && <MdCheck className="text-white text-xs" />}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Error */}
              {createError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                  {createError}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-800 shrink-0">
              <button
                onClick={() => { setShowCreateModal(false); setGroupName(""); setSelectedMembers([]); setMemberSearch(""); setCreateError(""); }}
                className="flex-1 py-2.5 rounded-2xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={creating}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-md shadow-emerald-950/20 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <><FaSpinner className="animate-spin" /> Creating…</>
                ) : (
                  <><MdOutlineGroupAdd className="text-base" /> Create Group</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          INVITE MEMBER MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {inviteTargetGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <MdPersonAddAlt1 className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Invite to Group</h2>
                  <p className="text-xs text-slate-400 truncate max-w-[160px]">
                    {inviteTargetGroup.groupName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setInviteTargetGroup(null); setInviteSearch(""); }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 pt-4 pb-2 shrink-0">
              <div className="relative">
                <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
                <input
                  type="text"
                  value={inviteSearch}
                  onChange={(e) => setInviteSearch(e.target.value)}
                  placeholder="Search users to invite…"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 pl-9 pr-4 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 text-sm"
                />
              </div>
            </div>

            {/* Already in group notice */}
            <p className="px-6 pb-2 text-xs text-slate-500">
              Showing users not yet in this group.
            </p>

            {/* User list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              {inviteFilteredUsers.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-10">
                  {inviteSearch
                    ? "No matching users found."
                    : "All contacts are already in this group."}
                </div>
              ) : (
                <ul className="divide-y divide-slate-800 rounded-2xl border border-slate-800 overflow-hidden">
                  {inviteFilteredUsers.map((u) => {
                    const isInviting = inviting === u._id;
                    const wasInvited = inviteSuccess === u._id;
                    return (
                      <li
                        key={u._id}
                        className="flex items-center gap-3 px-4 py-3 bg-slate-950/40 hover:bg-slate-900/60 transition-colors"
                      >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getGradient(u.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                        <button
                          onClick={() => handleInvite(u)}
                          disabled={isInviting || wasInvited}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                            wasInvited
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20"
                          } disabled:opacity-60`}
                        >
                          {isInviting ? (
                            <FaSpinner className="animate-spin text-xs" />
                          ) : wasInvited ? (
                            <><MdCheck className="text-sm" /> Added</>
                          ) : (
                            <><MdPersonAddAlt1 className="text-sm" /> Invite</>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          LEAVE GROUP CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {leaveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl p-6 flex flex-col gap-5">

            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <FaArrowRightFromBracket className="text-red-400 text-2xl" />
              </div>
            </div>

            {/* Text */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">Leave Group?</h2>
              <p className="text-slate-400 text-sm mt-2">
                You are about to leave{" "}
                <span className="text-white font-semibold">
                  {leaveTarget.groupName}
                </span>
                . You won't receive messages from this group anymore.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setLeaveTarget(null)}
                disabled={leaving}
                className="flex-1 py-2.5 rounded-2xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md shadow-red-950/30 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {leaving ? (
                  <><FaSpinner className="animate-spin text-xs" /> Leaving…</>
                ) : (
                  <><FaArrowRightFromBracket className="text-sm" /> Leave</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
