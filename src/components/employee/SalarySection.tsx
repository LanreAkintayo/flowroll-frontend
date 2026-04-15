'use client'

import { Wallet } from 'lucide-react'
import { useEmployeeGroups } from '@/hooks/payroll/usePayrollQueries'
import EmployeeGroupCard from '@/components/employee/EmployeeGroupCard'

export function SalarySection() {
    const { data: employeeGroups, isLoading: isLoadingEmployeeGroups } = useEmployeeGroups()

    return (
        <div className="w-full space-y-5">
           

            {isLoadingEmployeeGroups ? (
                <div className="w-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                    <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Fetching your wealth portfolio...
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        {employeeGroups?.map((group, idx) => (
                            <EmployeeGroupCard
                                key={idx}
                                group={group}
                                index={idx}
                            />
                        ))}
                    </div>

                    {(!employeeGroups || employeeGroups.length === 0) && (
                        <div className="w-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                            <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                No active payroll streams found for this wallet.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}