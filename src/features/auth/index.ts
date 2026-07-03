/** Feature auth — API publique (barrel). */
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
export { OnboardingWizard } from "./components/OnboardingWizard";
export { DemoRoleSwitcher } from "./components/DemoRoleSwitcher";
export { EmailVerifyNudge } from "./components/EmailVerifyNudge";
export {
  login,
  registerFounder,
  signInAs,
  signOut,
  verifyEmail,
  resendVerification,
} from "./api/actions";
export type { AuthResult } from "./api/actions";
