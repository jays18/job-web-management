import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Employee, Job, JobInput } from "./jobflow-types";
import { mockEmployees, mockJobs } from "./mock-data";

/**
 * Single data access layer for JobFlow. Today it serves mock data from memory;
 * swapping the bodies of these functions for Supabase queries is the only
 * change needed later.
 */
interface JobStore {
  jobs: Job[];
  employees: Employee[];
  loading: boolean;
  addJob: (input: JobInput) => void;
  updateJob: (id: string, input: JobInput) => void;
  deleteJob: (id: string) => void;
  employeeById: (id: string) => Employee | undefined;
}

const JobStoreContext = createContext<JobStore | null>(null);

export function JobStoreProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const value = useMemo<JobStore>(
    () => ({
      jobs,
      employees,
      loading,
      addJob: (input) =>
        setJobs((prev) => [
          {
            ...input,
            id: `job-${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]),
      updateJob: (id, input) =>
        setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...input } : job))),
      deleteJob: (id) => setJobs((prev) => prev.filter((job) => job.id !== id)),
      employeeById: (id) => employees.find((e) => e.id === id),
    }),
    [jobs, employees, loading],
  );

  return <JobStoreContext.Provider value={value}>{children}</JobStoreContext.Provider>;
}

export function useJobStore() {
  const ctx = useContext(JobStoreContext);
  if (!ctx) throw new Error("useJobStore must be used inside JobStoreProvider");
  return ctx;
}
