/** Feature pitch-editor (V1.2/V1.3) — éditeur + deck visuel assisté par IA. Barrel. */
export { PitchEditor } from "./components/PitchEditor";
export { DeckPanel } from "./components/DeckPanel";
export {
  getPitch,
  updateSection,
  generateSection,
  generateDeck,
  setTemplate,
  type PitchData,
  type PitchSection,
  type PitchResult,
} from "./actions";
