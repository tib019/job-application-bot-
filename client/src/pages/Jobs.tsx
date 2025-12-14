import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ExternalLink, Briefcase, MapPin, Building2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Jobs() {
  const [statusFilter, setStatusFilter] = useState<string[]>(["new"]);
  const [platformFilter, setPlatformFilter] = useState<string>("");

  const { data: jobs, isLoading, refetch } = trpc.jobs.list.useQuery({
    status: statusFilter,
    platform: platformFilter || undefined,
    limit: 50,
  });

  const { data: stats } = trpc.jobs.stats.useQuery();
  const updateStatus = trpc.jobs.updateStatus.useMutation();
  const submitApplication = trpc.applications.submitApplication.useMutation();

  const handleApply = async (jobId: number) => {
    try {
      const result = await submitApplication.mutateAsync({ jobPostingId: jobId });
      if (result.success) {
        toast.success("Bewerbung erfolgreich eingereicht!");
        refetch();
      } else {
        toast.error(result.message || "Bewerbung fehlgeschlagen");
      }
    } catch (error) {
      toast.error("Fehler beim Einreichen der Bewerbung");
    }
  };

  const handleIgnore = async (jobId: number) => {
    try {
      await updateStatus.mutateAsync({ id: jobId, status: "ignored" });
      toast.success("Stelle ignoriert");
      refetch();
    } catch (error) {
      toast.error("Fehler beim Aktualisieren des Status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stellenangebote</h1>
          <p className="text-gray-600">Gefundene Job-Angebote durchsuchen und bewerben</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats?.new || 0}</div>
              <p className="text-xs text-muted-foreground">Neu</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats?.applied || 0}</div>
              <p className="text-xs text-muted-foreground">Beworben</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">{stats?.ignored || 0}</div>
              <p className="text-xs text-muted-foreground">Ignoriert</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={statusFilter[0] || "all"}
                  onValueChange={(value) => setStatusFilter(value === "all" ? [] : [value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="new">Neu</SelectItem>
                    <SelectItem value="reviewed">Geprüft</SelectItem>
                    <SelectItem value="applied">Beworben</SelectItem>
                    <SelectItem value="ignored">Ignoriert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Plattform</label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Plattform wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                    <SelectItem value="stepstone">StepStone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {job.hasAts && (
                          <Badge variant="outline" className="text-xs">
                            ATS: {job.atsSystem || "Detected"}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <Badge variant="secondary" className="capitalize">
                          {job.platform}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {job.relevanceScore && (
                        <Badge
                          variant={job.relevanceScore >= 70 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          Match: {job.relevanceScore}%
                        </Badge>
                      )}
                      <Badge
                        variant={
                          job.status === "new"
                            ? "default"
                            : job.status === "applied"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {job.status === "new"
                          ? "Neu"
                          : job.status === "applied"
                            ? "Beworben"
                            : job.status === "ignored"
                              ? "Ignoriert"
                              : job.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                  {job.salary && (
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Gehalt:</strong> {job.salary}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {job.status === "new" && (
                      <>
                        <Button
                          onClick={() => handleApply(job.id)}
                          disabled={submitApplication.isPending}
                          size="sm"
                        >
                          {submitApplication.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Bewerben
                        </Button>
                        <Button
                          onClick={() => handleIgnore(job.id)}
                          variant="outline"
                          size="sm"
                          disabled={updateStatus.isPending}
                        >
                          Ignorieren
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Stelle öffnen
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Keine Stellenangebote gefunden</p>
                <p className="text-sm text-gray-500 mt-2">
                  Passen Sie die Filter an oder warten Sie auf den nächsten Scheduler-Lauf
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
