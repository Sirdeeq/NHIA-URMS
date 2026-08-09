import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function BackButton({ text = "Back", to }: { text?: string; to?: string | number }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to && typeof to === "string") {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span>{text}</span>
    </button>
  );
}

export default BackButton;
