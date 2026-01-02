import { useState, useEffect } from 'react';
import useAxios from './useAxios.js';

const CheckUserRole = () => {
    const [userData, setUserData] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [error, setError] = useState(null);
    const Axios = useAxios();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoadingUser(true);
                setError(null);
                
                const response = await Axios.get('/admin/verify-token', {
                    withCredentials: true
                });
                console.log('User data response:', response.data);
                setUserData(response.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err);
                setUserData(null);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, []);

    return [userData, loadingUser, error];
};

export default CheckUserRole;