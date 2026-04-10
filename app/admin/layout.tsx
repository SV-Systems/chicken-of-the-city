export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-zinc-50 text-zinc-900">
      {children}
    </div>
  );
}
