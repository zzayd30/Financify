// Example usage of the authentication handling pattern

"use client";

import { useEffect } from 'react';
import { useAuthAction } from '@/hooks/use-auth-action';
import { getUserAccounts } from '@/actions/dashboard';
import useFetch from '@/hooks/use-fetch';

export function ExampleComponent() {
    const { handleResponse } = useAuthAction();
    const { data: accountsData, fn: fetchAccounts, loading } = useFetch(getUserAccounts);

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (accountsData && !loading) {
            // Check if authentication failed and handle redirect
            if (!handleResponse(accountsData)) {
                return; // User will be redirected to sign-in
            }

            // Process successful response
            if (accountsData.success) {
                const accounts = accountsData.data;
                console.log('Accounts loaded:', accounts);
            }
        }
    }, [accountsData, loading, handleResponse]);

    return (
        <div>
            {loading ? 'Loading...' : 'Accounts loaded'}
        </div>
    );
}