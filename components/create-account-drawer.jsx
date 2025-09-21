"use client";

import React, { useEffect, useState } from 'react'
import { Drawer, DrawerClose } from './ui/drawer';
import { DrawerTrigger } from './ui/drawer';
import { DrawerContent } from './ui/drawer';
import { DrawerHeader } from './ui/drawer';
import { DrawerTitle } from './ui/drawer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { accountSchema } from '@/app/lib/schema';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { SelectValue } from '@radix-ui/react-select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { toast } from "sonner";
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { Loader2 } from 'lucide-react';
import { useAuthAction } from '@/hooks/use-auth-action';

const CreateAccountDrawer = ({ children }) => {
    const [open, setOpen] = useState(false);
    const { handleResponse } = useAuthAction();

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: '',
            type: 'CURRENT',
            balance: '',
            isDefault: false
        }
    });

    const { data: newAccount, error, fn: createAccountFn, loading: createAccountLoading } = useFetch(createAccount);

    useEffect(() => {
        if (newAccount && !createAccountLoading) {
            // Check if the response indicates authentication failure
            if (!handleResponse(newAccount)) {
                return; // Redirect happened, stop processing
            }

            // Success case
            if (newAccount.success) {
                toast.success("Account created successfully!");
                reset();
                setOpen(false);
            } else {
                toast.error(newAccount.error || "Failed to create account");
            }
        }
    }, [newAccount, createAccountLoading, reset, handleResponse]);

    const onsubmit = async (data) => {
        await createAccountFn(data);
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="shrink-0">
                    <DrawerTitle>Create New Account</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-4">
                        <form id="account-form" className="space-y-4 pb-4" onSubmit={handleSubmit(onsubmit)}>
                            <div className="space-y-2">
                                <label className='text-sm font-medium' htmlFor="name">Account Name</label>
                                <Input id="name" placeholder="Enter account name" {...register("name")} />
                                {errors.name && <p className='text-red-500 text-sm'>{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className='text-sm font-medium' htmlFor="type">Account Type</label>
                                <Select onValueChange={(value) => setValue("type", value)}
                                    defaultValue={watch("type")}>
                                    <SelectTrigger id="type" className="w-full">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CURRENT">Current</SelectItem>
                                        <SelectItem value="SAVINGS">Savings</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className='text-red-500 text-sm'>{errors.type.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className='text-sm font-medium' htmlFor="balance">Initial Balance</label>
                                <Input
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register("balance")} />
                                {errors.balance && <p className='text-red-500 text-sm'>{errors.balance.message}</p>}
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className='space-y-0.5'>
                                    <label className='text-sm font-medium cursor-pointer' htmlFor="isDefault">Set as Default</label>
                                    <p className='text-sm text-muted-foreground'>This account will be selected as the default account for transactions.</p>
                                </div>
                                <Switch
                                    id="isDefault"
                                    onCheckedChange={(checked) => setValue("isDefault", checked)}
                                    checked={watch("isDefault")}
                                />
                            </div>
                        </form>
                    </div>
                    <div className='flex gap-4 pt-4 pb-4 px-4 border-t bg-background/95 backdrop-blur shrink-0'>
                        <DrawerClose asChild>
                            <Button type="button" variant="outline" className='flex-1'>Cancel</Button>
                        </DrawerClose>
                        <Button
                            type="submit"
                            form="account-form"
                            disabled={createAccountLoading}
                            className='flex-1'>
                            {createAccountLoading ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Creating...</> : 'Create Account'}
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default CreateAccountDrawer;
