/** Feature academy — comprendre, structurer, consolider. Barrel. */
export { AcademyModules } from "./components/AcademyModules";
export { AcademyProgress } from "./components/AcademyProgress";
export { LessonView } from "./components/LessonView";
export { GuidedBuilder } from "./components/GuidedBuilder";
export { WeaknessCards } from "./components/WeaknessCards";
export { ModuleFlow } from "./components/ModuleFlow";
export { NeedFicheCard } from "./components/NeedFicheCard";
export {
  getAcademyProgress,
  getLessons,
  getLessonDetail,
  type LessonSummary,
  type LessonDetail,
} from "./api";
export {
  completeLesson,
  startGuidedSession,
  sendGuidedTurn,
  saveGuidedDraft,
  getMyWeaknesses,
  startModule,
  sendModuleTurn,
  prefillModuleForm,
  saveModuleForm,
  generateFiches,
  getModule,
  getMyFiches,
  validateFiche,
  type GuidedSessionData,
  type GuidedResult,
  type WeaknessData,
  type WeaknessListData,
  type ModuleSessionData,
  type NeedFicheData,
  type ModuleResult,
} from "./actions";
