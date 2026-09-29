import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useJobStore } from "@/lib/job-store";
import type { Job } from "@/lib/jobflow-types";
import { toast } from "sonner";

export function DeleteJobDialog({
  job,
  onOpenChange,
}: {
  job: Job | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { deleteJob } = useJobStore();

  return (
    <AlertDialog open={!!job} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this job?</AlertDialogTitle>
          <AlertDialogDescription>
            {job ? `"${job.title}" will be removed permanently.` : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => {
              if (!job) return;
              deleteJob(job.id);
              toast.success("Job deleted", { description: job.title });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
