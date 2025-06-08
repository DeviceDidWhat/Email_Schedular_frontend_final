import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AdminPage = () => {
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpValidated, setIsOtpValidated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unapprovedUsers, setUnapprovedUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const SESSION_TIMEOUT_MINUTES = 30;
  const [timeRemaining, setTimeRemaining] = useState(SESSION_TIMEOUT_MINUTES * 60);

  // Theme colors - military green palette
  const colors = {
    primary: "#5d8c4e", // Lighter military green
    secondary: "#4a7040",
    dark: "#3a5a32",
    light: "#e9f0e6",
    accent: "#8cb369",
    error: "#d64545",
    success: "#2e7d32",
  };

  // Function to handle admin password validation
  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setErrorMessage("Please enter a valid authentication code");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post(
        "https://emailschedule.me:8080/api/admin/validate-password",
        null,
        { params: { password } }
      );

      if (response.status === 200) {
        setIsAuthenticated(true);
        Swal.fire({
          title: "Success",
          text: "Password validated. OTP has been sent!",
          icon: "success",
          confirmButtonColor: colors.primary
        });
      }
    } catch (error) {
      setErrorMessage("Invalid authentication code. Access denied.");
      Swal.fire({
        title: "Access Denied",
        text: "Invalid authentication code. Please try again.",
        icon: "error",
        confirmButtonColor: colors.primary
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      setErrorMessage("Please enter a valid security code");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post(
        "https://emailschedule.me:8080/api/admin/validate-otp",
        null,
        { params: { otp } }
      );

      if (response.status === 200) {
        setIsOtpValidated(true);
        fetchUnapprovedUsers(); // Fetch unapproved users after successful OTP validation
        Swal.fire({
          title: "Success",
          text: "OTP validated successfully!",
          icon: "success",
          confirmButtonColor: colors.primary
        });
      }
    } catch (error) {
      setErrorMessage("Invalid security code. Please try again.");
      Swal.fire({
        title: "Verification Failed",
        text: "Invalid security code. Access denied.",
        icon: "error",
        confirmButtonColor: colors.primary
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch unapproved users
  const fetchUnapprovedUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://emailschedule.me:8080/api/admin/unapproved-users",
        { params: { password } }
      );

      setUnapprovedUsers(response.data);
    } catch (error) {
      setErrorMessage(
        "Error fetching unapproved users. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to approve a user
  const handleApproveUser = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://emailschedule.me:8080/api/admin/approve",
        null,
        { params: { userId, password } }
      );

      if (response.status === 200) {
        // Refresh the user list after approval
        fetchUnapprovedUsers();
        Swal.fire({
          title: "Success",
          text: "User approved successfully.",
          icon: "success",
          confirmButtonColor: colors.primary
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error approving user. Please try again.",
        icon: "error",
        confirmButtonColor: colors.primary
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to deny a user
  const handleDenyUser = async (userId) => {
    Swal.fire({
      title: "Confirm Denial",
      text: "Are you sure you want to deny this user access?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.error,
      cancelButtonColor: colors.secondary,
      confirmButtonText: "Yes, deny access"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await axios.post(
            "https://emailschedule.me:8080/api/admin/deny",
            null,
            { params: { userId, password } }
          );
  
          if (response.status === 200) {
            // Refresh the user list after denial
            fetchUnapprovedUsers();
            Swal.fire({
              title: "Access Denied",
              text: "User has been denied access.",
              icon: "success",
              confirmButtonColor: colors.primary
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "Error processing request. Please try again.",
            icon: "error",
            confirmButtonColor: colors.primary
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Function to handle bulk approval
  const handleBulkApprove = () => {
    Swal.fire({
      title: "Bulk Approval",
      text: "Are you sure you want to approve all pending users?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: colors.success,
      cancelButtonColor: colors.secondary,
      confirmButtonText: "Yes, approve all"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await axios.post(
            "https://emailschedule.me:8080/api/admin/bulk-approve",
            null,
            { params: { password } }
          );
  
          if (response.status === 200) {
            fetchUnapprovedUsers();
            Swal.fire({
              title: "Success",
              text: "All users have been approved.",
              icon: "success",
              confirmButtonColor: colors.primary
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "Error processing bulk approval. Please try again.",
            icon: "error",
            confirmButtonColor: colors.primary
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Function to log out and reset the session
  const handleLogout = () => {
    Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to end your admin session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: colors.secondary,
      confirmButtonText: "Yes, log out"
    }).then((result) => {
      if (result.isConfirmed) {
        setIsAuthenticated(false);
        setIsOtpValidated(false);
        setPassword("");
        setOtp("");
        setUnapprovedUsers([]);
        setErrorMessage("");
        Swal.fire({
          title: "Logged Out",
          text: "Your admin session has been terminated successfully.",
          icon: "success",
          confirmButtonColor: colors.primary
        });
      }
    });
  };

  // Filter users based on search term
  const filteredUsers = unapprovedUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toString().includes(searchTerm)
  );

  // Session timeout countdown
  useEffect(() => {
    let intervalId;
    
    if (isOtpValidated) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            Swal.fire({
              title: "Session Expired",
              text: "Your session has timed out.",
              icon: "warning",
              confirmButtonColor: colors.primary,
              allowOutsideClick: false,
            }).then(() => {
              setIsAuthenticated(false);
              setIsOtpValidated(false);
              setPassword("");
              setOtp("");
              setUnapprovedUsers([]);
              setErrorMessage("");
            });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isOtpValidated]);
  
  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Reset session timeout
  const resetSessionTimeout = () => {
    setTimeRemaining(SESSION_TIMEOUT_MINUTES * 60);
  };

  // Automatically reset timeout on user interaction
  const handleUserActivity = () => {
    if (isOtpValidated) {
      resetSessionTimeout();
    }
  };

  // Add event listeners for user activity
  useEffect(() => {
    if (isOtpValidated) {
      // Add event listeners for user activity
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      
      events.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [isOtpValidated]);

  if (!isAuthenticated) {
    // Render the password prompt if not authenticated
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100" style={{backgroundColor: colors.light}}>
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border-t-4" style={{borderColor: colors.primary}}>
          <h2 className="mb-6 text-2xl font-bold text-center" style={{color: colors.dark}}>
            ADMIN ACCESS
          </h2>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
              {errorMessage}
            </div>
          )}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Authentication Code
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter secure code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
              style={{focusRingColor: colors.primary}}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePasswordSubmit();
              }}
            />
          </div>
          <button
            onClick={handlePasswordSubmit}
            disabled={loading}
            className="w-full px-4 py-3 text-white rounded-md hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200"
            style={{
              backgroundColor: loading ? colors.secondary : colors.primary,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AUTHENTICATING
              </div>
            ) : "AUTHENTICATE"}
          </button>
        </div>
      </div>
    );
  }

  if (!isOtpValidated) {
    // Render the OTP input
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100" style={{backgroundColor: colors.light}}>
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border-t-4" style={{borderColor: colors.primary}}>
          <h2 className="mb-6 text-2xl font-bold text-center" style={{color: colors.dark}}>
            SECURITY VERIFICATION
          </h2>
          <div className="mb-4 p-3 border-l-4 text-green-900" style={{backgroundColor: `${colors.light}`, borderColor: colors.primary}}>
            A one-time security code has been sent to your device.
          </div>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
              {errorMessage}
            </div>
          )}
          <div className="mb-6">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              One-Time Security Code
            </label>
            <input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
              style={{focusRingColor: colors.primary}}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleOtpSubmit();
              }}
            />
          </div>
          <button
            onClick={handleOtpSubmit}
            disabled={loading}
            className="w-full px-4 py-3 text-white rounded-md hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200"
            style={{
              backgroundColor: loading ? colors.secondary : colors.primary,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                VERIFYING
              </div>
            ) : "VERIFY"}
          </button>
        </div>
      </div>
    );
  }

  // Render the unapproved users and approve buttons
  return (
    <div className="min-h-screen" style={{backgroundColor: colors.light}}>
      <div className="text-white shadow-md" style={{backgroundColor: colors.dark}}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ADMIN COMMAND CENTER</h1>
            <p className="text-sm opacity-80">Secure access management portal</p>
          </div>
          <div className="flex items-center">
            <div className="mr-4 text-sm">
              <span className="font-medium">Session expires in:</span>{" "}
              <span className={`${timeRemaining < 60 ? 'text-red-300' : ''} font-mono`}>
                {formatTimeRemaining()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md text-white transition duration-200"
              style={{backgroundColor: colors.error}}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold" style={{color: colors.dark}}>
              User Authorization Management
            </h2>
            <p className="text-gray-600">
              Approve or deny pending user registration requests
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                style={{focusRingColor: colors.primary}}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={fetchUnapprovedUsers}
              className="px-4 py-2 text-white rounded-md flex items-center justify-center transition duration-200"
              style={{backgroundColor: colors.secondary}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            {unapprovedUsers.length > 1 && (
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 text-white rounded-md flex items-center justify-center transition duration-200"
                style={{backgroundColor: colors.success}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Approve All
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="p-4 text-white" style={{backgroundColor: colors.primary}}>
            <h3 className="text-xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Authorization Queue
            </h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                <svg className="animate-spin h-10 w-10" style={{color: colors.primary}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600">Loading user data...</p>
            </div>
          ) : unapprovedUsers.length === 0 ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{backgroundColor: `${colors.light}`}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{color: colors.primary}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">All users have been processed. No pending authorizations.</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{backgroundColor: `${colors.light}`}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{color: colors.primary}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-600">No users match your search criteria.</p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-sm px-4 py-2 rounded-md transition duration-200"
                style={{color: colors.primary}}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase font-semibold">
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-6">Username</th>
                    <th className="py-3 px-6">Registration Date</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-6">{user.id}</td>
                      <td className="py-4 px-6 font-medium">{user.username}</td>
                      <td className="py-4 px-6">{user.registrationDate || "Unknown"}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleApproveUser(user.id)}
                            className="px-3 py-1 text-white rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 flex items-center"
                            style={{backgroundColor: colors.success, focusRingColor: colors.success}}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => handleDenyUser(user.id)}
                            className="px-3 py-1 text-white rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 flex items-center"
                            style={{backgroundColor: colors.error, focusRingColor: colors.error}}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {unapprovedUsers.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
              <div>
                Showing {filteredUsers.length} of {unapprovedUsers.length} total users
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-sm px-3 py-1 rounded-md text-white transition duration-200"
                  style={{backgroundColor: colors.secondary}}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;