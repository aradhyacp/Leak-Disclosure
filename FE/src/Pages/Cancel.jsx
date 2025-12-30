import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Cancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      icon: "error",
      title: "Payment Cancelled",
      text: "Your payment process was cancelled. No charges were made to your account.",
      confirmButtonText: "Return to Home",
      showCancelButton: true,
      cancelButtonText: "Try Again",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "rounded-2xl p-6 shadow-xl",
        title: "text-2xl font-bold",
        confirmButton:
          "bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold ml-3",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold",
      },
    }).then((result) => {
      if (result.isConfirmed || result.dismiss) {
        navigate("/");
      }
    });
  }, [navigate]);

  return null;
};

export default Cancel;
