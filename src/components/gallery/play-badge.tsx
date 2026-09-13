export function PlayBadge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/55 bg-[rgba(8,8,10,.55)] text-[17px] leading-none text-white backdrop-blur-[4px]"
    >
      ▶
    </span>
  );
}
