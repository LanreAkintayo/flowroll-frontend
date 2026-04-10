// src/components/employer/CreateGroupDrawer.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Calendar,
  ArrowRight,
  Check,
  Search,
  Plus,
  Trash2,
  AlertCircle,
    Clock,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectTrigger, Select, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


export function CreateGroupDrawer({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [cycle, setCycle] = useState("monthly");
  const [duration, setDuration] = useState("30");
const [durationUnit, setDurationUnit] = useState("days");

  // For the roster step
  const [employees, setEmployees] = useState([
    { id: 1, username: "", salary: "" },
  ]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const addEmployee = () => {
    setEmployees([...employees, { id: Date.now(), username: "", salary: "" }]);
  };

  const removeEmployee = (id: number) => {
    setEmployees(employees.filter((e) => e.id !== id));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl border-l border-slate-200 p-0 bg-white overflow-hidden flex flex-col">
        {/* PROGRESS BAR */}
        <div className="h-1.5 w-full bg-slate-100 flex">
          <motion.div
            className="h-full bg-violet-500"
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Define the Group
                  </h2>
                  <p className="text-slate-500 mt-2">
                    Give this payroll bucket a name and a payout frequency.
                  </p>
                </div>

                <div className="space-y-6">

                  <div className="space-y-3">
                    <label className="text-sm  tracking-wide text-slate-700">
                      Group Name
                    </label>
                    <Input
                      placeholder="e.g. Core Engineering"
                      className="h-14 rounded-2xl border-slate-200 text-lg font-medium focus-visible:ring-violet-500 bg-slate-50/30"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm  tracking-wide text-slate-700 block">
                      Yield & Withdrawal Duration
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-[2]">
                        <Input
                          type="number"
                          placeholder="30"
                          className="h-14 rounded-2xl border-slate-200 text-lg  focus-visible:ring-violet-500 bg-slate-50/30"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Select
                          value={durationUnit}
                          onValueChange={setDurationUnit}
                        >
                          <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-medium bg-white ">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200">
                            <SelectItem value="seconds" className="">
                              Seconds
                            </SelectItem>
                            <SelectItem value="minutes" className="">
                              Minutes
                            </SelectItem>
                            <SelectItem value="days" className="">
                              Days
                            </SelectItem>
                            <SelectItem value="weeks" className="">
                              Weeks
                            </SelectItem>
                            <SelectItem value="months" className="">
                              Months
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Dynamic Info Box */}
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex gap-3 items-start"
                    >
                      <Clock className="w-5 h-5 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-indigo-900">
                          Lock-up Period: {duration} {durationUnit}
                        </p>
                        <p className="text-xs text-indigo-600/80 mt-1 font-medium leading-relaxed">
                          Employees can claim their salary after this duration.
                          Funds will actively generate yield for the treasury
                          during this window.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Build the Roster
                  </h2>
                  <p className="text-slate-500 mt-2">
                    Add members using their Initia username or address.
                  </p>
                </div>

                <div className="space-y-4">
                  {employees.map((emp, idx) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-3 group/row"
                    >
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="username.init"
                          className="h-12 pl-11 rounded-xl border-slate-200 font-medium"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder="Amount"
                          type="number"
                          className="h-12 rounded-xl border-slate-200 font-bold"
                        />
                      </div>
                      <Button
                        onClick={() => removeEmployee(emp.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addEmployee}
                    className="w-full h-12 border-dashed border-2 border-slate-200 rounded-xl text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Member
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Ready to Deploy
                  </h2>
                  <p className="text-slate-500 mt-2">
                    Review the configuration before activating the treasury.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-slate-500 font-medium">Group</span>
                    <span className="font-bold text-slate-900">
                      {groupName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-slate-500 font-medium">Cycle</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {cycle}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500 font-medium">
                      Total Monthly Payout
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      $12,000.00
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 flex gap-3 items-start text-violet-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    Activating this group will generate approximately{" "}
                    <span className="font-bold text-violet-600">$120.00</span>{" "}
                    in yield every month.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          {step > 1 && (
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-xl font-bold"
              onClick={prevStep}
            >
              Back
            </Button>
          )}
          <Button
            className="flex-[2] h-14 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white"
            onClick={step === 3 ? () => console.log("Final Launch") : nextStep}
          >
            {step === 3 ? "Launch Treasury" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
