import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Calendar, Building2 } from "lucide-react";

export default function Applications() {
  const { data: applications, isLoading } = trpc.applications.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.applications.stats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Ausstehend" },
      submitted: { variant: "default", label: "Eingereicht" },
      in_review: { variant: "outline", label: "In Prüfung" },
      interview_scheduled: { variant: "default", label: "Interview geplant" },
      rejected: { variant: "destructive", label: "Abgelehnt" },
      accepted: { variant: "default", label: "Angenommen" },
      withdrawn: { variant: "outline", label: "Zurückgezogen" },
      failed: { variant: "destructive", label: "Fehlgeschlagen" },
    };

    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meine Bewerbungen</h1>
          <p className="text-gray-600">Übersicht über alle eingereichten Bewerbungen</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
              <p className="text-xs text-muted-foreground">Ausstehend</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats?.submitted || 0}</div>
              <p className="text-xs text-muted-foreground">Eingereicht</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats?.accepted || 0}</div>
              <p className="text-xs text-muted-foreground">Angenommen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</div>
              <p className="text-xs text-muted-foreground">Abgelehnt</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications && applications.length > 0 ? (
            applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Bewerbung #{app.id}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(app.createdAt).toLocaleDateString("de-DE")}
                        </span>
                        {app.submittedAt && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Eingereicht: {new Date(app.submittedAt).toLocaleDateString("de-DE")}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  {app.notes && (
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Notizen:</strong> {app.notes}
                    </p>
                  )}
                  {app.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                      <p className="text-sm text-red-800">
                        <strong>Fehler:</strong> {app.errorMessage}
                      </p>
                      {app.retryCount && app.retryCount > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Wiederholungsversuche: {app.retryCount}
                        </p>
                      )}
                    </div>
                  )}
                  {app.coverLetter && (
                    <details className="mt-3">
                      <summary className="text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-800">
                        Anschreiben anzeigen
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                        {app.coverLetter.substring(0, 500)}
                        {app.coverLetter.length > 500 && "..."}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Noch keine Bewerbungen eingereicht</p>
                <p className="text-sm text-gray-500 mt-2">
                  Bewerbungen werden automatisch vom System erstellt
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
