import { useAuth, useUser } from "@clerk/clerk-react";
import React from "react";
import { useState } from "react";
import Swal from "sweetalert2";
import "./Upgrade.css"

const Upgrade = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const token = await getToken();
    if (!token) {
        setLoading(false)
      Swal.fire({
        title: "Session expired",
        icon: "error",
        text: "Your user session as been expired. PLease login again",
        footer: '<a href="/login">Go back to to login</a>',
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
          body: JSON.stringify({
            custEmail: user?.primaryEmailAddress?.emailAddress,
            priceId: "price_1SZW4KGVzqmVv3a2mZJ7rWZl",
          }),
          method: "POST",
        }
      );
      if (!result.ok) {
  throw new Error("Server error")
}

      const data = await result.json();
      if (!data.url) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! from stripe end",
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
          '<a href="/dashboard">Why do I have this issue? PLease try again later</a>',
      });
    } finally{
        setLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-[#e9ece7] min-w-screen flex justify-center items-center">
      <div className="bg-white w-[70%] rounded-md p-5">
        <div className="font-bold text-4xl">Win-WIn Pricing</div>
        <div className="font-semibold text-2xl mt-2">Just 10$ per Month</div>

        <div className="bg-[url('/pricing-holder.jpg')] bg-cover h-[400px] rounded-xl p-5 flex flex-col justify-center mt-9">
          <div className="bg-[#ffffffd2] rounded-xl px-8 py-10">
            <div className="flex justify-between">
              <div className="text-gray-700">
                <div className="">Honest Pricing for Honest result</div>
                <div className="">
                  Experience the full power of our platform—risk-free.
                </div>
                <div className="">
                  Unlock premium features that boost Security
                </div>
              </div>
              <div className="border-2 w-fit py-3 border-blue-700 rounded-xl px-8">
                <div className="">Billed Monthly</div>
                <div className="">$10/Month</div>
              </div>
            </div>
            <div className="border-1 border-gray-300 mt-4"></div>
            <div className="flex items-center mt-9 justify-evenly">
              <div className="">Total: </div>
              <div className="">
                <div className="text-blue-600 text-xl">$10.00/Month</div>
                <div className="">Transparent, predictable pricing.</div>
              </div>
              {loading?<button
                className="bg-blue-700 px-22 py-3 rounded-xl text-white w-fit loading">
                Processing....
              </button>:<button
                className="bg-blue-700 px-22 py-3 rounded-xl text-white w-fit cursor-pointer hover:bg-blue-600"
                onClick={handleClick}
              >
                Buy Now
              </button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
