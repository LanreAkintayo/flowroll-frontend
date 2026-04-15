'use client'

import { SectionTitle } from '@/components/shared/SectionTitle'
import { SalarySection } from '@/components/employee/SalarySection'
import { Wallet } from 'lucide-react'

export default function MySalariesPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] transition-colors duration-500 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                <SectionTitle icon={Wallet} title="My Salaries" description='View all salaries across payrolls'/>

                <SalarySection />

            </div>
        </div>
    )
}