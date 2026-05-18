"use client";

import Image from "next/image";
import { BsChatQuote } from "react-icons/bs";
import { MdOutlineGroups2 } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import logo from "../../src/logo/chat-we.png";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect } from "react";

function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      <aside className="bg-gray-900 w-20 md:w-64 h-full flex flex-col justify-between text-white py-6 px-4 transition-all duration-300 shadow-2xl z-10 flex-shrink-0">
        <div className="flex flex-col items-center md:items-start">
          <div className="mb-10 flex items-center justify-center md:justify-start w-full md:px-2">
            <Image
              src={logo}
              alt="Chat We Logo"
              width={48}
              height={48}
              className="rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            />
            <span className="hidden md:block ml-4 font-bold text-2xl self-center text-white tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Chat We
            </span>
          </div>
          <nav className="flex flex-col gap-3 w-full">
            <button className="flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 group w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <BsChatQuote className="text-2xl text-gray-400 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
              <span className="hidden md:block font-medium text-gray-300 group-hover:text-white transition-colors">
                My chats
              </span>
            </button>
            <button className="flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 group w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <MdOutlineGroups2 className="text-2xl text-gray-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all" />
              <span className="hidden md:block font-medium text-gray-300 group-hover:text-white transition-colors">
                Groups
              </span>
            </button>
            <button
              onClick={() => {
                router.push("/profile");
              }}
              className="flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 group w-full focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <FaRegUser className="text-2xl text-gray-400 group-hover:text-white group-hover:scale-110 transition-all" />
              <span className="hidden md:block font-medium text-gray-300 group-hover:text-white transition-colors">
                Profile
              </span>
            </button>
          </nav>
        </div>

        <div className="w-full">
          <button
            onClick={() => {
              handleLogout();
            }}
            className="flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all duration-200 group w-full focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
