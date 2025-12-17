import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "@clerk/clerk-react";
import { SearchSkeleton, ResultSkeleton } from "./LoadingSkeleton";
import { animated, useSpring } from "@react-spring/web";
import Swal from "sweetalert2";

const SearchMail = ({ canSearch, userPlan, searchCount, onSearch }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { getToken } = useAuth();

  // Animation for result appearance
  const resultAnimation = useSpring({
    opacity: result ? 1 : 0,
    transform: result ? "translateY(0px)" : "translateY(20px)",
    config: { tension: 300, friction: 30 },
  });

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!canSearch) {
      setError(
        "You have reached your search limit. Upgrade to Pro for unlimited searches.",
      );
      return;
    }

    if (!email) {
      setError("Please enter an email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const message = "Please enter a valid email address";
      setError(message);
      Swal.fire({
        title: "Invalid Email",
        text: message,
        icon: "error",
      });
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = await getToken();
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:1337";
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.message && data.breachedBoolean === "false") {
        setResult({
          email,
          isLeaked: false,
          message: data.message,
        });
      } else if (
        data.breaches &&
        data.breaches.length > 0 &&
        data.breachedBoolean
      ) {
        setResult({
          email,
          isLeaked: true,
          message: data.message,
          breaches: data.breaches,
        });
      } else {
        setResult({
          email,
          isLeaked: false,
          message: data.message || "No breaches found",
        });
      }

      onSearch();
    } catch (err) {
      const message =
        "Failed to search. Please check your connection and try again.";
      Swal.fire({
        title: "Network Error",
        text: message,
        icon: "error",
      });
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <h2
        className={`text-3xl font-bold mb-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Search Mail
      </h2>
      <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        Check if an email address has been leaked in any data breaches. Get
        instant results.
      </p>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter email address (e.g., example@email.com)"
              className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all ${
                isDark
                  ? "bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } border ${error ? "border-red-500" : ""}`}
              disabled={loading}
              aria-label="Email address input"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "email-error" : undefined}
            />
            {error && (
              <p
                id="email-error"
                className={`mt-2 text-sm ${
                  isDark ? "text-red-400" : "text-red-600"
                }`}
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !canSearch}
            className="px-6 py-3 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 min-w-[120px] justify-center"
            aria-label={loading ? "Searching..." : "Search email"}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Searching...</span>
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {loading && <SearchSkeleton />}

      {!canSearch && userPlan === "free" && !loading && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            isDark
              ? "bg-yellow-900/20 border-yellow-800/50"
              : "bg-yellow-50 border-yellow-200"
          }`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className={isDark ? "text-yellow-300" : "text-yellow-800"}>
              You've used all 10 free searches. <strong>Upgrade to Pro</strong>{" "}
              for unlimited searches.
            </p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            isDark
              ? "bg-red-900/20 border-red-800/50"
              : "bg-red-50 border-red-200"
          }`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className={isDark ? "text-red-300" : "text-red-800"}>{error}</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <animated.div style={resultAnimation}>
          <div
            className={`p-6 rounded-lg border-2 transition-all ${
              result.isLeaked
                ? isDark
                  ? "bg-red-900/20 border-red-800/50"
                  : "bg-red-50 border-red-200"
                : isDark
                  ? "bg-green-900/20 border-green-800/50"
                  : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`text-3xl flex-shrink-0 ${
                  result.isLeaked ? "text-red-500" : "text-[#10b981]"
                }`}
              >
                {result.isLeaked ? "⚠️" : "✓"}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    result.isLeaked
                      ? isDark
                        ? "text-red-300"
                        : "text-red-900"
                      : isDark
                        ? "text-green-300"
                        : "text-green-900"
                  }`}
                >
                  {result.isLeaked ? "Email Leaked" : "Email Safe"}
                </h3>
                <p
                  className={`mb-2 ${
                    result.isLeaked
                      ? isDark
                        ? "text-red-300"
                        : "text-red-800"
                      : isDark
                        ? "text-green-300"
                        : "text-green-800"
                  }`}
                >
                  <strong>Email:</strong> {result.email}
                </p>
                <p
                  className={
                    result.isLeaked
                      ? isDark
                        ? "text-red-300"
                        : "text-red-800"
                      : isDark
                        ? "text-green-300"
                        : "text-green-800"
                  }
                >
                  {result.message}
                </p>
                {result.isLeaked && result.breaches && (
                  <div className="mt-4">
                    <p
                      className={`font-semibold mb-2 ${
                        result.isLeaked
                          ? isDark
                            ? "text-red-300"
                            : "text-red-900"
                          : ""
                      }`}
                    >
                      Found in {result.breaches?.[0]?.length || 0} breach(es)
                    </p>
                    <ul
                      className={`list-disc list-inside space-y-1 ${
                        result.isLeaked
                          ? isDark
                            ? "text-red-300"
                            : "text-red-800"
                          : ""
                      }`}
                    >
                      {result.breaches?.[0]?.map((breach, index) => (
                        <li key={index}>{breach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </animated.div>
      )}
    </div>
  );
};

export default SearchMail;
