import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Upload, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export default function CVManagement() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: cvs, isLoading, refetch } = trpc.cv.list.useQuery();
  const uploadCv = trpc.cv.upload.useMutation();
  const updateCv = trpc.cv.update.useMutation();
  const deleteCv = trpc.cv.delete.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Datei zu groß (max. 10MB)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Bitte wählen Sie eine Datei aus");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result?.toString().split(",")[1];
        if (!base64) {
          toast.error("Fehler beim Lesen der Datei");
          setUploading(false);
          return;
        }

        try {
          await uploadCv.mutateAsync({
            fileName: selectedFile.name,
            fileData: base64,
            mimeType: selectedFile.type || "application/pdf",
            isDefault: (cvs?.length || 0) === 0,
          });

          toast.success("CV erfolgreich hochgeladen");
          setSelectedFile(null);
          refetch();
        } catch (error) {
          toast.error("Fehler beim Hochladen");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("Fehler beim Hochladen");
      setUploading(false);
    }
  };

  const handleSetDefault = async (cvId: number) => {
    try {
      await updateCv.mutateAsync({ id: cvId, isDefault: true });
      toast.success("Standard-CV aktualisiert");
      refetch();
    } catch (error) {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleDelete = async (cvId: number) => {
    if (!confirm("Möchten Sie diesen CV wirklich löschen?")) return;

    try {
      await deleteCv.mutateAsync({ id: cvId });
      toast.success("CV gelöscht");
      refetch();
    } catch (error) {
      toast.error("Fehler beim Löschen");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CV Verwaltung</h1>
          <p className="text-gray-600">Laden Sie Ihre Lebensläufe hoch und verwalten Sie diese</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Neuen CV hochladen</CardTitle>
            <CardDescription>
              Laden Sie Ihren Lebenslauf im PDF-Format hoch (max. 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cv-file">Datei auswählen</Label>
                <Input
                  id="cv-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="mt-2"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Ausgewählt: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Hochladen
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CVs List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Meine CVs ({cvs?.length || 0})</h2>

          {cvs && cvs.length > 0 ? (
            cvs.map((cv) => (
              <Card key={cv.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{cv.name}</CardTitle>
                        {cv.isDefault && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Standard
                          </Badge>
                        )}
                        {cv.atsOptimized && (
                          <Badge variant="secondary">ATS-optimiert</Badge>
                        )}
                      </div>
                      <CardDescription className="mt-2">
                        {cv.industry && <span>Branche: {cv.industry} • </span>}
                        Hochgeladen: {new Date(cv.createdAt).toLocaleDateString("de-DE")}
                        {cv.fileSize && (
                          <span> • Größe: {(cv.fileSize / 1024).toFixed(2)} KB</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {!cv.isDefault && (
                      <Button
                        onClick={() => handleSetDefault(cv.id)}
                        variant="outline"
                        size="sm"
                        disabled={updateCv.isPending}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Als Standard setzen
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-2" />
                        Öffnen
                      </a>
                    </Button>
                    <Button
                      onClick={() => handleDelete(cv.id)}
                      variant="ghost"
                      size="sm"
                      disabled={deleteCv.isPending}
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
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Noch keine CVs hochgeladen</p>
                <p className="text-sm text-gray-500 mt-2">
                  Laden Sie Ihren ersten Lebenslauf hoch, um zu beginnen
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
