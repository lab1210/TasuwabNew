import React from "react";
import { IoIosClose } from "react-icons/io";

const Modal = ({ isOpen, onClose, title, children, description }) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/90 flex items-center justify-center z-[1000] overflow-y-auto">
      <div className="bg-white w-1/3 rounded-md  shadow-md relative ">
        <div className="flex justify-end border-0 cursor-pointer hover:text-red-500 text-[#333]">
          <IoIosClose size={40} onClick={onClose} />
        </div>
        <div className="p-5 overflow-y-auto">
          <div className="mb-5">
            <p className="text-2xl font-extrabold text-center">{title}</p>
            <p className="text-center text-sm text-[#3D873B]">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
