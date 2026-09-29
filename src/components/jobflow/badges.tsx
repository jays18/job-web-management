import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type JobPriority,
  type JobStatus,
} from "@/lib/jobflow-types";

const pill = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        info: "border-info-border bg-info-soft text-info",
        success: "border-success-border bg-success-soft text-success",
        warning: "border-warning-border bg-warning-soft text-warning",
        danger: "border-danger-border bg-danger-soft text-danger",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

type Tone = NonNullable<VariantProps<typeof pill>["tone"]>;

const statusTone: Record<JobStatus, Tone> = {
  todo: "neutral",
  in_progress: "info",
  complete: "success",
};

const priorityTone: Record<JobPriority, Tone> = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={pill({ tone: statusTone[status] })}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: JobPriority }) {
  return <span className={cn(pill({ tone: priorityTone[priority] }))}>{PRIORITY_LABELS[priority]}</span>;
}
