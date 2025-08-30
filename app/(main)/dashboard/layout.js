import React, { Suspense } from 'react'
import DashboardPage from './page'
import { BarLoader } from 'react-spinners'

const DashboardLayout = () => {
  return (
    <div className='px-5'>
      <h1 className='text-6xl font-bold mb-5 gradient-title'>Dashboard</h1>
      {/* Dashboard page */}
      {/* Suspense is used to handle loading states for components that may take time to load. If API call is there it will automatically show loading state */}
      <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea' />}>
        <DashboardPage />
      </Suspense>
    </div>
  )
}

export default DashboardLayout
