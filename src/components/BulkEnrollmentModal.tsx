// components/BulkEnrollmentModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { X, Upload, FileText } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

interface BulkEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

interface StudentData {
  studentName: string;
  studentPhone: string;
}

export default function BulkEnrollmentModal({ isOpen, onClose, courseId, courseTitle }: BulkEnrollmentModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "processing">("upload");

  const bulkEnrollMutation = useMutation({
    mutationFn: async (data: { courseId: string; courseTitle: string; students: StudentData[] }) => {
      const response = await axios.post("/api/admin/enrollments/bulk", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.successCount}명의 수강생이 등록되었습니다.`);
      if (data.failedCount > 0) {
        toast.error(`${data.failedCount}명의 수강생 등록에 실패했습니다.`);
      }
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "수강생 일괄 등록에 실패했습니다.");
      setStep("preview");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // 엑셀 파일 분석
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // 첫 번째 시트 가져오기
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // JSON 으로 변환
        const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet);

        // 데이터 유효성 검사 및 변환
        const validStudents = jsonData
          .filter((row) => row["이름"] && row["전화번호"])
          .map((row) => ({
            studentName: row["이름"]?.toString().trim() || "",
            studentPhone: row["전화번호"]?.toString().trim() || "",
          }))
          .filter((student) => student.studentName && student.studentPhone);

        if (validStudents.length === 0) {
          toast.error('유효한 수강생 데이터가 없습니다. 파일에 "이름"과 "전화번호" 열이 있는지 확인해주세요.');
          setFile(null);
          return;
        }

        setStudents(validStudents);
        setStep("preview");
        toast.success(`${validStudents.length}명의 수강생 데이터를 불러왔습니다.`);
      } catch (error) {
        console.error("엑셀 파일 처리 오류:", error);
        toast.error("엑셀 파일 처리 중 오류가 발생했습니다.");
        setFile(null);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (students.length === 0) {
      toast.error("등록할 수강생이 없습니다.");
      return;
    }

    setStep("processing");
    bulkEnrollMutation.mutate({
      courseId,
      courseTitle,
      students,
    });
  };

  const handleClose = () => {
    setFile(null);
    setStudents([]);
    setStep("upload");
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">수강생 일괄 등록</h2>
          <button onClick={handleClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700">강좌: {courseTitle}</h3>
        </div>

        {step === "upload" && (
          <div className="mb-6">
            <div className="mb-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-sm text-gray-600">수강생 정보가 담긴 Excel 파일을 업로드해주세요.</p>
              <p className="mb-4 text-xs text-gray-500">파일에는 반드시 '이름'과 '전화번호' 열이 포함되어야 합니다.</p>
              <input type="file" id="excelFile" accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} />
              <label
                htmlFor="excelFile"
                className="inline-flex cursor-pointer items-center rounded bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600">
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </label>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="mb-6">
            <h4 className="mb-2 font-medium">등록 예정 수강생 목록 ({students.length}명)</h4>
            <div className="mb-4 max-h-60 overflow-y-auto rounded border border-gray-300">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">전화번호</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {students.map((student, index) => (
                    <tr key={index}>
                      <td className="px-6 py-2 text-sm whitespace-nowrap text-gray-500">{index + 1}</td>
                      <td className="px-6 py-2 text-sm whitespace-nowrap">{student.studentName}</td>
                      <td className="px-6 py-2 text-sm whitespace-nowrap">{student.studentPhone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="mb-6 flex flex-col items-center justify-center p-8">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
            <p>수강생 등록 중... 잠시만 기다려주세요.</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={step === "processing"}>
            취소
          </button>

          {step === "preview" && (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600">
              일괄 등록
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
