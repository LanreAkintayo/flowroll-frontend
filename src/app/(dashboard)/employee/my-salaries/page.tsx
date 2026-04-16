'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Wallet,
    Lock,
    Clock,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Zap,
    Info,
    ShieldCheck,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { CreditTermsCard } from '@/components/employee/CreditTermsCard'
import { WithdrawAdvanceCard } from '@/components/employee/WiithdrawAdvanceCard'
import { SalaryStats } from '@/components/employee/SalaryStats'

// MOCK DATA
const MOCK_LOCKED_SALARY = 3500.85
const MOCK_WALLET_BALANCE = 1250.50
const MOCK_MAX_ADVANCE = 1500
const FEE_BPS = 150
const NEXT_PAYDAY = "14 Days"

export default function MySalariesPage() {
    const [rawRequestAmount, setRawRequestAmount] = useState<string>('')
    const [activeDebt, setActiveDebt] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)

    const numericRequestAmount = Number(rawRequestAmount.replace(/[^0-9.]/g, ''))
    const availableToRequest = MOCK_MAX_ADVANCE - activeDebt
    const feeAmount = (numericRequestAmount * FEE_BPS) / 10000
    const netAmount = numericRequestAmount - feeAmount

    const exceedsMax = numericRequestAmount > availableToRequest
    const isInputActive = numericRequestAmount > 0

    const handleConfirmRequest = () => {
        if (numericRequestAmount < 10 || exceedsMax) return;
        setIsLoading(true)

        setTimeout(() => {
            setActiveDebt(prev => prev + numericRequestAmount)
            setIsLoading(false)
            setRawRequestAmount('')
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#05070a] transition-colors duration-500 pt-8 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/20">
            <div className="max-w-7xl mx-auto space-y-8">

                <SectionTitle
                    title="My Salaries"
                    description="Monitor your wealth accrual and manage your liquidity."
                />


                {/* TOP ROW: THE 4-GRID STAT ARRAY (Tooltip & Overflow Fixed) */}
                <SalaryStats />

                {/* BOTTOM ROW: CREDIT ENGINE & INFO CARD */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">


                    {/* LEFT CARD: FLOWROLL CREDIT ENGINE (Restructured & Sturdy) */}
                    <WithdrawAdvanceCard />

                    {/* RIGHT CARD: CREDIT HEALTH & INFO */}
                    <div className="lg:col-span-5">
                        <CreditTermsCard />
                    </div>

                </div>
            </div>
        </div>
    )
}



























