import React from "react";
import { IoIosClose } from "react-icons/io";

const ApprovalModal = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  supplier,
  amount,
  client,
  reply,
  handleConfirmation,
}) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/90 bg-opacity-50 flex items-center justify-center z-[1000] ">
      <div className="bg-white w-1/3 rounded-3xl shadow-md relative ">
        <div className="p-5 overflow-y-auto">
          <div
            className={`${
              title === "Approval" ? "bg-green-50" : "bg-red-50"
            }  rounded-full w-18 h-18 flex items-center justify-center`}
          >
            <div
              className={`${
                title === "Approval" ? "bg-green-100" : "bg-red-100"
              } rounded-full w-12 h-12 flex items-center justify-center`}
            >
              <div
                className={`${
                  title === "Approval" ? "bg-green-500" : "bg-red-500"
                }  rounded-full w-6 h-6 flex items-center justify-center`}
              >
                {icon}
              </div>
            </div>
          </div>
          <div>
            <p className="font-extrabold text-lg mt-3">{title} Confirmation</p>
          </div>
          <div>
            <p className="mt-2 text-sm text-gray-500 leading-5">
              Are you sure you want to {description} the payment of{" "}
              <span className="text-gray-800 font-bold text-base">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(amount)}
              </span>
              {""} to {supplier} on behalf of {""} {client}?
            </p>
          </div>
          <div className="mt-5 flex items-center justify-end gap-12">
            <button
              onClick={onClose}
              className="text-gray-800 border cursor-pointer border-gray-800 rounded-lg p-2 px-3 hover:bg-gray-800 hover:text-white"
            >
              cancel
            </button>
            <button
              onClick={() => {
                reply("confirm");
                handleConfirmation();
              }}
              className={`text-white border cursor-pointer ${
                title === "Approval"
                  ? "border-green-800 bg-green-800"
                  : "border-red-800 bg-red-800 "
              } rounded-lg p-2 px-3 hover:opacity-90 `}
            >
              confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
