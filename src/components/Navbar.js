import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <nav className="bg-[#ccd5ae] p-4 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-gray-800">
                    Email Scheduler
                </Link>
                
                <div className="flex space-x-4">
                    <Link 
                        to="/schedule" 
                        className="bg-[#fefae0] px-4 py-2 rounded-lg text-gray-800 hover:opacity-90 transition-opacity"
                    >
                        Schedule Mail
                    </Link>
                    
                    <Link 
                        to="/dashboard" 
                        className="bg-[#fefae0] px-4 py-2 rounded-lg text-gray-800 hover:opacity-90 transition-opacity"
                    >
                        Dashboard
                    </Link>
                    
                    <Link 
                        to="/register" 
                        className="bg-[#fefae0] px-4 py-2 rounded-lg text-gray-800 hover:opacity-90 transition-opacity"
                    >
                        Register
                    </Link>
                    
                    <button 
                        onClick={handleLogout}
                        className="bg-[#fefae0] px-4 py-2 rounded-lg text-gray-800 hover:opacity-90 transition-opacity"
                    >
                        Log out
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;