import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/jobflow/page-header";
import { useJobStore } from "@/lib/job-store";
import { initials } from "@/lib/jobflow-utils";

export const Route = createFileRoute("/employees")({
  head: () => ({
    meta: [
      { title: "Employees — JobFlow" },
      {
        name: "description",
        content: "See your team members, their roles and how many jobs they are assigned.",
      },
      { property: "og:title", content: "Employees — JobFlow" },
      {
        property: "og:description",
        content: "See your team members, their roles and how many jobs they are assigned.",
      },
    ],
  }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { employees, jobs, loading } = useJobStore();

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Your team and their current workload." />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {employees.map((emp) => {
            const assigned = jobs.filter((j) => j.assignedEmployee === emp.id);
            const open = assigned.filter((j) => j.status !== "complete").length;
            return (
              <Card key={emp.id} className="shadow-card">
                <CardContent className="space-y-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                      {initials(emp.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{emp.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{emp.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Assigned jobs</span>
                    <span className="font-semibold">{assigned.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{open} still open</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
