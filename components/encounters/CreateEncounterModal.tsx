"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, UserPlus, Search } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encounterService } from "@/services/encounterService";
import { patientService } from "@/services/patientService";
import { useNotificationStore } from "@/stores/notificationStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { generateMRN } from "@/lib/utils";

const patientSchema = z.object({
  mrn: z.string().min(1, "MRN is required"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(0).max(150).optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  contact_number: z.string().optional(),
  chief_complaint: z.string().optional(),
});

type FormData = z.infer<typeof patientSchema>;

interface CreateEncounterModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateEncounterModal({ open, onClose }: CreateEncounterModalProps) {
  const { addNotification } = useNotificationStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { mrn: generateMRN() },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      // 1. Create patient with generated UUID & timestamps
      const patient = await patientService.createPatient({
        mrn: data.mrn,
        full_name: data.full_name,
        age: data.age,
        gender: data.gender,
        contact_number: data.contact_number,
      });
      // 2. Create encounter with generated UUID & timestamps
      const encounter = await encounterService.createEncounter({
        patient_id: patient.id,
        chief_complaint: data.chief_complaint,
      });
      return encounter;
    },
    onSuccess: (encounter) => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      addNotification({
        type: "success",
        title: "Encounter created!",
        message: `Encounter for ${encounter.patient?.full_name || "patient"} is ready.`,
      });
      reset({ mrn: generateMRN() });
      onClose();
      router.push(`/encounters/${encounter.id}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Failed to create encounter.";
      addNotification({ type: "error", title: "Error", message: msg });
    },
  });

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-careflow-teal/10 text-careflow-teal">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">New Encounter</h2>
                <p className="text-xs text-muted-foreground">Register patient and start clinical workflow</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            {/* MRN & Name */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">MRN</label>
                <input
                  {...register("mrn")}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50"
                />
                {errors.mrn && <p className="mt-1 text-[10px] text-destructive">{errors.mrn.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("full_name")}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50"
                />
                {errors.full_name && (
                  <p className="mt-1 text-[10px] text-destructive">{errors.full_name.message}</p>
                )}
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Age</label>
                <input
                  type="number"
                  {...register("age", { valueAsNumber: true })}
                  placeholder="e.g. 45"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Gender</label>
                <select
                  {...register("gender")}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Contact Number</label>
                <input
                  {...register("contact_number")}
                  placeholder="+1 555-0199"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50"
                />
              </div>
            </div>

            {/* Chief Complaint */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Chief Complaint / Visit Reason
              </label>
              <textarea
                {...register("chief_complaint")}
                rows={3}
                placeholder="Describe symptoms, primary concerns, or reason for visit..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 resize-none"
              />
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white px-4 py-2 text-xs font-medium transition-all shadow-md shadow-careflow-teal/20 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Start Encounter</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
