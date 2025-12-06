import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      icon: 'success',
      title: 'Payment Successful!',
      text: 'Thank you for your subscription. Your payment has been processed successfully.',
      confirmButtonText: 'Return to Home',
      customClass: {
        popup: 'rounded-2xl p-6 shadow-xl',
        title: 'text-2xl font-bold',
        confirmButton: 'bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold border-none outline-none focus:outline-none',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed || result.dismiss) {
        navigate('/');
      }
    });
  }, [navigate]);

  return null;
};

export default Success;
