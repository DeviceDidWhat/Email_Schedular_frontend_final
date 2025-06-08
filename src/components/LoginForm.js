import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

const LoginForm = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [message] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('https://emailschedule.me:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === 'Login successful!') {
                    Swal.fire({
                        title: 'Success!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        localStorage.setItem('authToken', data.token);
                        localStorage.setItem('username', credentials.username);
                        navigate('/schedule')
                        if (onLogin) {
                            onLogin(data.token, credentials.username);
                            navigate('/schedule')
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: data.message || 'Login failed!',
                        icon: 'error',
                        confirmButtonText: 'Try Again',
                    });
                }
            })
            .catch((error) => {
                console.error('Error during fetch:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Error logging in. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEFAE0]">
            <div className="relative bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-[1.02] border-2 border-[#CCD5AE]">
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 bg-[#CCD5AE] rounded-full flex items-center justify-center shadow-lg">
                        <Lock className="w-12 h-12 text-[#FEFAE0]" />
                    </div>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 text-center mt-8 mb-8">Welcome Back</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                value={credentials.username}
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
                                value={credentials.password}
                                onChange={handleInputChange}
                                required
                                className="pl-10 w-full px-6 py-3 bg-[#FEFAE0] border border-[#CCD5AE] rounded-lg focus:ring-2 focus:ring-[#CCD5AE] focus:border-transparent transition-all duration-200"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-[#CCD5AE] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-1 hover:bg-opacity-90"
                    >
                        Sign In
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <a href="/register" className="text-[#CCD5AE] hover:text-opacity-80 font-medium transition-colors duration-200">
                        Register here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;