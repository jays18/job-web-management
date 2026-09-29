import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/jobflow/page-header";
import { PriorityBadge, StatusBadge } from "@/components/jobflow/badges";
import { useJobStore } from "@/lib/job-store";
import { formatDate, initials } from "@/lib/jobflow-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — JobFlow" },
      {
        name: "description",
        content: "Track job status, priorities and due dates across your team at a glance.",
      },
      { property: "og:title", content: "Dashboard — JobFlow" },
      {
        property: "og:description",
        content: "Track job status, priorities and due dates across your team at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { jobs, loading, employeeById } = useJobStore();

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: Briefcase, tone: "text-primary" },
    {
      label: "To Do",
      value: jobs.filter((j) => j.status === "todo").length,
      icon: ListTodo,
      tone: "text-muted-foreground",
    },
    {
      label: "In Progress",
      value: jobs.filter((j) => j.status === "in_progress").length,
      icon: Clock,
      tone: "text-info",
    },
    {
      label: "Completed",
      value: jobs.filter((j) => j.status === "complete").length,
      icon: CheckCircle2,
      tone: "text-success",
    },
  ];

  const recent = [...jobs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A quick overview of your team's workload."
        action={
          <Button asChild>
            <Link to="/jobs">View all jobs</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{s.label}</p>
                {loading ? (
                  <Skeleton className="mt-2 h-8 w-12" />
                ) : (
                  <p className="mt-1 text-3xl font-bold tabular-nums">{s.value}</p>
                )}
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
                <s.icon className={`size-5 ${s.tone}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)
          ) : recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No jobs yet.</p>
          ) : (
            recent.map((job) => {
              const emp = employeeById(job.assignedEmployee);
              return (
                <div
                  key={job.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {emp ? initials(emp.name) : "—"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{job.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {emp?.name ?? "Unassigned"} · Due {formatDate(job.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <PriorityBadge priority={job.priority} />
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
