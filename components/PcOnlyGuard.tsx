export default function PcOnlyGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="md:hidden flex flex-col items-center justify-center text-center px-6 py-16">
        <p className="font-semibold text-navy mb-2">この画面はPC・タブレット専用です</p>
        <p className="text-sm text-navy/60">
          お手数ですが、PCまたはタブレットの画面幅でアクセスしてください。
        </p>
      </div>
      <div className="hidden md:block">{children}</div>
    </>
  );
}
