import { PublicFooter, PublicHeader } from "@/shared/layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />
      <div id="main-content" className="flex-1">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
