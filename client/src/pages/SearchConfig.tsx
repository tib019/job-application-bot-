import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function SearchConfig() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    keywords: "",
    locations: "",
    industries: "",
    platforms: "indeed,stepstone",
    isActive: true,
  });

  const { data: configs, isLoading, refetch } = trpc.searchConfig.list.useQuery();
  const createConfig = trpc.searchConfig.create.useMutation();
  const updateConfig = trpc.searchConfig.update.useMutation();
  const deleteConfig = trpc.searchConfig.delete.useMutation();

  const resetForm = () => {
    setFormData({
      name: "",
      keywords: "",
      locations: "",
      industries: "",
      platforms: "indeed,stepstone",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      locations: formData.locations.split(",").map((l) => l.trim()).filter(Boolean),
      industries: formData.industries.split(",").map((i) => i.trim()).filter(Boolean),
      platforms: formData.platforms.split(",").map((p) => p.trim()).filter(Boolean),
      isActive: formData.isActive,
    };

    try {
      if (editingId) {
        await updateConfig.mutateAsync({ id: editingId, ...data });
        toast.success("Konfiguration aktualisiert");
      } else {
        await createConfig.mutateAsync(data);
        toast.success("Konfiguration erstellt");
      }
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleEdit = (config: any) => {
    setFormData({
      name: config.name,
      keywords: JSON.parse(config.keywords || "[]").join(", "),
      locations: JSON.parse(config.locations || "[]").join(", "),
      industries: JSON.parse(config.industries || "[]").join(", "),
      platforms: JSON.parse(config.platforms || "[]").join(", "),
      isActive: config.isActive,
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Möchten Sie diese Konfiguration wirklich löschen?")) return;

    try {
      await deleteConfig.mutateAsync({ id });
      toast.success("Konfiguration gelöscht");
      refetch();
    } catch (error) {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await updateConfig.mutateAsync({ id, isActive: !isActive });
      toast.success(`Konfiguration ${!isActive ? "aktiviert" : "deaktiviert"}`);
      refetch();
    } catch (error) {
      toast.error("Fehler beim Aktualisieren");
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
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suchkonfigurationen</h1>
          <p className="text-gray-600">
            Definieren Sie Ihre Job-Suchkriterien für die automatische Stellensuche
          </p>
        </div>

        {/* Add Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="mb-6">
            <Plus className="w-4 h-4 mr-2" />
            Neue Konfiguration
          </Button>
        )}

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Konfiguration bearbeiten" : "Neue Konfiguration"}</CardTitle>
              <CardDescription>
                Geben Sie Suchkriterien ein (mehrere Werte mit Komma trennen)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name der Konfiguration</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Software Developer Jobs"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Suchbegriffe</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="z.B. Software Developer, Full Stack, React"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="locations">Standorte</Label>
                  <Input
                    id="locations"
                    value={formData.locations}
                    onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                    placeholder="z.B. Berlin, München, Remote"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="industries">Branchen</Label>
                  <Input
                    id="industries"
                    value={formData.industries}
                    onChange={(e) => setFormData({ ...formData, industries: e.target.value })}
                    placeholder="z.B. IT, Software, Technology"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="platforms">Plattformen</Label>
                  <Input
                    id="platforms"
                    value={formData.platforms}
                    onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                    placeholder="indeed, stepstone"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Aktiv</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createConfig.isPending || updateConfig.isPending}>
                    {(createConfig.isPending || updateConfig.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingId ? "Aktualisieren" : "Erstellen"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Configs List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Konfigurationen ({configs?.length || 0})
          </h2>

          {configs && configs.length > 0 ? (
            configs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{config.name}</CardTitle>
                        <Badge variant={config.isActive ? "default" : "secondary"}>
                          {config.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        Erstellt: {new Date(config.createdAt).toLocaleDateString("de-DE")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div>
                      <strong>Suchbegriffe:</strong>{" "}
                      {JSON.parse(config.keywords || "[]").join(", ")}
                    </div>
                    <div>
                      <strong>Standorte:</strong>{" "}
                      {JSON.parse(config.locations || "[]").join(", ")}
                    </div>
                    <div>
                      <strong>Branchen:</strong>{" "}
                      {JSON.parse(config.industries || "[]").join(", ")}
                    </div>
                    <div>
                      <strong>Plattformen:</strong>{" "}
                      {JSON.parse(config.platforms || "[]").join(", ")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEdit(config)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </Button>
                    <Button
                      onClick={() => handleToggleActive(config.id, config.isActive ?? false)}
                      variant="outline"
                      size="sm"
                      disabled={updateConfig.isPending}
                    >
                      {config.isActive ? "Deaktivieren" : "Aktivieren"}
                    </Button>
                    <Button
                      onClick={() => handleDelete(config.id)}
                      variant="ghost"
                      size="sm"
                      disabled={deleteConfig.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Löschen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Noch keine Suchkonfigurationen erstellt</p>
                <p className="text-sm text-gray-500 mt-2">
                  Erstellen Sie Ihre erste Konfiguration, um die automatische Jobsuche zu starten
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
