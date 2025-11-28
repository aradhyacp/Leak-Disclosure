import React, { useState } from "react";
import { useTheme } from '../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Details = ({ canSearch, userPlan, searchCount, onSearch }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!canSearch) {
      setError(
        "You have reached your search limit. Upgrade to Pro for unlimited searches."
      );
      return;
    }

    if (!email) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError("");
    setDetails(null);

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:1337";
      const response = await fetch(`${API_BASE_URL}/api/detailed-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      // Debug: Log the industries data structure
      console.log('API Response - Industries:', data.industries);
      console.log('API Response - Full Data:', data);

      if (data.message && data.message.includes("No detailed breaches")) {
        setDetails({
          email,
          found: false,
          message: data.message,
        });
      } else if (
        data.message &&
        data.message.includes("Detailed breaches found")
      ) {
        setDetails({
          email,
          found: true,
          ...data,
        });
      } else {
        setDetails({
          email,
          found: false,
          message: data.message || "No detailed breaches found",
        });
      }

      onSearch();
    } catch (err) {
      setError("Failed to fetch details. Please try again.");
      console.error("Details error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityInfo = (riskScore) => {
    if (!riskScore)
      return {
        color: "gray",
        label: "Unknown",
        textColor: isDark ? "text-gray-400" : "text-gray-600",
        bgColor: isDark ? "bg-gray-800" : "bg-gray-100",
        borderColor: isDark ? "text-gray-300" : "text-gray-800",
      };
    const score = parseFloat(riskScore);
    if (score >= 7)
      return {
        color: "red",
        label: "High",
        textColor: "text-red-500",
        bgColor: isDark ? "bg-red-900/30" : "bg-red-100",
        borderColor: isDark ? "text-red-400" : "text-red-800",
      };
    if (score >= 4)
      return {
        color: "orange",
        label: "Medium",
        textColor: "text-orange-500",
        bgColor: isDark ? "bg-orange-900/30" : "bg-orange-100",
        borderColor: isDark ? "text-orange-400" : "text-orange-800",
      };
    return {
      color: "yellow",
      label: "Low",
      textColor: "text-yellow-500",
      bgColor: isDark ? "bg-yellow-900/30" : "bg-yellow-100",
      borderColor: isDark ? "text-yellow-400" : "text-yellow-800",
    };
  };

  // Prepare year-wise data for chart
  const getYearWiseChartData = () => {
    if (!details?.yearwiseBreaches) return [];
    
    // Handle both array and object formats
    let yearwiseData = details.yearwiseBreaches;
    if (Array.isArray(yearwiseData) && yearwiseData.length > 0) {
      yearwiseData = yearwiseData[0];
    }
    
    if (typeof yearwiseData === 'object' && yearwiseData !== null) {
      return Object.entries(yearwiseData).map(([year, count]) => ({
        year,
        breaches: count,
      })).sort((a, b) => a.year.localeCompare(b.year));
    }
    return [];
  };

  // Prepare industry data for horizontal bar chart
  const getIndustryChartData = () => {
    if (!details?.industries) return [];
    
    let industryData = details.industries;
    
    // If it's a number (total count), return empty array as we need industry breakdown
    if (typeof industryData === 'number') {
      console.warn('Industries data is a number (total count), not an object. Cannot display industry breakdown.');
      return [];
    }
    
    // If it's an array, get the first element
    if (Array.isArray(industryData)) {
      if (industryData.length === 0) return [];
      industryData = industryData[0];
      
      // If first element is still an array, get its first element
      if (Array.isArray(industryData) && industryData.length > 0) {
        industryData = industryData[0];
      }
    }
    
    // Now industryData should be an object with industry names as keys and counts as values
    if (typeof industryData === 'object' && industryData !== null && !Array.isArray(industryData)) {
      // Filter out any non-numeric values and ensure we have industry name and count
      const entries = Object.entries(industryData);
      const chartData = entries
        .filter(([key, value]) => {
          // Ensure value is a number and key is a valid industry name
          // Exclude keys that look like totals or metadata
          const isValidKey = key && key.trim() !== '' && 
                            !key.toLowerCase().includes('total') && 
                            !key.toLowerCase().includes('count') &&
                            !key.toLowerCase().includes('sum');
          return typeof value === 'number' && value > 0 && isValidKey;
        })
        .map(([industry, count]) => ({
          industry: industry.trim(),
          breaches: Number(count), // Ensure it's a number
        }))
        .sort((a, b) => b.breaches - a.breaches);
      
      // Log for debugging
      if (chartData.length === 0) {
        console.warn('No valid industry data found. Raw data:', industryData);
      }
      
      return chartData;
    }
    
    console.warn('Industries data format not recognized:', typeof industryData, industryData);
    return [];
  };

  // Get risk score - handle different data structures
  const getRiskScore = () => {
    if (!details?.riskScore) return null;
    
    // If it's an array
    if (Array.isArray(details.riskScore) && details.riskScore.length > 0) {
      return details.riskScore[0]?.risk_score || details.riskScore[0];
    }
    
    // If it's a number or string
    if (typeof details.riskScore === 'number' || typeof details.riskScore === 'string') {
      return details.riskScore;
    }
    
    return null;
  };

  const riskScore = getRiskScore();
  const yearWiseData = getYearWiseChartData();
  const industryData = getIndustryChartData();

  return (
    <div className="max-w-6xl">
      <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Breach Details</h2>
      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Get detailed information about where your email was leaked, when it
        happened, severity, and breach type.
      </p>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className={`flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-colors border ${
              isDark 
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !canSearch}
            className="px-6 py-3 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Fetching..." : "Get Details"}
          </button>
        </div>
      </form>

      {!canSearch && userPlan === "free" && (
        <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-yellow-900/20 border-yellow-800/50' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={isDark ? 'text-yellow-300' : 'text-yellow-800'}>
            You've used all 10 free searches. <strong>Upgrade to Pro</strong>{" "}
            for unlimited searches.
          </p>
        </div>
      )}

      {error && (
        <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'}`}>
          <p className={isDark ? 'text-red-300' : 'text-red-800'}>{error}</p>
        </div>
      )}

      {details && (
        <div className="space-y-6">
          {details.found ? (
            <>
              {/* Risk Score and Summary */}
              <div className={`p-6 rounded-lg border shadow-sm ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Risk Assessment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Risk Score</p>
                    <div className="flex items-center gap-3">
                      {riskScore !== null ? (() => {
                        const severityInfo = getSeverityInfo(riskScore);
                        return (
                          <>
                            <span className={`text-3xl font-bold ${severityInfo.textColor}`}>
                              {riskScore || "N/A"}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityInfo.bgColor} ${severityInfo.borderColor} border ${isDark ? 'border-[#2a2a2a]' : ''}`}>
                              {severityInfo.label} Risk
                            </span>
                          </>
                        );
                      })() : (
                        <span className={`text-3xl font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          N/A
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {details?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Year-wise Breaches - Bar Chart */}
              {yearWiseData.length > 0 && (
                <div className={`p-6 rounded-lg border shadow-sm ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Breaches by Year
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={yearWiseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#2a2a2a" : "#e5e5e5"} />
                      <XAxis 
                        dataKey="year" 
                        stroke={isDark ? "#a0a0a0" : "#666666"}
                        tick={{ fill: isDark ? "#a0a0a0" : "#666666" }}
                      />
                      <YAxis 
                        stroke={isDark ? "#a0a0a0" : "#666666"}
                        tick={{ fill: isDark ? "#a0a0a0" : "#666666" }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                          border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
                          color: isDark ? "#ffffff" : "#000000",
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: isDark ? "#ffffff" : "#000000" }}
                      />
                      <Bar dataKey="breaches" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Exposed Breaches Details */}
              {details.ExposedBreaches &&
                details.ExposedBreaches.length > 0 && (
                  <div className={`p-6 rounded-lg border shadow-sm ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Exposed Breaches
                    </h3>
                    <div className="space-y-4">
                      {details.ExposedBreaches.map((breach, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${isDark ? 'border-[#2a2a2a] bg-[#0a0a0a]' : 'border-gray-200 bg-gray-50'}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {breach.name || breach.domain || "Unknown Breach"}
                            </h4>
                            {breach.year && (
                              <span className={`px-2 py-1 rounded text-sm ${isDark ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                {breach.year}
                              </span>
                            )}
                          </div>
                          {breach.description && (
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {breach.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {breach.type && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30' : 'bg-blue-100 text-blue-800'}`}>
                                Type: {breach.type}
                              </span>
                            )}
                            {breach.severity &&
                              (() => {
                                const severityInfo = getSeverityInfo(
                                  breach.severity
                                );
                                return (
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${severityInfo.bgColor} ${severityInfo.borderColor} border ${isDark ? 'border-[#2a2a2a]' : ''}`}
                                  >
                                    Severity: {breach.severity}
                                  </span>
                                );
                              })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Industry Distribution - Horizontal Bar Chart */}
              {industryData.length > 0 && (
                <div className={`p-6 rounded-lg border shadow-sm ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Industries Affected
                  </h3>
                  <ResponsiveContainer width="100%" height={Math.max(300, industryData.length * 50)}>
                    <BarChart 
                      data={industryData} 
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#2a2a2a" : "#e5e5e5"} />
                      <XAxis 
                        type="number"
                        stroke={isDark ? "#a0a0a0" : "#666666"}
                        tick={{ fill: isDark ? "#a0a0a0" : "#666666" }}
                      />
                      <YAxis 
                        dataKey="industry" 
                        type="category"
                        width={90}
                        stroke={isDark ? "#a0a0a0" : "#666666"}
                        tick={{ fill: isDark ? "#a0a0a0" : "#666666" }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                          border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
                          color: isDark ? "#ffffff" : "#000000",
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: isDark ? "#ffffff" : "#000000" }}
                      />
                      <Bar dataKey="breaches" fill="#10b981" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Password Strength */}
              {details.passwords_strength?.map((passwordStrength, idx) => (
                <div key={idx} className={`p-6 rounded-lg border shadow-sm ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Password Strength Analysis
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(passwordStrength).map(
                      ([strength, count]) => (
                        <div
                          key={strength}
                          className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}
                        >
                          <span className={`capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {strength}
                          </span>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {count}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}

              {/* Breaches Summary */}
              {details.BreachesSummary && (
                <div className={`p-6 rounded-lg border shadow-sm ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Summary
                  </h3>
                  <div className="prose max-w-none">
                    <pre className={`whitespace-pre-wrap text-sm p-4 rounded ${isDark ? 'bg-[#0a0a0a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                      {JSON.stringify(details.BreachesSummary, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={`rounded-lg border p-6 ${isDark ? 'bg-green-900/20 border-green-800/50' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl text-[#10b981]">✓</span>
                <div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-green-300' : 'text-green-900'}`}>
                    No Detailed Breaches Found
                  </h3>
                  <p className={isDark ? 'text-green-300' : 'text-green-800'}>{details.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Details;
