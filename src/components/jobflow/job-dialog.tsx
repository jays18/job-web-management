import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  type Job,
  type JobInput,
  type JobPriority,
  type JobStatus,
} from "@/lib/jobflow-types";
import { useJobStore } from "@/lib/job-store";

const empty: JobInput = {
  title: "",
  description: "",
  assignedEmployee: "",
  dueDate: "",
  priority: "medium",
  status: "todo",
};

type Errors = Partial<Record<keyof JobInput, string>>;

export function JobDialog({
  open,
  onOpenChange,
  job,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null;
}) {
  const { employees, addJob, updateJob } = useJobStore();
  const [form, setForm] = useState<JobInput>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      job
        ? {
            title: job.title,
            description: job.description,
            assignedEmployee: job.assignedEmployee,
            dueDate: job.dueDate,
            priority: job.priority,
            status: job.status,
          }
        : empty,
    );
  }, [open, job]);

  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!form.title.trim()) next.title = "Job title is required.";
    if (!form.assignedEmployee) next.assignedEmployee = "Choose an employee.";
    if (!form.dueDate) next.dueDate = "A due date is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const payload = { ...form, title: form.title.trim(), description: form.description.trim() };
    window.setTimeout(async () => {
      const { toast } = await import("sonner");
      if (job) {
        updateJob(job.id, payload);
        toast.success("Job updated", { description: payload.title });
      } else {
        addJob(payload);
        toast.success("Job created", { description: payload.title });
      }
      setSaving(false);
      onOpenChange(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{job ? "Edit job" : "Add job"}</DialogTitle>
          <DialogDescription>
            {job ? "Update the details for this job." : "Create a job and assign it to your team."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              value={form.title}
              placeholder="e.g. Replace HVAC filters"
              onChange={(e) => set("title", e.target.value)}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / notes</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              placeholder="Anything the assignee should know"
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Assigned employee</Label>
              <Select
                value={form.assignedEmployee}
                onValueChange={(v) => set("assignedEmployee", v)}
              >
                <SelectTrigger aria-invalid={!!errors.assignedEmployee} className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} — {e.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedEmployee && (
                <p className="text-xs text-destructive">{errors.assignedEmployee}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                aria-invalid={!!errors.dueDate}
              />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => set("priority", v as JobPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_ORDER.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as JobStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : job ? "Update job" : "Create job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
