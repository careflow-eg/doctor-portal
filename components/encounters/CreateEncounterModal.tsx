"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, UserPlus, Search, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { encounterService } from "@/services/encounterService";
import { patientService } from "@/services/patientService";
import { useNotificationStore } from "@/stores/notificationStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Patient } from "@/types/patient";

const newPatientSchema = z.object({
  mrn: z.string().optional(),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(0).max(150).optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  contact_number: z.string().optional(),
  chief_complaint: z.string().optional(),
});

type NewPatientFormData = z.infer<typeof newPatientSchema>;

interface CreateEncounterModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateEncounterModal({ open, onClose }: CreateEncounterModalProps) {
  const { addNotification } = useNotificationStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"search" | "new">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [existingChiefComplaint, setExistingChiefComplaint] = useState("");

  // Search patients query
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["patients", "search", searchTerm],
    queryFn: () => patientService.listPatients(searchTerm),
    enabled: open && mode === "search",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewPatientFormData>({
    resolver: zodResolver(newPatientSchema),
  });

  const createEncounterForPatient = async (patientId: string, chiefComplaint?: string) => {
    return await encounterService.createEncounter({
      patient_id: patientId,
      chief_complaint: chiefComplaint,
    });
  };

  const newPatientMutation = useMutation({
    mutationFn: async (data: NewPatientFormData) => {
      const patient = await patientService.createPatient({
        mrn: data.mrn || undefined,
        full_name: data.full_name,
        age: data.age,
        gender: data.gender,
        contact_number: data.contact_number,
      });
      return await createEncounterForPatient(patient.id, data.chief_complaint);
    },
    onSuccess: (encounter) => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      addNotification({
        type: "success",
        title: "Encounter created!",
        message: `Encounter for ${encounter.patient?.full_name} created successfully.`,
      });
      handleClose();
      router.push(`/encounters/${encounter.id}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create encounter.";
      addNotification({ type: "error", title: "Error", message: msg });
    },
  });

  const existingPatientMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPatient || !selectedPatient.id) throw new Error("No patient selected");
      return await createEncounterForPatient(selectedPatient.id, existingChiefComplaint);
    },
    onSuccess: (encounter) => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      addNotification({
        type: "success",
        title: "Encounter created!",
        message: `Encounter for ${selectedPatient?.full_name} created successfully.`,
      });
      handleClose();
      router.push(`/encounters/${encounter.id}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create encounter.";
      addNotification({ type: "error", title: "Error", message: msg });
    },
  });

  const handleClose = () => {
    reset();
    setSelectedPatient(null);
    setSearchTerm("");
    setExistingChiefComplaint("");
    setMode("search");
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">New Encounter</h2>
            <button
              onClick={handleClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="px-6 pt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("search")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                mode === "search"
                  ? "bg-careflow-teal text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-4 w-4" /> Existing Patient
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                mode === "new"
                  ? "bg-careflow-teal text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-4 w-4" /> Register New
            </button>
          </div>

          {mode === "search" ? (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Search Patient (Name or MRN)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by full name or MRN..."
                    className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 transition-all"
                  />
                </div>
              </div>

              {/* Patient List */}
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-xl p-2 bg-muted/20">
                {isSearching ? (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching practice patients...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No patients found. Click &quot;Register New&quot; above to add a new patient.
                  </div>
                ) : (
                  searchResults.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                        selectedPatient?.id === patient.id
                          ? "bg-careflow-teal/10 border border-careflow-teal text-careflow-teal"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm">{patient.full_name}</p>
                        <p className="text-xs text-muted-foreground">MRN: {patient.mrn} • {patient.gender || "N/A"}, {patient.age || "N/A"} yrs</p>
                      </div>
                      {selectedPatient?.id === patient.id && (
                        <Check className="h-4 w-4 text-careflow-teal" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {selectedPatient && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Chief Complaint
                  </label>
                  <textarea
                    value={existingChiefComplaint}
                    onChange={(e) => setExistingChiefComplaint(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 transition-all resize-none"
                    placeholder="Reason for visit..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedPatient || existingPatientMutation.isPending}
                  onClick={() => existingPatientMutation.mutate()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white text-sm font-semibold py-2.5 transition-all disabled:opacity-60"
                >
                  {existingPatientMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    <><UserPlus className="h-4 w-4" /> Start Encounter</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((data) => newPatientMutation.mutate(data))}
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
                    MRN (Optional)
                  </label>
                  <input
                    {...register("mrn")}
                    placeholder="Auto-generated if empty"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 transition-all"
                  />
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
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPatientMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white text-sm font-semibold py-2.5 transition-all disabled:opacity-60"
                >
                  {newPatientMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    <><UserPlus className="h-4 w-4" /> Register & Start</>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
