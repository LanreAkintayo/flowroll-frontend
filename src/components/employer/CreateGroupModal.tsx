"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePayrollActions } from "@/hooks/payroll/usePayrollActions";
import { toast } from "sonner";
import {
  Briefcase,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { flowLog } from "@/lib/utils";

const groupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1"),
  unit: z.enum(["seconds", "minutes", "hours", "days"]),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export function CreateGroupModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { createGroup } = usePayrollActions();

  // State Management for UI flow
  const [successData, setSuccessData] = useState<{
    groupId: string;
    hash: string;
  } | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", duration: 30, unit: "days" },
  });

  const handleClose = () => {
    form.reset();
    setSuccessData(null);
    setErrorDetails(null);
    onClose();
  };

  const onSubmit = async (values: GroupFormValues) => {
    setErrorDetails(null);
    try {
      const multipliers: Record<string, number> = {
        seconds: 1,
        minutes: 60,
        hours: 3600,
        days: 86400,
      };

      const totalSeconds = values.duration * multipliers[values.unit];
      flowLog("Initiating group creation:", values.name);

      const result = await createGroup.mutateAsync({
        name: values.name,
        cycleDuration: BigInt(totalSeconds),
      });

      flowLog("Group created successfully!", result);

      setSuccessData({
        groupId: result.groupId.toString(),
        hash: result.hash,
      });

      toast.success("Payroll Group Initialized!");
    } catch (err: any) {
      flowLog("Caught error in onSubmit:", err);

      // Handle User Rejection (MetaMask 'Cancel' button)
      if (err.message?.includes("User rejected") || err.code === 4001) {
        toast.error("Transaction cancelled");

        setErrorDetails(
          err.shortMessage || err.message || "An unexpected error occurred",
        );

        return;
      } else {
        toast.error("Transaction cancelled");

        setErrorDetails(
          err.shortMessage || err.message || "An unexpected error occurred",
        );
      }
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[460px] bg-white border-slate-200 rounded-[2rem] p-0 overflow-hidden shadow-2xl shadow-slate-900/10"
      onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {successData ? (
          /* --- SUCCESS VIEW --- */
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-montserrat font-bold text-slate-900 mb-2">
              Payroll Initialized!
            </h2>
            <p className="text-slate-500 mb-8 max-w-[300px]">
              Your group{" "}
              <span className="font-semibold text-slate-900">
                #{successData.groupId}
              </span>{" "}
              is now live on the Flowroll AppChain.
            </p>

            <div className="w-full space-y-3 mb-8">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm text-slate-500">Transaction Hash</span>
                <a
                  href={`https://explorer.initia.xyz/tx/${successData.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-violet-600 flex items-center gap-1 hover:underline"
                >
                  {successData.hash.slice(0, 6)}...{successData.hash.slice(-4)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <Button
              onClick={() => {
                router.push(`/employer/groups/${successData.groupId}`);
                handleClose();
              }}
              className="w-full h-14 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-lg font-semibold group transition-all"
            >
              Go to Group Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ) : errorDetails ? (
          /* --- FAILURE VIEW --- */
        <div className="p-8 flex flex-col items-center text-center max-h-[90vh] w-full max-w-md">
  {/* --- FIXED HEADER --- */}
  <div className="shrink-0 flex flex-col items-center">
    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
      <XCircle className="w-10 h-10 text-rose-600" />
    </div>
    <h2 className="text-2xl font-montserrat font-bold text-slate-900 mb-2">
      Creation Failed
    </h2>
  </div>

  {/* --- SCROLLABLE ERROR AREA --- */}
  {/* We set a max-height and overflow-y-auto so the layout stays locked */}
  <div className="w-full bg-slate-50/50 rounded-2xl p-2 mb-8 border border-slate-100 overflow-hidden flex flex-col">
    <p className="text-slate-600 text-sm leading-relaxed overflow-y-auto max-h-[120px] custom-scrollbar break-words">
      {errorDetails || "An unknown error occurred during the transaction. Please check your wallet or try again later."}
    </p>
  </div>

  {/* --- FIXED FOOTER --- */}
  <div className="w-full flex gap-3 shrink-0">
    <Button
      variant="outline"
      onClick={handleClose}
      className="flex-1 h-12 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
    >
      Cancel
    </Button>
    <Button
      onClick={() => setErrorDetails(null)}
      className="flex-1 h-12 rounded-xl bg-slate-900 text-white group hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
    >
      <RefreshCcw className="mr-2 w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
      Try Again
    </Button>
  </div>
</div>
        ) : (
          /* --- FORM VIEW --- */
          <>
            <div className="bg-slate-50/50 px-8 pt-8 border-b border-slate-100">
              <DialogHeader>
                <DialogTitle className="font-montserrat text-2xl text-slate-900 tracking-tight">
                  Create Payroll Group
                </DialogTitle>
                <DialogDescription className="text-slate-500 mt-2">
                  Set up a new team and define their payment cycle. You can add
                  employees in the next step.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="px-8 py-5 space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium tracking-wide text-slate-600 uppercase">
                  Group Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    {...form.register("name")}
                    placeholder="e.g. Core Engineering"
                    className={`pl-11 h-12 bg-white border-slate-200 text-slate-900 rounded-xl focus-visible:ring-violet-500 transition-all ${
                      form.formState.errors.name ? "border-rose-300" : ""
                    }`}
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium tracking-wide text-slate-600 uppercase">
                  Cycle Duration
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                      {...form.register("duration")}
                      type="number"
                      className="pl-11 h-12 bg-white border-slate-200 text-slate-900 rounded-xl focus-visible:ring-violet-500"
                    />
                  </div>

                  <Controller
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-[130px] h-12 bg-white border-slate-200 rounded-xl focus:ring-violet-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 rounded-xl">
                          {["seconds", "minutes", "hours", "days"].map((u) => (
                            <SelectItem key={u} value={u}>
                              {u.charAt(0).toUpperCase() + u.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createGroup.isPending}
                  className="flex-1 h-12 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
                >
                  {createGroup.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Initialize Group"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
