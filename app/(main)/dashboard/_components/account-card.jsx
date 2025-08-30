"use client";
import { updateDefaultAccount } from '@/actions/accounts';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react'
import { toast } from 'sonner';

const AccountCard = ({ account }) => {
    const { name, type, balance, id, isDefault } = account;
    const { loading: updateDefaultLoading, fn: updateDefaultFn, data: updateAccount, error: updateAccountError } = useFetch(updateDefaultAccount);
    const handleDefaultChange = async (event) => {
        event.preventDefault();
        if (isDefault) {
            toast.warning("You need at least 1 default account");
            return;
        }
        await updateDefaultFn(id);
    };

    useEffect(() => {
        if (updateAccount?.success) {
            toast.success("Default account updated successfully");
        }
    }, [updateAccount, updateDefaultLoading]);

    useEffect(() => {
        if (updateAccountError) {
            toast.error(updateAccountError.message || "Failed to update default account");
        }
    }, [updateAccountError]);

    return (
        <Card className="hover:shadow-md transition-shadow group relative">
            <Link href={`/account/${id}`}>
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
                    <Switch onClick={handleDefaultChange}
                        disabled={updateDefaultLoading} checked={isDefault} />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>
                        ${parseFloat(balance).toFixed(2)}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                        {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} Account
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <ArrowUpRight className='mr-1 h-4 w-4 text-green-500' />
                        Income
                    </div>
                    <div className="flex items-center">
                        <ArrowDownRight className='mr-1 h-4 w-4 text-red-500' />
                        Expense
                    </div>
                </CardFooter>
            </Link>
        </Card>
    )
}

export default AccountCard
