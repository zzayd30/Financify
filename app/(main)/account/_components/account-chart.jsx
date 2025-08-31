"use client";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import React, { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const AccountChart = ({ transactions }) => {

    const DATE_RANGES = {
        "7D": { label: "Last 7 Days", days: 7 },
        "1M": { label: "Last 1 Month", days: 30 },
        "3M": { label: "Last 3 Months", days: 90 },
        "6M": { label: "Last 6 Months", days: 180 },
        "ALL": { label: "All Time", days: null }
    }

    const [dataRange, setDateRange] = useState("1M")

    const filteredData = useMemo(() => {
        const range = DATE_RANGES[dataRange];
        const now = new Date();
        const startDate = range.days ? startOfDay(subDays(now, range.days)) : startOfDay(new Date(0));
        const filtered = transactions.filter((t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now));
        const group = filtered.reduce((acc, transaction) => {
            const date = format(new Date(transaction.date), 'MMM dd');
            if (!acc[date]) {
                acc[date] = { date, income: 0, expense: 0 };
            }
            if (transaction.type === "INCOME") {
                acc[date].income += transaction.amount;
            } else {
                acc[date].expense += transaction.amount;
            }
            return acc;
        }, {});

        return Object.values(group).sort((a, b) => new Date(a.date) - new Date(b.date));

    }, [dataRange, transactions])

    const totals = useMemo(() => {
        return filteredData.reduce((acc, day) => ({
            income: acc.income + day.income,
            expense: acc.expense + day.expense,
        }),
            { income: 0, expense: 0 });
    }, [filteredData]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle className="text-base font-normal">Transaction Overview</CardTitle>
                <Select defaultValue={dataRange} onValueChange={(value) => setDateRange(value)}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(DATE_RANGES).map(([key, { label }]) => {
                            return <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="flex justify-around mb-6 text-sm">
                    <div className="text-center">
                        <p className="">Total Income</p>
                        <p className="text-lg font-bold text-green-500">${totals.income.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="">Total Expense</p>
                        <p className="text-lg font-bold text-red-500">${totals.expense.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="">Net</p>
                        <p className={`text-lg font-bold ${totals.income - totals.expense >= 0 ? "text-green-500" : "text-red-500"}`}>${(totals.income - totals.expense).toFixed(2)}</p>
                    </div>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={filteredData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`} />
                            <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4,4,0,0]} />
                            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default AccountChart
