import { ApiError } from "@/shared/api/client";
import { Card, CardContent } from "@/shared/ui";
import { getDocuments } from "./api";
import { DocumentsManagerClient } from "./DocumentsManagerClient";

/**
 * Data room du porteur (BESOINS_PORTEUR cas 8).
 * Charge la liste initiale côté serveur, délègue les interactions au client.
 * Upload : presigned PUT MinIO (le navigateur uploade directement, l'API ne fait jamais
 * transiter les octets) → confirmation backend (vérification taille + type réels).
 */
export async function DocumentsManager() {
  let docs: Awaited<ReturnType<typeof getDocuments>> = [];
  try {
    docs = await getDocuments();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h3 className="font-display text-base font-bold">Mes documents</h3>
        <DocumentsManagerClient initialDocs={docs} />
      </CardContent>
    </Card>
  );
}
