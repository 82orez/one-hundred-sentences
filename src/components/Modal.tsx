import React from "react";
import { RiCloseLargeFill } from "react-icons/ri";

type ModalProps = {
  isOpen: boolean;
  children: React.ReactNode;
};

const Modal = ({ isOpen, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 mt-10 flex items-center justify-center bg-gray-400/10 backdrop-blur-xs">
      <div className="relative flex w-full max-w-[360px] justify-center rounded-lg bg-white p-6 shadow-lg">{children}</div>
    </div>
  );
};

export default Modal;
