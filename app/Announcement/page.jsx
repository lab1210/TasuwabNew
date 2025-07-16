"use client";
import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import announcementService from "@/Services/announcementService";
import { toast } from "react-hot-toast";
import Table from "../Settings/Configuration/Table";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import formatDate from "../components/formatdate";

const Announce = () => {
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const tableRef = useRef(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    content: "",
    expirationDate: "",
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await announcementService.getAnnouncements();
        setAnnouncements(Array.isArray(response) ? response : []);
      } catch (err) {
        toast.error("Failed to fetch Announcements");
        console.error(err);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearForm = () => {
    setFormData({
      id: "",
      title: "",
      content: "",
      expirationDate: "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const expirationDate = new Date(formData.expirationDate);

    if (expirationDate <= now) {
      toast.error("Expiration must be in the future");
      return;
    }
    if (!formData.title || !formData.content || !formData.expirationDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        content: formData.content,
        expirationDate: formData.expirationDate,
      };

      if (isEditing) {
        await announcementService.updateAnnouncement(formData.id, payload);
        toast.success("Announcement updated successfully");
      } else {
        await announcementService.createAnnouncement(payload); // Fixed method name
        toast.success("Announcement added successfully");
      }

      const updatedAnnouncements = await announcementService.getAnnouncements();
      setAnnouncements(updatedAnnouncements);
      clearForm();
      // Scroll to table after successful operation
      if (tableRef.current) {
        tableRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    } catch (err) {
      console.error("Failed to process Announcement", err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (announcement) => {
    const formatForInput = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    const now = new Date();
    const announcementDate = new Date(announcement.expirationDate);
    const formattedDate =
      announcementDate <= now
        ? formatForInput(new Date(now.getTime() + 3600000)) // Default to 1 hour from now
        : formatForInput(announcement.expirationDate);

    setFormData({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      expirationDate: formattedDate,
    });
    setIsEditing(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Announcement?")) {
      return;
    }

    try {
      setDeletingId(id);
      await announcementService.deleteAnnouncement(id);
      toast.success("Announcement deleted successfully");
      const refreshedAnnouncements =
        await announcementService.getAnnouncements();
      setAnnouncements(refreshedAnnouncements);
    } catch (err) {
      console.error("Failed to delete Announcement", err);
      toast.error(err.response?.data?.message || "Delete operation failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex flex-col mb-4">
          <p className="font-extrabold text-[#333] text-2xl ">
            {isEditing ? "Edit Announcements" : "Send Announcements"}
          </p>
          <p className="text-sm text-gray-600">
            View all announcements and add new ones here.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col  gap-3 ">
          <div className="flex flex-col gap-2 w-full ">
            <div>
              <input
                type="datetime-local"
                min={new Date().toISOString().split("T")[0]}
                name="expirationDate"
                className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] focus:border-2 outline-0 placeholder:text-sm text-sm"
                value={formData.expirationDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <input
              name="title"
              className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] focus:border-2 outline-0 placeholder:text-sm text-sm"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="content"
              className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] focus:border-2 outline-0 placeholder:text-sm text-sm"
              value={formData.content}
              placeholder="Type content here..."
              onChange={handleInputChange}
              required
              rows={10}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="bg-[#3D873B] text-white p-2 pl-5 pr-5 hover:bg-green-600 cursor-pointer rounded-md"
              disabled={loading}
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Sending..."
                : isEditing
                ? "Update"
                : "Send"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={clearForm}
                className="bg-gray-500 text-white p-2 pl-5 pr-5 hover:bg-gray-600 cursor-pointer rounded-md"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div ref={tableRef}>
          <Table
            headers={[
              "Title",
              "Content",
              "Expiration Date",
              "Post Date",
              "Updated Date",
              "",
            ]}
            rows={announcements.map((dt) => [
              dt.title,
              dt.content,
              formatDate(dt.expirationDate),
              formatDate(dt.createdAt),
              formatDate(dt.updatedAt),
              <MdModeEditOutline
                key={dt.id}
                size={22}
                className="hover:text-gray-500 cursor-pointer"
                onClick={() => handleEditClick(dt)}
              />,
              <button
                key={`delete-${dt.id}`}
                disabled={deletingId === dt.id}
                onClick={() => handleDelete(dt.id)}
              >
                <FaTrash
                  size={20}
                  className={`${
                    deletingId === dt.code
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-500 hover:text-red-600 cursor-pointer"
                  }`}
                />
              </button>,
            ])}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Announce;
