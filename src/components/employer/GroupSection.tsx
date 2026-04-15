"use client";

import { useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import {

    Plus,

    FolderOpen,

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateGroupModal } from "@/components/employer/CreateGroupModal";
import { useEmployerGroups } from "@/hooks/payroll/usePayrollQueries";
import { GroupCard } from "@/components/employer/GroupCard";


export default function GroupSection({ className }: { className?: string }) {

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


    // 1. Fetch Real On-Chain Data
    const { data: employerGroups, isLoading } = useEmployerGroups();

    return (
        <div className={`mx-auto space-y-12 ${className}`}>

            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-slate-100">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-slate-900">
                            Active Allocations
                        </h3>
                        <p className="text-slate-500 font-medium">
                            Manage your payroll groups and agent settings.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-slate-800 hover:bg-slate-800 text-white rounded-md px-6 py-3 h-auto font-bold transition-all hover:shadow-xl shadow-slate-900/20 group"
                    >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Create New Group
                    </Button>
                </div>

                {/* --- GRID OF GROUPS --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-64 bg-slate-50 rounded-[2rem] animate-pulse"
                                />
                            ))}
                        </div>
                    ) : !employerGroups || employerGroups.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <FolderOpen className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                Ready to deploy?
                            </h3>
                            <p className="text-slate-500 mb-8 max-w-xs">
                                Create your first group to start automating your payroll with
                                yield.
                            </p>
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-slate-800 hover:bg-slate-800 text-white rounded-md px-6 py-3 h-auto font-bold transition-all hover:shadow-xl shadow-slate-900/20 group"
                            >
                                Get Started
                            </Button>

                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[...employerGroups].reverse().map((group) => (
                                <GroupCard key={group.groupId.toString()} group={group} />
                            ))}
                        </div>
                    )}
                </motion.div>
                <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            </div>

            {/* MODALS */}
            {/*<YieldStrategyModal isOpen={isYieldModalOpen} onClose={() => setIsYieldModalOpen(false)} /> */}
        </div>
    );
}


