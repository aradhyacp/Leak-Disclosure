import { useAuth, useUser } from "@clerk/clerk-react";
import React, { useState } from "react";
import Swal from "sweetalert2";
import "./Upgrade.css";

const Upgrade = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const token = await getToken();
    if (!token) {
      setLoading(false);
      Swal.fire({
        title: "Session expired",
        icon: "error",
        text: "Your session has expired. Please login again.",
        footer: '<a href="/login">Go back to login</a>',
      });
      return;
    }

    try {
      const result = await fetch(
        "http://localhost:3000/api/stripe/stripe-checkout",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      if (!result.ok) throw new Error("Server error");
      const data = await result.json();

      if (!data.url) {
        Swal.fire({
          icon: "error",
          title: "Stripe Error",
          text: "Something went wrong from Stripe.",
          footer: "Please try again",
        });
        return;
      }

      window.location.replace(data.url);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        footer:
          '<a href="/dashboard">Why do I have this issue? Try again later.</a>',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex justify-center items-center bg-[#dceae3] px-4">
      <div className="w-full md:w-[70%] rounded-xl p-5 bg-[#1e231b] border border-[#1a2420] shadow-[0_0_40px_rgba(0,255,150,0.05)]">
        <div className="text-[#3dfc8f] font-bold text-3xl md:text-4xl drop-shadow-[0_0_10px_#3dfc8f70] break-words">
          Premium Security Access
        </div>

        <div className="text-gray-300 font-semibold text-xl md:text-2xl mt-2">
          Only $10/month
        </div>

        <div className="bg-[url('/pricing-holder.jpg')] bg-cover h-[400px] rounded-xl p-5 mt-9 border border-[#1a2420] shadow-[0_0_20px_rgba(0,255,150,0.05)] flex flex-col justify-center">
          <div className="rounded-xl px-5 md:px-8 py-8 md:py-10 bg-[#0a100ed5] border border-[#1a2420] backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:justify-between gap-6">
              <div className="text-gray-300">
                <div className="text-lg">
                  Upgrade to unlock premium features
                </div>
                <div className="mt-1">• Real-time monitoring</div>
                <div>• Unlimited breach scans</div>
                <div>• Priority processing</div>
              </div>

              <div className="border-2 py-3 px-6 md:px-8 rounded-xl border-[#3dfc8f] w-fit mx-auto md:mx-0 flex flex-col justify-center">
                <div className="text-gray-200">Billed Monthly</div>
                <div className="text-[#3dfc8f] font-semibold mx-auto">
                  $10/Month
                </div>
              </div>
            </div>

            <div className="border-b border-[#1f2b27] mt-4" />

            <div className="flex flex-col md:flex-row items-center mt-9 justify-evenly gap-4">
              <div className="text-gray-300 text-xl">Total:</div>

              <div>
                <div className="text-[#3dfc8f] text-xl font-semibold">
                  $10.00
                </div>
                <div className="text-gray-400 text-sm">No hidden fees.</div>
              </div>

              {loading ? (
                <button className="bg-[#3dfc8f] px-16 md:px-22 py-3 rounded-xl text-black w-fit loading shadow-[0_0_15px_#3dfc8f80]">
                  Processing...
                </button>
              ) : (
                <button
                  onClick={handleClick}
                  className="bg-[#3dfc8f] px-16 md:px-22 py-3 rounded-xl text-black font-semibold w-fit cursor-pointer hover:bg-[#33e67f] transition-all duration-200"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
