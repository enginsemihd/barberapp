import BottomNav from "@/components/BottomNav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <main className="flex-1 w-full max-w-[480px] mx-auto px-4 pt-6 pb-4">{children}</main>
      <div className="w-full max-w-[480px] mx-auto">
        <BottomNav />
      </div>
    </div>
  );
}
