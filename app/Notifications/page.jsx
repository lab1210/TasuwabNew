"use client";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { FiBell, FiClock } from "react-icons/fi";
import announcementService from "@/Services/announcementService";
import { toast } from "react-hot-toast";

const Notify = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await announcementService.getActiveAnnouncements();
        setAnnouncements(Array.isArray(response) ? response : []);
      } catch (err) {
        toast.error("Failed to fetch announcements");
        console.error(err);
      }
    };

    fetchAnnouncement();
  }, []);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <Layout>
      <div className=" mx-auto px-4 py-8">
        {/* Header with theme colors */}
        {/* <div className="flex items-center mb-8">
          <div className="bg-[#3D873B] p-2 rounded-lg mr-4">
            <FiBell className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#333]">Announcements</h1>
        </div> */}

        {/* Announcements list */}
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#3D873B] transition-colors duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-[#333]">
                    {announcement.title}
                  </h2>
                  <span className="flex items-center text-sm text-[#3D873B] bg-[#3D873B]/10 px-2 py-1 rounded-full">
                    <FiClock className="mr-1" />
                    {formatRelativeTime(announcement.createdAt)}
                  </span>
                </div>

                <p className="text-[#333] mb-4">{announcement.content}</p>

                <div className="text-xs text-gray-500">
                  Posted on: {new Date(announcement.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {announcements.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="bg-[#3D873B]/10 p-4 rounded-full inline-block mb-4">
              <FiBell className="text-4xl text-[#3D873B] mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-[#333]">
              No announcements yet
            </h3>
            <p className="text-gray-500 mt-1">Check back later for updates</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notify;
