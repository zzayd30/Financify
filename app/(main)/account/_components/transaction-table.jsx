"use client";
import { bulkDeleteTransactions } from '@/actions/accounts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { categoryColors } from '@/data/categories';
import useFetch from '@/hooks/use-fetch';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCcw, Search, Trash, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useMemo, useState } from 'react'
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

const RECURRING_INTERVAL = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly',
};

const TransactionTable = ({ transactions }) => {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState([]);
    const [sortConfig, setSortConfig] = useState({ field: 'date', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [recurringFilter, setRecurringFilter] = useState('');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

    const { loading: deleteLoading,
        fn: deleteFn,
        data: deleted,
    } = useFetch(bulkDeleteTransactions);

    const filteredAndSortedTransactions = useMemo(() => {
        let results = [...transactions];

        if (searchTerm) {
            results = results.filter((transaction) =>
                transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (recurringFilter) {
            results = results.filter((transaction) => {
                if (recurringFilter === "recurring") return transaction.isRecurring;
                return !transaction.isRecurring;
            });
        }

        if (typeFilter) {
            results = results.filter((transaction) => transaction.type === typeFilter);
        }

        if (sortConfig) {
            const { field, direction } = sortConfig;
            results.sort((a, b) => {
                if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
                if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return results;
    }, [
        transactions, searchTerm, typeFilter, recurringFilter, sortConfig
    ]);
    const handleSort = (field) => {
        setSortConfig((current) => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    }
    const handleSelect = (id) => {
        setSelectedIds((current) => {
            if (current.includes(id)) {
                return current.filter((selectedId) => selectedId !== id);
            } else {
                return [...current, id];
            }
        });
    }
    const handleSelectAll = async () => {
        if (selectedIds.length === filteredAndSortedTransactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredAndSortedTransactions.map((transaction) => transaction.id));
        }
    }
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteDialog(true);
    };
    const confirmBulkDelete = async () => {
        await deleteFn(selectedIds);
        setSelectedIds([]);
        setShowBulkDeleteDialog(false);
    };
    const handleClearFilters = () => {
        setSearchTerm('');
        setTypeFilter('');
        setRecurringFilter('');
        setSelectedIds([]);
    }

    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.error("Transactions deleted successfully");
        }
    }, [deleted, deleteLoading]);

    return (
        <div className='space-y-4'>
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {selectedIds.length} transactions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmBulkDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <BarLoader className='mt-4' width={"100%"} loading={deleteLoading} color="#9333ea" />
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className='w-4 h-4 absolute left-2 top-2.5 text-muted-foreground' />
                    <Input className='pl-8' placeholder='Search transactions...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={recurringFilter} onValueChange={(value) => setRecurringFilter(value)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Transaction" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
                        </SelectContent>
                    </Select>
                    {selectedIds.length > 0 && <div className='flex items-center gap-2'>
                        <Button variant="destructive" size="sm" onClick={handleBulkDelete}><Trash className='h-4 w-4 mr-2' />Delete Selected({selectedIds.length})</Button>
                    </div>}
                    {(searchTerm || typeFilter || recurringFilter) && <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear Filters">
                        <X className='h-4 w-5' />
                    </Button>}
                </div>
            </div>
            {/* Transactions */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox checked={selectedIds.length === filteredAndSortedTransactions.length} onCheckedChange={handleSelectAll} />
                            </TableHead>
                            <TableHead onClick={() => handleSort('date')} className="cursor-pointer">
                                <div className="flex items-center">
                                    Date {sortConfig.field === "date" && (
                                        sortConfig.direction === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>
                                Description
                            </TableHead>
                            <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                                <div className="flex items-center">
                                    Category {sortConfig.field === "category" && (
                                        sortConfig.direction === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead onClick={() => handleSort('amount')} className="cursor-pointer">
                                <div className="flex items-center justify-end">
                                    Amount {sortConfig.field === "amount" && (
                                        sortConfig.direction === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>
                                Recurring
                            </TableHead>
                            <TableHead>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedTransactions.length === 0 ? <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No transactions found.
                            </TableCell>
                        </TableRow> : filteredAndSortedTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>
                                    <Checkbox checked={selectedIds.includes(transaction.id)} onCheckedChange={() => handleSelect(transaction.id)} />
                                </TableCell>
                                <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell className="capitalize">
                                    <span className='px-2 py-1 rounded text-white text-sm' style={{ background: categoryColors[transaction.category] }}>
                                        {transaction.category}
                                    </span></TableCell>
                                <TableCell style={{ color: transaction.type === "EXPENSE" ? "red" : "green" }} className="text-right font-medium">{transaction.type === "EXPENSE" ? "-" : "+"}${transaction.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    {transaction.isRecurring ? <Tooltip>
                                        <TooltipTrigger><Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                                            <RefreshCcw className='w-3 h-3' />{RECURRING_INTERVAL[transaction.recurringInterval]}</Badge></TooltipTrigger>
                                        <TooltipContent>
                                            <div className='text-sm'>Next Date:</div>
                                            <div className='font-medium'>{format(new Date(transaction.nextRecurringDate), "PP")}</div>
                                        </TooltipContent>
                                    </Tooltip> : <Badge variant="outline" className="gap-1">
                                        <Clock className='h-3 w-3' />One Time</Badge>}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className='h-4 w-4' /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() =>
                                                router.push(`/transaction/create?edit=${transaction.id}`)
                                            }>Edit</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => deleteFn([transaction.id])}>
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default TransactionTable