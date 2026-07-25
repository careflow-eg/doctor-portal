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
      // 1. Create patient
      const patient = await patientService.createPatient({
        mrn: data.mrn,
        full_name: data.full_name,
        age: data.age,
        gender: data.gender,
        contact_number: data.contact_number,
      });
      // 2. Create encounter
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
        message: `Encounter for ${encounter.patient?.full_name} is ready.`,
      });
      reset();
      onClose();
      router.push(`/encounters/${encounter.id}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create encounter.";
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
          className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">New Encounter</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="p-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  {...register("full_name")}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 transition-all"
                  placeholder="John Doe"
                />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  MRN *
                </label>
                <input
                  {...register("mrn")}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 transition-all"
                />
                {errors.mrn && (
                  <p className="mt-1 text-xs text-destructive">{errors.mrn.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  {...register("age", { valueAsNumber: true })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 transition-all"
                  placeholder="45"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 transition-all"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Phone
                </label>
                <input
                  {...register("contact_number")}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Chief Complaint
                </label>
                <textarea
                  {...register("chief_complaint")}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 transition-all resize-none"
                  placeholder="Patient's main presenting complaint..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white text-sm font-semibold py-2.5 transition-all disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Create Encounter</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
