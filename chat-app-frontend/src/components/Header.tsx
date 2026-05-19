"use client";

import Image from "next/image";
import { BsChatQuote } from "react-icons/bs";
import { MdOutlineGroups2 } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import logo from "../logo/chat-we.png";
import { useRouter, usePathname } from "next/navigation";
import { RiContactsBookLine } from "react-icons/ri";

function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = [
    {
      name: "My chats",
      icon: BsChatQuote,
      path: "/home",
      activeColor: "group-hover:text-blue-400",
      activeBg: "bg-blue-500/10 text-blue-400 border-l-4 border-blue-500",
      ringColor: "focus:ring-blue-500/50",
    },
    {
      name: "Groups",
      icon: MdOutlineGroups2,
      path: "/groups",
      activeColor: "group-hover:text-emerald-400",
      activeBg: "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500",
      ringColor: "focus:ring-emerald-500/50",
    },
    {
      name: "Contacts",
      icon: RiContactsBookLine,
      path: "/contacts",
      activeColor: "group-hover:text-orange-400",
      activeBg: "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500",
      ringColor: "focus:ring-orange-500/50",
    },
    {
      name: "Profile",
      icon: FaRegUser,
      path: "/profile",
      activeColor: "group-hover:text-purple-400",
      activeBg: "bg-purple-500/10 text-purple-400 border-l-4 border-purple-500",
      ringColor: "focus:ring-purple-500/50",
    },
  ];

  return (
    <>
      <aside className="bg-slate-900 border-r border-slate-800 w-20 md:w-64 h-full flex flex-col justify-between text-white py-6 px-4 transition-all duration-300 shadow-2xl z-10 flex-shrink-0">
        <div className="flex flex-col items-center md:items-start">
          <div 
            onClick={() => router.push("/home")} 
            className="mb-10 flex items-center justify-center md:justify-start w-full md:px-2 cursor-pointer group"
          >
            <Image
              src={logo}
              alt="Chat We Logo"
              width={48}
              height={48}
              className="rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            <span className="hidden md:block ml-4 font-bold text-2xl self-center text-white tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Chat We
            </span>
          </div>
          
          <nav className="flex flex-col gap-3 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    // For groups, if there's no layout, let's fallback to /home or allow route push
                    router.push(item.path);
                  }}
                  className={`flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl transition-all duration-200 group w-full focus:outline-none focus:ring-2 ${item.ringColor} ${
                    active 
                      ? item.activeBg + " font-semibold text-white"
                      : "hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 border-l-4 border-transparent"
                  }`}
                >
                  <Icon className={`text-2xl transition-all group-hover:scale-110 ${
                    active ? "text-current" : "text-slate-400 " + item.activeColor
                  }`} />
                  <span className="hidden md:block font-medium transition-colors">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="w-full">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all duration-200 group w-full focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <IoLogOutOutline className="text-2xl group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:block font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Header;
