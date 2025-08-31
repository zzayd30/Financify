"use client";
import { updateBudget } from '@/actions/budget';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import useFetch from '@/hooks/use-fetch';
import { Check, Pencil, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const BudgetProgress = ({ initialBudget, currentExpenses }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(initialBudget?.amount?.toString() || "");
    const percentageUsed = initialBudget ? (currentExpenses / initialBudget.amount) * 100 : 0;
    console.log(percentageUsed);
    const { loading: isLoading,
        fn: updateBudgetFn,
        data: updatedBudget,
        error,
    } = useFetch(updateBudget);

    const handleUpdateBudget = async () => {
        setIsEditing(false);
        const amount = parseFloat(newBudget);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid budget amount");
            return;
        }
        await updateBudgetFn(amount);
    }
    const handleCancel = () => {
        setIsEditing(false);
        setNewBudget(initialBudget?.amount?.toString() || "");
    }
    useEffect(() => {
        if (updatedBudget?.success) {
            setIsEditing(false);
            toast.success("Budget updated successfully");
        }
    }, [updatedBudget]);
    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to update budget");
        }
    }, [error]);
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex-1">
                    <CardTitle>Monthly Budget (Default Account)</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        {isEditing ? <div className='flex items-center gap-2'>
                            <Input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className="w-32" placeholder="Enter new budget" autoFocus disabled={isLoading} />
                            <Button variant="ghost" disabled={isLoading} size="icon" onClick={handleUpdateBudget}><Check className='h-4 w-4 text-green-500' /></Button>
                            <Button variant="ghost" disabled={isLoading} size="icon" onClick={handleCancel}><X className='h-4 w-4 text-red-500' /></Button>
                        </div> : <>
                            <CardDescription>
                                {initialBudget ? `$${currentExpenses.toFixed(2)} of $${initialBudget.amount.toFixed(2)} spent` : "No budget set"}
                            </CardDescription>
                            <Button variant="ghost" className="h-6 w-6" size="icon" onClick={() => setIsEditing(true)}><Pencil className='w-3 h-3' /></Button>
                        </>}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {initialBudget && <div className='space-y-2'>
                    <Progress value={percentageUsed} extraStyles={`${
                        percentageUsed >= 90 ? "bg-red-500" : percentageUsed >= 75 ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                    <p className="text-xs text-muted-foreground text-right">
                        {percentageUsed.toFixed(2)}% of budget used
                    </p>
                </div>}
            </CardContent>
        </Card>
    )
}

export default BudgetProgress
