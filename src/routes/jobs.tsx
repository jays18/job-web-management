import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Pencil, Trash2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/jobflow/page-header";
import { PriorityBadge, StatusBadge } from "@/components/jobflow/badges";
import { JobDialog } from "@/components/jobflow/job-dialog";
import { DeleteJobDialog } from "@/components/jobflow/delete-job-dialog";
import { useJobStore } from "@/lib/job-store";
import { formatDate, initials } from "@/lib/jobflow-utils";
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  type Job,
} from "@/lib/jobflow-types";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs — JobFlow" },
      {
        name: "description",
        content: "Create, assign, filter and track every job your team is working on.",
      },
      { property: "og:title", content: "Jobs — JobFlow" },
      {
        property: "og:description",
        content: "Create, assign, filter and track every job your team is working on.",
      },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const { jobs, employees, loading, employeeById } = useJobStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [priority, setPriority] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState<Job | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (status !== "all" && j.status !== status) return false;
      if (employee !== "all" && j.assignedEmployee !== employee) return false;
      if (priority !== "all" && j.priority !== priority) return false;
      if (q && !`${j.title} ${j.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [jobs, search, status, employee, priority]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (job: Job) => {
    setEditing(job);
    setDialogOpen(true);
  };

  const hasFilters = search || status !== "all" || employee !== "all" || priority !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage and track your team's work."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Job
          </Button>
        }
      />

      <Card className="shadow-card">
        <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,170px))]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={employee} onValueChange={setEmployee}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITY_ORDER.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-muted">
              <Briefcase className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">{hasFilters ? "No matching jobs" : "No jobs yet"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters
                  ? "Try clearing the search or filters."
                  : "Add your first job to get started."}
              </p>
            </div>
            {hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setEmployee("all");
                  setPriority("all");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Add Job
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden shadow-card lg:block">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((job) => {
                    const emp = employeeById(job.assignedEmployee);
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="max-w-[320px]">
                          <p className="truncate font-medium">{job.title}</p>
                          {job.description && (
                            <p className="truncate text-xs text-muted-foreground">
                              {job.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                              {emp ? initials(emp.name) : "—"}
                            </span>
                            <span className="truncate text-sm">{emp?.name ?? "Unassigned"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(job.dueDate)}
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={job.priority} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={job.status} />
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(job)}
                            aria-label={`Edit ${job.title}`}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(job)}
                            aria-label={`Delete ${job.title}`}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile / tablet cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((job) => {
              const emp = employeeById(job.assignedEmployee);
              return (
                <Card key={job.id} className="shadow-card">
                  <CardContent className="space-y-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{job.title}</p>
                      {job.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {job.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={job.priority} />
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                      <span className="truncate">{emp?.name ?? "Unassigned"}</span>
                      <span className="shrink-0">Due {formatDate(job.dueDate)}</span>
                    </div>
                    <div className="flex gap-2 border-t border-border pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEdit(job)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(job)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <JobDialog open={dialogOpen} onOpenChange={setDialogOpen} job={editing} />
      <DeleteJobDialog job={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </div>
  );
}
