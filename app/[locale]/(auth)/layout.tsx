/** Coquille auth — chaque page gère son propre layout (login=split screen, register=centré). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen w-full flex-col">{children}</div>;
}
