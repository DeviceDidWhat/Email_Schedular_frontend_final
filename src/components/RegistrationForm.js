import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Phone } from 'lucide-react';
import Toast from './Toast.tsx';
import Swal from 'sweetalert2';

const RegistrationForm = () => {
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        name: '',
        designation: '',
        phone_Number: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [showToast, setShowToast] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: name === 'phone_Number' ? parseInt(value) : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registration form submitted');
        console.log('User data:', userData);

        fetch('https://emailschedule.me:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        })
            .then((response) => {
                console.log('Response status:', response.status);
                return response.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        return text;
                    }
                });
            })
            .then((data) => {
                console.log('Response data:', data);
                if (typeof data === 'string') {
                    console.log('Message set:', data);
                    if (data.toLowerCase().includes('successfully')) {
                        Swal.fire({
                                                title: 'Registration Successfull!',
                                                text: "You will be able to Login once the Admin approved your request",
                                                icon: 'success',
                                                confirmButtonText: 'OK',
                                            }).then(() => {
                                                navigate('/login')
                                            });
                    }
                } else if (data && data.message) {
                    Swal.fire({
                        title: 'Registration Successfull!',
                        text: "You will be able to Login once the Admin approved your request",
                        icon: 'success',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        navigate('/login')
                    });
                }
            })
            .catch((error) => {
                console.error('Error during registration:', error);
                setMessage('Error registering user.');
            });
    };

    const handleSwitchToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEFAE0]">
            {showToast && (
                <Toast
                    message="You have registered successfully and will be able to login when the Admin approves your account."
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}
            <div className="relative bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-[1.02] border-2 border-[#CCD5AE]">
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 bg-[#CCD5AE] rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-12 h-12 text-[#FEFAE0]" />
                    </div>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 text-center mt-8 mb-8">Create Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CCD5AE] w-5 h-5" />
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={userData.username}
                                onChange={handleInputChange}
                                required
                                className="pl-10 w-full px-6 py-3 bg-[#FEFAE0] border border-[#CCD5AE] rounded-lg focus:ring-2 focus:ring-[#CCD5AE] focus:border-transparent transition-all duration-200"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CCD5AE] w-5 h-5" />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={userData.password}
                                onChange={handleInputChange}
                                required
                                className="pl-10 w-full px-6 py-3 bg-[#FEFAE0] border border-[#CCD5AE] rounded-lg focus:ring-2 focus:ring-[#CCD5AE] focus:border-transparent transition-all duration-200"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                            Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CCD5AE] w-5 h-5" />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={userData.name}
                                onChange={handleInputChange}
                                required
                                className="pl-10 w-full px-6 py-3 bg-[#FEFAE0] border border-[#CCD5AE] rounded-lg focus:ring-2 focus:ring-[#CCD5AE] focus:border-transparent transition-all duration-200"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="designation" className="block text-sm font-medium text-gray-600 mb-1">
                            Designation
                        </label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CCD5AE] w-5 h-5" />
                            <input
                                type="text"
                                id="designation"
                                name="designation"
                                value={userData.designation}
                                onChange={handleInputChange}
                                required
                                className="pl-10 w-full px-6 py-3 bg-[#FEFAE0] border border-[#CCD5AE] rounded-lg focus:ring-2 focus:ring-[#CCD5AE] focus:border-transparent transition-all duration-200"
                                placeholder="Enter your designation"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="phone_Number" className="block text-sm font-medium text-gray-600 mb-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CCD5AE] w-5 h-5" />
                            <input
                                type="number"
                                id="phone_Number"
                                name="phone_Number"
                                value={userData.phone_Number}
                                onChange={handleInputChange}
                                required
                                className="pl-10 w-full px-6 py-3 bg-[#FEFAE0] border border-[#CCD5AE] rounded-lg focus:ring-2 focus:ring-[#CCD5AE] focus:border-transparent transition-all duration-200"
                                placeholder="Enter your phone number"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-[#CCD5AE] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-1 hover:bg-opacity-90 mt-6"
                    >
                        Register
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center ${message.toLowerCase().includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <button 
                        onClick={handleSwitchToLogin}
                        className="text-[#CCD5AE] hover:text-opacity-80 font-medium transition-colors duration-200"
                    >
                        Login here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegistrationForm;