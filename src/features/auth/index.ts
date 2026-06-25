/** Feature auth — API publique (barrel). */
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
export { OnboardingWizard } from "./components/OnboardingWizard";
export { DemoRoleSwitcher } from "./components/DemoRoleSwitcher";
export { login, registerFounder, signInAs, signOut } from "./api/actions";
export type { AuthResult } from "./api/actions";
