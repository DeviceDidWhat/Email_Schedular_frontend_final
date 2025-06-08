import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import followup from "../resources/follwup.png";
import invitation from "../resources/schedule.png";

const ScheduleEmailForm = () => {
  const [emailData, setEmailData] = useState({
    recipient: "",
    scheduledTime: "",
    company: "",
    name: "",
    phone_Number: "",
    rank: "",
    salutation: "",
    nirfYear: "",
    designation: "",
    year: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

  const handleImageClick = (src) => {
    setModalImage(src);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalImage("");
  };
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [excelFile, setExcelFile] = useState(null); // State to store the uploaded file
  const [toggle, setToggle] = useState(false); // State for toggle position (false: /schedule, true: /followupschedule)
  const navigate = useNavigate(); // For navigation to login page

  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem("authToken");
    console.log("Token:", token); // Add this line to check the token value

    fetch("https://emailschedule.me:8080/api/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Include token in the Authorization header
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 401) {
        console.error("Unauthorized: Invalid or expired token");
        window.location.href = "/login"; // Redirect to login if the token is invalid/expired
        return;
      }
      if (response.status === 403) {
        console.error("Unauthorized: Invalid or expired token");
        window.location.href = "/login"; // Redirect to login if the token is invalid/expired
        return;
      }
      return response.json();
    });

    if (!token) {
      // If no token is found, redirect to login page
      navigate("/login");
      return; // Ensure that we stop the effect here
    }

    // Check token validity (optional: you can decode the token to check expiry date here)
    const isTokenValid = validateToken(token);
    if (!isTokenValid) {
      // If token is invalid or expired, redirect to login page
      navigate("/login");
    }
  }, [navigate]); // Adding navigate to dependency array to avoid issues

  // Token validation method (decoding or other validation)
  const validateToken = (token) => {
    try {
      // Decode and validate JWT token (use jwt-decode or similar library)
      const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT token
      const expiryDate = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      if (currentTime > expiryDate) {
        localStorage.removeItem("authToken"); // Remove expired token
        return false;
      }

      return currentTime < expiryDate; // Check if token is still valid
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("authToken"); // Remove invalid token
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "year") {
      // Check if the value matches YYYY-YY format
      const isValidFormat = /^\d{4}-\d{2}$/.test(value);
      
      // You can show/hide an error message or change the input's style
      if (value && !isValidFormat) {
        e.target.setCustomValidity("Please use YYYY-YY format (Example: 2024-25)");
      } else {
        e.target.setCustomValidity("");
      }
    }
    
    setEmailData({
      ...emailData,
      [name]: value
    });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]); // Save the file to the state
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Determine endpoint based on toggle state
    const endpoint = toggle ? "/followupschedule" : "/schedule";

    // Construct the payload
    const updatedEmailData = {
      recipient: emailData.recipient,
      scheduledTime: emailData.scheduledTime,
      company: emailData.company,
      name: emailData.name,
      phone_Number: emailData.phone_Number,
      rank: emailData.rank,
      salutation: emailData.salutation,
      nirfYear: emailData.nirfYear,
      designation: emailData.designation,
      year: emailData.year,
    };

    console.log("Payload being sent:", updatedEmailData);
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("authToken");
    fetch(`https://emailschedule.me:8080/api/emails${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Username: storedUsername,
      },
      body: JSON.stringify(updatedEmailData),
    })
      .then((response) => {
        if (response.status === 401) {
          console.error("Unauthorized: Invalid or expired token");
          window.location.href = "/login"; // Redirect to login if the token is invalid/expired
          return;
        }
        if (response.status === 403) {
          console.error("Unauthorized: Invalid or expired token");
          window.location.href = "/login"; // Redirect to login if the token is invalid/expired
          return;
        }
        if (!response.ok) {
          // Try to parse the error message from the backend
          return response.json().then((errorData) => {
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.message) {
          // Show success popup
          Swal.fire({
            title: "Success!",
            text: data.message,
            icon: "success",
            confirmButtonText: "OK",
          });
        } else {
          // Show error popup for unknown errors
          Swal.fire({
            title: "Error!",
            text: "Unknown error occurred.",
            icon: "error",
            confirmButtonText: "Try Again",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Show error popup for catch block
        Swal.fire({
          title: "Error!",
          text: error.message || "Error scheduling email.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  // Handle bulk email scheduling (using uploaded Excel file)
  const handleBulkSubmit = (e) => {
    e.preventDefault();

    // Determine endpoint based on toggle state
    const endpoint = toggle ? "/followupschedule" : "/schedule";

    if (!excelFile) {
      setMessage("Please upload an Excel file.");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("authToken");
    fetch(`https://emailschedule.me:8080/api/emails${endpoint}/bulk`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Username: storedUsername,
      },
      body: formData,
    })
      .then((response) => {
        if (response.status === 401) {
          console.error("Unauthorized: Invalid or expired token");
          window.location.href = "/login"; // Redirect to login if the token is invalid/expired
          return;
        }
        if (response.status === 403) {
          console.error("Unauthorized: Invalid or expired token");
          window.location.href = "/login"; // Redirect to login if the token is invalid/expired
          return;
        }
        if (!response.ok) {
          // Handle error
          return response.json().then((errorData) => {
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        // Show success popup for bulk email scheduling
        Swal.fire({
          title: "Success!",
          text: "Bulk emails scheduled successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        // Show error popup for any scheduling issues
        Swal.fire({
          title: "Error!",
          text: error.message || "Error scheduling bulk emails.",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      });
  };

  return (
    <>
      {/* //Div Number 1 */}
      <div className="min-h-screen bg-[#fefae0] flex items-center justify-center py-10">
        <div className="bg-[#ccd5ae] p-10 rounded-lg shadow-xl w-full max-w-2xl">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Schedule Email
          </h1>

          {/* Toggle Switch */}
          {/* Toggle Switch */}
          {/* Toggle Switch and Button Container */}
          {/* Toggle Switch */}
          {/* Toggle Switch and Button Container */}
          <div className="flex flex-col items-center mt-10">
            {/* Toggle Switch */}
            <div className="flex items-center mb-6">
              <span className="mr-3 text-[#8b9177] font-medium">
                Invitation
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={toggle}
                  onChange={() => setToggle(!toggle)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#8b9177] rounded-full peer peer-focus:ring-4 peer-focus:ring-[#8b9177] peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-[#8b9177] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b9177]"></div>
              </label>
              <span className="ml-3 text-[#8b9177] font-medium">Follow-Up</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Recipient (separate emails by commas)
              </label>
              <input
                type="text"
                name="recipient"
                value={emailData.recipient}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccd5ae] bg-[#fefae0]"
              />
            </div>

            {/* Scheduled Time */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Scheduled Time
              </label>
              <input
                type="datetime-local"
                name="scheduledTime"
                value={emailData.scheduledTime}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccd5ae] bg-[#fefae0]"
              />
            </div>

            {/* Additional Fields */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={emailData.company}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccd5ae] bg-[#fefae0]"
              />
            </div>

            {!toggle && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Rank
                </label>
                <input
                  type="number"
                  name="rank"
                  value={emailData.rank}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b9177] bg-[#fefae0]"
                />
              </div>
            )}

            {/* Salutation */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Salutation
              </label>
              <input
                type="text"
                name="salutation"
                value={emailData.salutation}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccd5ae] bg-[#fefae0]"
              />
            </div>

            {!toggle && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  NIRF Year
                </label>
                <input
                  type="number"
                  name="nirfYear"
                  value={emailData.nirfYear}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccd5ae] bg-[#fefae0]"
                />
              </div>
            )}

            {/* Year */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Year
              </label>
              <input
                type="text"
                name="year"
                value={emailData.year}
                onChange={handleInputChange}
                pattern="^\d{4}-\d{2}$"
                placeholder="YYYY-YY"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccd5ae] bg-[#fefae0]"
              />
              <small className="text-gray-500">Format: YYYY-YY (Example: 2024-25)</small>
            </div>

            {/* Send Button */}
            <div className="text-center mt-6">
              <button
                type="submit"
                className="px-2 py-2 bg-[#8b9177] text-white font-medium rounded-lg hover:bg-[#6f7c5a] transition focus:ring-4 focus:ring-[#ccd5ae] focus:outline-none"
              >
                Schedule
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* //Div Number 2 */}

      <div className="min-h-screen bg-[#fefae0] flex items-center justify-center py-10">
        <div className="bg-[#ccd5ae] p-10 rounded-lg shadow-xl w-full mr-80 ml-80">
          {/* Bulk Email Section */}
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Schedule Email in Bulk
            </h2>
            {toggle ? (
              <img
                src={followup} // Adjust the path
                alt="Bulk email follow-up"
                className="w-full mb-4 cursor-pointer"
                onClick={() => handleImageClick(followup)}
              />
            ) : (
              <img
                src={invitation} // Adjust the path
                alt="Bulk email scheduling"
                className="w-full mb-4 cursor-pointer"
                onClick={() => handleImageClick(invitation)}
              />
            )}

            {/* Modal */}
            {isModalOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                onClick={handleCloseModal} // Close modal on background click
              >
                <div className="relative">
                  {/* Image */}
                  <img
                    src={modalImage}
                    alt="Modal"
                    className="max-w-full max-h-screen"
                  />
                  {/* Close Button */}
                  <button
                    onClick={handleCloseModal}
                    className="absolute top-2 right-2 text-white text-lg bg-black bg-opacity-50 rounded-full px-2 py-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            <div className="mt-8 text-center">
              {/* File Upload Section */}
              <label className="flex flex-col items-center w-full p-6 bg-[#fefae0] border-2 border-dashed border-[#ccd5ae] rounded-lg cursor-pointer hover:bg-[#e9e5cc] transition-all">
                <div className="flex flex-col items-center">
                  {/* Upload Icon */}
                  <svg
                    className="w-10 h-10 mb-3 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Drop your Excel file here
                  </p>
                  <span className="text-xs text-gray-500">
                    .xlsx or .xls files only
                  </span>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".xlsx,.xls"
                />
              </label>

              {/* Submit Button */}
              <button
                onClick={handleBulkSubmit}
                className="mt-4 px-2 py-2 bg-[#8b9177] text-white font-medium rounded-lg hover:bg-[#6f7c5a] transition focus:ring-4 focus:ring-[#ccd5ae] focus:outline-none"
              >
                Schedule Bulk Email
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 text-lg font-semibold text-center ${messageType === "success" ? "text-green-600" : "text-red-600"
                }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ScheduleEmailForm;
