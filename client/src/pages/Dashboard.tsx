import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, FileText, CheckCircle, XCircle, Clock, PlayCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: overview, isLoading } = trpc.dashboard.overview.useQuery();
  const { data: schedulerStatus } = trpc.scheduler.status.useQuery();
  const triggerManual = trpc.scheduler.triggerManual.useMutation();

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
            <CardDescription>Bitte melden Sie sich an, um fortzufahren.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleManualRun = async () => {
    try {
      await triggerManual.mutateAsync();
    } catch (error) {
      console.error("Failed to trigger manual run:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Application Bot</h1>
          <p className="text-gray-600">Automatisches Bewerbungssystem mit ATS-Optimierung</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Jobs Found */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gefundene Stellen</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.jobs.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview?.jobs.new || 0} neue Stellen
              </p>
            </CardContent>
          </Card>

          {/* Applications Submitted */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bewerbungen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.applications.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview?.applications.submitted || 0} eingereicht
              </p>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erfolgsquote</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.applications.total
                  ? Math.round((overview.applications.accepted / overview.applications.total) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {overview?.applications.accepted || 0} angenommen
              </p>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.applications.pending || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview?.applications.rejected || 0} abgelehnt
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scheduler Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scheduler Status</CardTitle>
                <CardDescription>Automatische Jobsuche alle 4 Stunden</CardDescription>
              </div>
              <Badge variant={schedulerStatus?.initialized ? "default" : "secondary"}>
                {schedulerStatus?.initialized ? "Aktiv" : "Inaktiv"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Aktive Jobs: {schedulerStatus?.activeJobs || 0}
                </p>
                {overview?.recentRuns && overview.recentRuns.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Letzter Lauf:{" "}
                    {new Date(overview.recentRuns[0]!.startedAt).toLocaleString("de-DE")}
                  </p>
                )}
              </div>
              <Button
                onClick={handleManualRun}
                disabled={triggerManual.isPending}
                variant="outline"
              >
                {triggerManual.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" />
                )}
                Manuell starten
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Neueste Stellen</CardTitle>
              <CardDescription>Kürzlich gefundene Job-Angebote</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overview?.jobs.new ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600 mb-4">
                      {overview.jobs.new} neue Stellen verfügbar
                    </p>
                    <Link href="/jobs">
                      <Button variant="outline">Alle Stellen anzeigen</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Keine neuen Stellen gefunden
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Letzte Bewerbungen</CardTitle>
              <CardDescription>Kürzlich eingereichte Bewerbungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overview?.applications.submitted ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600 mb-4">
                      {overview.applications.submitted} Bewerbungen eingereicht
                    </p>
                    <Link href="/applications">
                      <Button variant="outline">Alle Bewerbungen anzeigen</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Noch keine Bewerbungen eingereicht
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/cvs">
            <Button variant="outline" className="w-full h-20">
              <div className="text-center">
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <span>CV verwalten</span>
              </div>
            </Button>
          </Link>
          <Link href="/search-config">
            <Button variant="outline" className="w-full h-20">
              <div className="text-center">
                <Briefcase className="w-6 h-6 mx-auto mb-2" />
                <span>Suchkriterien</span>
              </div>
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" className="w-full h-20">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                <span>Stellen durchsuchen</span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
