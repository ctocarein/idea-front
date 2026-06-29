/** Feature academy — apprendre & construire guidé. Barrel. */
export { AcademyModules } from "./components/AcademyModules";
export { AcademyProgress } from "./components/AcademyProgress";
export { LessonView } from "./components/LessonView";
export { GuidedBuilder } from "./components/GuidedBuilder";
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
  type GuidedSessionData,
  type GuidedResult,
} from "./actions";
