// components/ListeningModal.tsx (확장된 버전)
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";
import { ReactNode } from "react";

interface ListeningModalProps {
  isOpen: boolean;
  onCancel: () => void;
  title?: string;
  message?: string;
  cancelButtonText?: string;
  icon?: ReactNode;
  customIconAnimation?: any;
}

export default function ListeningModal({
  isOpen,
  onCancel,
  title = "음성 인식 중입니다.",
  message = "말씀해 주세요!",
  cancelButtonText = "말하기 취소",
  icon = <FaMicrophone className="text-3xl text-red-600" />,
  customIconAnimation = { scale: [1, 1.3, 1] },
}: ListeningModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="listening-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center rounded-xl bg-white/80 px-8 py-6 shadow-lg">
            <div className="mb-4 text-lg font-semibold text-gray-800">{title}</div>

            {/* 마이크 애니메이션 */}
            <motion.div
              animate={customIconAnimation}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="rounded-full bg-red-200 p-4 shadow-inner">
              {icon}
            </motion.div>

            <p className="text-md mt-4 text-gray-600">{message}</p>
          </motion.div>

          {/* 말하기 취소 버튼 - 하단부 배치 */}
          <motion.button
            onClick={onCancel}
            className="fixed bottom-10 mx-auto mt-8 flex items-center justify-center gap-2 rounded-full bg-white/80 px-6 py-3 font-medium shadow-lg"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ delay: 0.2 }}>
            <MdOutlineCancel size={24} className="text-red-500" />
            <span>{cancelButtonText}</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
