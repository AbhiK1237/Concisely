import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define the user type
interface User {
    _id: string;
    name: string;
    email: string;
    preferences: {
        topics: string[];
        deliveryFrequency: string;
        summaryLength: string;
        maxItemsPerNewsletter: number;
    };
}

// Define the auth context type
interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    setUser: (user: User) => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = 'http://localhost:5001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);

            // Set the default Authorization header for all requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }

        setIsLoading(false);
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            const { token: newToken, ...userData } = response.data;

            // Save to state
            setUser(userData);
            setToken(newToken);

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', newToken);

            // Set the default Authorization header for all requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to login. Please check your credentials.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Signup function
    const signup = async (name: string, email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.post(`${API_URL}/auth/register`, {
                name,
                email,
                password,
            });

            const { token: newToken, ...userData } = response.data;

            // Save to state
            setUser(userData);
            setToken(newToken);

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', newToken);

            // Set the default Authorization header for all requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create account. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        // Clear state
        setUser(null);
        setToken(null);

        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        // Clear Authorization header
        delete axios.defaults.headers.common['Authorization'];
    };

    const setUserData = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
        error,
        setUser: setUserData,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
