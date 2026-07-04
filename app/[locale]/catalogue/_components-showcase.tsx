"use client";

import { useState } from "react";
import { FolderOpen, ShieldCheck } from "lucide-react";

import {
  ComprehensionTable,
  RadarChart,
  sampleScore,
  sampleScoreAfter,
} from "@/features/scoring";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Chip,
  DataTable,
  EmptyState,
  Field,
  FileUpload,
  Input,
  Modal,
  RadioGroup,
  RadioItem,
  Select,
  SelectItem,
  Skeleton,
  Stepper,
  Textarea,
  toast,
  type Column,
} from "@/shared/ui";

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

type DemoRow = { id: string; projet: string; secteur: string; score: number };

const demoRows: DemoRow[] = [
  { id: "1", projet: "AgriConnect", secteur: "Agritech", score: 72 },
  { id: "2", projet: "PayNow", secteur: "Fintech", score: 58 },
  { id: "3", projet: "EduPlus", secteur: "Edtech", score: 81 },
  { id: "4", projet: "HealthLink", secteur: "Santé", score: 64 },
];

const demoColumns: Column<DemoRow>[] = [
  {
    key: "projet",
    header: "Projet",
    sortable: true,
    sortValue: (r) => r.projet,
    cell: (r) => <span className="font-medium">{r.projet}</span>,
  },
  {
    key: "secteur",
    header: "Secteur",
    sortable: true,
    sortValue: (r) => r.secteur,
    cell: (r) => <Badge variant="outline">{r.secteur}</Badge>,
  },
  {
    key: "score",
    header: "Score",
    sortable: true,
    sortValue: (r) => r.score,
    cell: (r) => <span className="tabular">{r.score}</span>,
  },
];

export function ComponentsShowcase() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(true);

  return (
    <div className="space-y-12">
      <Block title="Boutons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Créer mon espace</Button>
          <Button variant="dark">Sombre</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Discret</Button>
          <Button variant="danger">Supprimer</Button>
          <Button size="sm">Petit</Button>
          <Button loading>Chargement</Button>
          <Button disabled>Désactivé</Button>
        </div>
      </Block>

      <Block title="Formulaire">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Field label="Nom du projet" required description="Visible par toi seul.">
              <Input placeholder="Ex. AgriConnect" />
            </Field>
            <Field label="Email" error="Un email valide, pour retrouver ton espace.">
              <Input type="email" placeholder="toi@exemple.com" />
            </Field>
            <Field label="Secteur">
              <Select placeholder="Choisis un secteur">
                <SelectItem value="agritech">Agritech</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="edtech">Edtech</SelectItem>
              </Select>
            </Field>
            <Field label="Décris ton idée" description="20 caractères minimum.">
              <Textarea placeholder="Mon projet aide les agriculteurs à…" />
            </Field>
            <Field label="Type de projet">
              <RadioGroup defaultValue="digital">
                <RadioItem value="digital" label="Digital" />
                <RadioItem value="terrain" label="Terrain" />
              </RadioGroup>
            </Field>
            <Checkbox label="J'accepte la politique de confidentialité (RGPD)" />
          </CardContent>
        </Card>
      </Block>

      <Block title="Badges & sceaux">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutre</Badge>
          <Badge variant="primary">En cours</Badge>
          <Badge variant="success">Certifiable</Badge>
          <Badge variant="warning">À retravailler</Badge>
          <Badge variant="danger">Hors cible</Badge>
          <Badge variant="outline">Brouillon</Badge>
          <Badge variant="verified">
            <ShieldCheck /> Vérifié par Ideaxion
          </Badge>
        </div>
      </Block>

      <Block title="Chips (filtres)">
        <div className="flex flex-wrap gap-2">
          <Chip selected={filter} onClick={() => setFilter((v) => !v)}>
            Agritech
          </Chip>
          <Chip>Fintech</Chip>
          <Chip onRemove={() => toast("Filtre retiré")}>Edtech</Chip>
        </div>
      </Block>

      <Block title="Cartes">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tableau de compréhension</CardTitle>
              <CardDescription>
                Essence · viabilité · scalabilité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprends ton projet avant de le défendre.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Simulateur de pitch</CardTitle>
              <CardDescription>S&apos;entraîner sans peur</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm">Lancer une session</Button>
            </CardContent>
          </Card>
        </div>
      </Block>

      <Block title="Stepper">
        <Stepper steps={["Idée", "Questions", "Bilan"]} current={1} />
      </Block>

      <Block title="Overlays & feedback">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setOpen(true)}>
            Ouvrir une modale
          </Button>
          <Button variant="ghost" onClick={() => toast.success("Projet certifié")}>
            Toast succès
          </Button>
          <Button
            variant="ghost"
            onClick={() => toast.error("Transition non autorisée")}
          >
            Toast erreur
          </Button>
        </div>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Confirmer la certification"
          description="Le double sign-off engage ton jugement sur le label."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setOpen(false)}>Certifier</Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">
            Cette action est tracée dans l&apos;audit log.
          </p>
        </Modal>
      </Block>

      <Block title="Skeletons">
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Block>

      <Block title="État vide">
        <EmptyState
          icon={FolderOpen}
          title="Aucun projet pour l'instant"
          description="Lance ton diagnostic pour comprendre ton projet."
          action={<Button size="sm">Lancer mon diagnostic</Button>}
        />
      </Block>

      <Block title="Upload">
        <FileUpload onFileChange={(f) => f && toast(`Sélectionné : ${f.name}`)} />
      </Block>

      <Block title="DataTable">
        <DataTable
          columns={demoColumns}
          data={demoRows}
          getRowKey={(r) => r.id}
          searchable
          pageSize={3}
          onRowClick={(r) => toast(r.projet)}
        />
      </Block>

      <Block title="Signature — Radar de Collision">
        <div className="flex flex-wrap items-center gap-8">
          <RadarChart score={sampleScore} size={300} />
          <RadarChart
            score={sampleScore}
            compare={sampleScoreAfter}
            size={300}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          À droite : superposition avant/après (pointillés = « après »).
        </p>
      </Block>

      <Block title="Tableau de compréhension (vue porteur)">
        <ComprehensionTable score={sampleScore} />
      </Block>
    </div>
  );
}
