export function PageHeader({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mb-4.5 text-[13px] font-semibold tracking-[0.18em] text-acc uppercase">
        {eyebrow}
      </div>
      <h1 className="font-display m-0 text-[clamp(40px,8vw,112px)] leading-[0.92] font-black tracking-[-0.04em] uppercase">
        {children}
      </h1>
    </>
  );
}
