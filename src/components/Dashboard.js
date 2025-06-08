import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    totalFailed: 0,
    totalScheduled: 0,
    sentToday: 0,
    sentYesterday: 0,
    failedToday: 0,
    failedYesterday: 0,
    scheduledToday: 0,
    scheduledYesterday: 0
  });

  const [emailStats, setEmailStats] = useState({
    labels: ['Yesterday', 'Today'],
    datasets: [],
  });

  const [combinedEmails, setCombinedEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    action: '', // 'reschedule', 'followup'
    emailId: null,
    emailType: '', // 'Invitation', 'FollowUp'
    recipient: '',
    company: '',
    scheduledTime: new Date().toISOString().slice(0, 16) // Default to current time in ISO format
  });

  // New state variables for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [filteredEmails, setFilteredEmails] = useState([]);

  // Fetch dashboard data from backend API with authentication
  useEffect(() => {
    fetchDashboardData();

    // Set up interval to refresh data every 5 minutes
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Effect to filter emails based on search query and selected company
  useEffect(() => {
    let results = combinedEmails;

    // Filter by recipient search query
    if (searchQuery.trim() !== '') {
      results = results.filter(email =>
        email.recipient.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected company
    if (selectedCompany) {
      results = results.filter(email =>
        email.company === selectedCompany
      );
    }

    setFilteredEmails(results);
  }, [searchQuery, selectedCompany, combinedEmails]);

  // Chart options for customization
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Email Activity (Yesterday vs Today)',
      },
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw} emails`;
          },
        },
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Period',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Emails',
        },
        min: 0,
      },
    },
  };

  const chartData = {
    labels: emailStats.labels,
    datasets: emailStats.datasets,
  };

  // Function to format datetime for display
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to determine status badge color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to handle company filter change
  const handleCompanyFilterChange = (e) => {
    setSelectedCompany(e.target.value);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCompany('');
  };

  // Open modal for rescheduling or sending follow-up
  const openModal = (action, email) => {
    setModalData({
      action,
      emailId: email.id,
      emailType: email.type,
      recipient: email.recipient,
      company: email.company,
      status: email.status, // Make sure to include the status
      scheduledTime: new Date().toISOString().slice(0, 16)
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Handle form submission for modal actions
const handleModalSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('authToken');
  const username = localStorage.getItem('username');
  
  try {
    let endpoint;
    let method = 'POST';
    
    // Log the current modalData to help debug
    console.log("Submitting modal with data:", modalData);
    
    if (modalData.action === 'reschedule') {
      if (modalData.emailType === 'Invitation' && modalData.status === 'FAILED') {
        endpoint = `https://emailschedule.me:8080/api/invitation/failed/${modalData.emailId}/reschedule`;
      } else if (modalData.emailType === 'FollowUp' && modalData.status === 'FAILED') {
        endpoint = `https://emailschedule.me:8080/api/followup/failed/${modalData.emailId}/reschedule`;
      }
    } else if (modalData.action === 'followup') {
      if (modalData.emailType === 'Invitation' && modalData.status === 'SENT') {
        endpoint = `https://emailschedule.me:8080/api/invitation/sent/${modalData.emailId}/follow-up`;
      } else if (modalData.emailType === 'FollowUp' && modalData.status === 'SENT') {
        endpoint = `https://emailschedule.me:8080/api/followup/sent/${modalData.emailId}/resend`;
      }
    }
    
    // Check if endpoint is defined
    if (!endpoint) {
      throw new Error(`Invalid action or email combination: ${modalData.action} for ${modalData.emailType} with status ${modalData.status}`);
    }
    
    console.log("Using endpoint:", endpoint);
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'username': username
      },
      body: JSON.stringify({
        scheduledTime: modalData.scheduledTime
      })
    });
    
    // Handle response in a safer way
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${modalData.action} email`);
      } else {
        const errorText = await response.text();
        console.error("Server returned non-JSON response:", errorText);
        throw new Error(`Server error (${response.status}): Please check server logs for details`);
      }
    }
    
    // Try to parse successful response
    let successData;
    try {
      successData = await response.json();
    } catch (err) {
      // If not JSON, get the text
      successData = { message: await response.text() };
    }
    
    // Show success message
    alert(`Success: ${successData.message || 'Operation completed successfully'}`);
    
    // Close modal and refresh data
    setShowModal(false);
    fetchDashboardData();
    
  } catch (err) {
    console.error(`Error ${modalData.action} email:`, err);
    alert(`Error: ${err.message}`);
  }
};

  // Handle email deletion
  const handleDeleteEmail = async (email) => {
    if (!window.confirm('Are you sure you want to delete this email?')) return;
    
    const token = localStorage.getItem('authToken');
    
    try {
      let endpoint;
      
      if (email.type === 'Invitation') {
        if (email.status === 'FAILED') {
          endpoint = `https://emailschedule.me:8080/api/invitation/failed/${email.id}`;
        } else if (email.status === 'PENDING') {
          endpoint = `https://emailschedule.me:8080/api/invitation/scheduled/${email.id}`;
        }
      } else if (email.type === 'FollowUp') {
        if (email.status === 'FAILED') {
          endpoint = `https://emailschedule.me:8080/api/followup/failed/${email.id}`;
        } else if (email.status === 'PENDING') {
          endpoint = `https://emailschedule.me:8080/api/followup/scheduled/${email.id}`;
        }
      }
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete email');
      }
      
      // Refresh data after deletion
      fetchDashboardData();
      
    } catch (err) {
      console.error('Error deleting email:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Dynamically render action buttons based on email type and status
const renderActionButtons = (email) => {
  const { type, status} = email;
  
  // For debugging
  console.log("Rendering buttons for email:", email);
  
  // Invitation - Sent - Send followup mail
  if (type === 'Invitation' && status === 'SENT') {
    return (
      <button
        onClick={() => openModal('followup', email)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs mr-2"
      >
        Send Follow-up
      </button>
    );
  }
  
  // Invitation - Failed - Delete and Reschedule
  if (type === 'Invitation' && status === 'FAILED') {
    return (
      <>
        <button
          onClick={() => handleDeleteEmail(email)}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs mr-2"
        >
          Delete
        </button>
        <button
          onClick={() => openModal('reschedule', email)}
          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
        >
          Reschedule
        </button>
      </>
    );
  }
    
    // Invitation - Scheduled - Delete
    if (type === 'Invitation' && status === 'PENDING') {
      return (
        <button
          onClick={() => handleDeleteEmail(email)}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
        >
          Delete
        </button>
      );
    }
    
    // FollowUp - Sent - Send another follow-up
    if (type === 'FollowUp' && status === 'SENT') {
      return (
        <button
          onClick={() => openModal('followup', email)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
        >
          Send Another Follow-up
        </button>
      );
    }
    
    // FollowUp - Failed - Delete and Reschedule
    if (type === 'FollowUp' && status === 'FAILED') {
      return (
        <>
          <button
            onClick={() => handleDeleteEmail(email)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs mr-2"
          >
            Delete
          </button>
          <button
            onClick={() => openModal('reschedule', email)}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
          >
            Reschedule
          </button>
        </>
      );
    }
    
    // FollowUp - Scheduled - Delete
    if (type === 'FollowUp' && status === 'PENDING') {
      return (
        <button
          onClick={() => handleDeleteEmail(email)}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
        >
          Delete
        </button>
      );
    }
    
    return null;
  };

  // Function to fetch updated dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get the token and username from localStorage
      const token = localStorage.getItem('authToken');
      const username = localStorage.getItem('username');

      if (!token) {
        console.error('No token found. Redirecting to login...');
        window.location.href = '/login';
        return;
      }

      // Fetch dashboard summary from backend with authentication
      const response = await fetch('https://emailschedule.me:8080/api/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'username': username
        }
      });

      if (response.status === 401 || response.status === 403) {
        console.error('Unauthorized: Invalid or expired token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update stats with fetched data
      setStats({
        totalSent: data.totalSent || 0,
        totalFailed: data.totalFailed || 0,
        totalScheduled: data.totalScheduled || 0,
        sentToday: data.sentToday || 0,
        sentYesterday: data.sentYesterday || 0,
        failedToday: data.failedToday || 0,
        failedYesterday: data.failedYesterday || 0,
        scheduledToday: data.scheduledToday || 0,
        scheduledYesterday: data.scheduledYesterday || 0
      });

      // Update chart data
      setEmailStats({
        labels: ['Yesterday', 'Today'],
        datasets: [
          {
            label: 'Emails Sent',
            data: [data.sentYesterday || 0, data.sentToday || 0],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.1,
          },
          {
            label: 'Emails Failed',
            data: [data.failedYesterday || 0, data.failedToday || 0],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.1,
          },
          {
            label: 'Emails Scheduled',
            data: [data.scheduledYesterday || 0, data.scheduledToday || 0],
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            fill: true,
            tension: 0.1,
          }
        ]
      });

      // Set the combined emails list
      if (data.combinedEmails) {
        setCombinedEmails(data.combinedEmails);
        setFilteredEmails(data.combinedEmails);

        // Extract unique companies for the filter dropdown
        const uniqueCompanies = [...new Set(data.combinedEmails
          .map(email => email.company)
          .filter(company => company && company !== 'N/A'))];

        setCompanies(uniqueCompanies.sort());
      }

    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f5]">
        <div className="text-xl font-semibold text-gray-700">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f5]">
        <div className="text-xl font-semibold text-red-600">Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#a6b084] px-6 py-4">
            <h1 className="text-3xl font-bold text-black text-center">Email Dashboard</h1>
          </div>
          
          {/* Stats Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 px-4 py-2">
                  <p className="text-lg font-medium text-white">Total Sent</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-700">{stats.totalSent}</p>
                  <div className="flex justify-between mt-3 text-sm text-green-800">
                    <span>Yesterday: {stats.sentYesterday}</span>
                    <span>Today: {stats.sentToday}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md overflow-hidden">
                <div className="bg-red-600 px-4 py-2">
                  <p className="text-lg font-medium text-white">Total Failed</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">{stats.totalFailed}</p>
                  <div className="flex justify-between mt-3 text-sm text-red-800">
                    <span>Yesterday: {stats.failedYesterday}</span>
                    <span>Today: {stats.failedToday}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-md overflow-hidden">
                <div className="bg-amber-600 px-4 py-2">
                  <p className="text-lg font-medium text-white">Total Scheduled</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-3xl font-bold text-amber-700">{stats.totalScheduled}</p>
                  <div className="flex justify-between mt-3 text-sm text-amber-800">
                    <span>Yesterday: {stats.scheduledYesterday}</span>
                    <span>Today: {stats.scheduledToday}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
            </svg>
            Email Activity Trends
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Line data={chartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins?.legend,
                  position: 'top',
                  labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    font: {
                      size: 12
                    }
                  }
                }
              },
              elements: {
                line: {
                  tension: 0.4
                }
              }
            }} />
          </div>
        </div>
        
        {/* Emails List Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-2xl font-semibold text-white flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              All Emails
            </h2>
          </div>
          
          <div className="p-6">
            {/* Search and Filter Controls */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                  </div>
                  <input
                    type="search"
                    className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by recipient..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                
                {/* Company Filter */}
                <div>
                  <select
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={selectedCompany}
                    onChange={handleCompanyFilterChange}
                  >
                    <option value="">All Companies</option>
                    {companies.map((company, index) => (
                      <option key={index} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
                
                {/* Clear Filters Button */}
                <div className="flex justify-center md:justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 transition duration-300 ease-in-out flex items-center"
                    disabled={!searchQuery && !selectedCompany}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Showing {filteredEmails.length} of {combinedEmails.length} emails
            </div>
            
            {/* Emails Table */}
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmails.length > 0 ? (
                    filteredEmails.map((email, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                          {email.recipient}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(email.scheduledTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {email.company || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(email.status)}`}>
                            {email.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {email.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            {renderActionButtons(email)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p>No emails found matching your filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal for rescheduling or sending follow-up */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                {modalData.action === 'reschedule' ? 'Reschedule Email' : 'Send Follow-up Email'}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleModalSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">{modalData.recipient}</div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">{modalData.company || 'N/A'}</div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalData.action === 'reschedule' ? 'Reschedule Time' : 'Follow-up Time'}
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={modalData.scheduledTime}
                    onChange={(e) => setModalData({...modalData, scheduledTime: e.target.value})}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-5 py-2.5 rounded-lg transition duration-300 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition duration-300 ease-in-out flex items-center"
                  >
                    {modalData.action === 'reschedule' ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Reschedule
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                        Send Follow-up
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  export default Dashboard;