/**
 * Design system « Aube » — API publique (barrel).
 * ARCHITECTURE_FRONTEND.md §10 : un seul jeu de composants pour tous les
 * espaces. Composants SANS métier (un Badge ignore ce qu'est un projet).
 *
 * Import : `import { Button, Card } from "@/shared/ui"` (jamais les internes).
 */

// Primitifs
export { Button, buttonVariants, type ButtonProps } from "./Button";
export { Input } from "./Input";
export { Textarea } from "./Textarea";
export { Field, type FieldProps } from "./Field";
export { Select, SelectItem } from "./Select";
export { Checkbox } from "./Checkbox";
export { RadioGroup, RadioItem } from "./Radio";
export { Badge, badgeVariants, type BadgeProps } from "./Badge";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";
export { Chip, type ChipProps } from "./Chip";

// Overlays & feedback
export { Modal, ModalClose, ModalTrigger, type ModalProps } from "./Modal";
export { Spinner } from "./Spinner";
export { Skeleton } from "./Skeleton";
export { EmptyState, type EmptyStateProps } from "./EmptyState";
export { ThemeToggle } from "./ThemeToggle";
export { toast } from "./toast";

// Composés
export { DataTable, type Column, type DataTableProps } from "./DataTable";
export { Stepper, type StepperProps } from "./Stepper";
export { FileUpload, type FileUploadProps } from "./FileUpload";
