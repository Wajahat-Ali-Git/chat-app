"use client";
import { useEffect } from "react";
import axios from "axios";
import { FaRegUser } from "react-icons/fa6";
import Header from "../../src/components/Header";

function Profile() {
  const token = localStorage.getItem("token");
  const fetchuserData = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = res.data;
      console.log(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    fetchuserData();
  }, []);
  const userStr = localStorage.getItem("user");
  const userData = userStr ? JSON.parse(userStr) : null;

  return (
    <>
      <div className="absolute right-0 h-full">
        <Header />
      </div>

      <div className="flex  w-[88%] h-[100vh] justify-center items-center bg-gray-800">
        <div className="flex flex-col w-[40%] justify-center items-center gap-4 h-[50%] border-3 border-black hover:transition-all hover:scale-102  bg-white rounded-2xl hover:border-blue-500/80">
          <span className="border-3 rounded-full p-5 border-gray-900 hover:border-blue-500/50">
            <FaRegUser className="text-[100px] text-gray-900 group-hover:text-purple-400 group-hover:scale-110 transition-all " />
          </span>
          <h1 className="text-2xl font-bold text-black hover:text-blue-500/50">
            {userData.name}
          </h1>
          <p className="text-2xl  text-gray-600 hover:text-blue-500/50">
            {userData.email}
          </p>
        </div>
      </div>
    </>
  );
}
export default Profile;
