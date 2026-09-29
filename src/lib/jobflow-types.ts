export type JobStatus = "todo" | "in_progress" | "complete";
export type JobPriority = "low" | "medium" | "high";

export interface Employee {
  id: string;
  name: string;
  position: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  assignedEmployee: string; // employee id
  dueDate: string; // ISO yyyy-mm-dd
  priority: JobPriority;
  status: JobStatus;
  createdAt: string; // ISO timestamp
}

export type JobInput = Omit<Job, "id" | "createdAt">;

export const STATUS_LABELS: Record<JobStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  complete: "Complete",
};

export const PRIORITY_LABELS: Record<JobPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const STATUS_ORDER: JobStatus[] = ["todo", "in_progress", "complete"];
export const PRIORITY_ORDER: JobPriority[] = ["low", "medium", "high"];
