import React from "react";
import { RiCloseLargeFill } from "react-icons/ri";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-400/10 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <button className="absolute top-4 right-4 text-gray-600 hover:text-gray-900" onClick={onClose}>
          <RiCloseLargeFill size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
