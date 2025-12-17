import React from "react";
import { useTheme } from "../context/ThemeContext";

export const SearchSkeleton = () => {
  const { isDark } = useTheme();
  return (
    <div className="max-w-4xl animate-pulse">
      <div
        className={`h-8 w-48 rounded mb-6 ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
      ></div>
      <div
        className={`h-4 w-96 rounded mb-6 ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
      ></div>
      <div className="flex gap-4 mb-6">
        <div
          className={`flex-1 h-12 rounded ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
        ></div>
        <div
          className={`w-32 h-12 rounded ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
        ></div>
      </div>
    </div>
  );
};

export const ResultSkeleton = () => {
  const { isDark } = useTheme();
  return (
    <div
      className={`p-6 rounded-lg border-2 animate-pulse ${isDark ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-gray-50 border-gray-200"}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
        ></div>
        <div className="flex-1 space-y-3">
          <div
            className={`h-6 w-32 rounded ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
          ></div>
          <div
            className={`h-4 w-64 rounded ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
          ></div>
          <div
            className={`h-4 w-48 rounded ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  const { isDark } = useTheme();
  return (
    <div
      className={`p-6 rounded-lg border shadow-sm animate-pulse ${isDark ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-white border-gray-200"}`}
    >
      <div
        className={`h-6 w-48 rounded mb-4 ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
      ></div>
      <div
        className={`h-64 rounded ${isDark ? "bg-[#2a2a2a]" : "bg-gray-200"}`}
      ></div>
    </div>
  );
};
