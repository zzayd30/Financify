import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/categories';
import React from 'react'
import { getTransaction } from '@/actions/transaction';
import { AddTransactionForm } from '../_components/add-transaction-form';

const AddTransactionPage = async ({ searchParams }) => {
  const accounts = await getUserAccounts();

  const searchParamsResolved = await searchParams;
  const editId = searchParamsResolved?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }
  return (
    <div className='max-w-3xl mx-auto px-5'>
      <h1 className="text-5xl font-extrabold gradient-title">{editId ? "Edit Transaction" : "Add Transaction"}</h1>
      <AddTransactionForm accounts={accounts} categories={defaultCategories} editMode={!!editId} initialData={initialData} />
    </div>
  )
}

export default AddTransactionPage
