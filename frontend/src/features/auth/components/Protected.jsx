import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'
import LoadingSpinner from '../../../components/LoadingSpinner';

const Protected = ({ children }) => {
    const { loading, user } = useAuth()


    if (loading) {
        return <LoadingSpinner label="Authenticating your session" />
    }

    if (!user) {
        return <Navigate to={'/login'} />
    }

    return children
}

export default Protected