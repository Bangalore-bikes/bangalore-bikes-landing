import Link from "next/link";

import { Container } from "@/components/common/section";

export function SosBand() {
  return (
    <Container className="py-24">
      <div
        data-reveal=""
        className="relative flex flex-col items-start justify-between gap-10 overflow-hidden rounded-[28px] bg-sos p-7 text-white md:flex-row md:items-center md:p-16"
      >
        <div
          aria-hidden="true"
          className="animate-spin-slow absolute -top-20 -right-20 h-90 w-90 rounded-full border-[60px] border-white/8 border-t-white/18"
        />
        <div className="relative max-w-[620px]">
          <div className="mb-4.5 text-[13px] font-bold tracking-[0.18em] uppercase opacity-85">
            Stranded? Crashed? Need help?
          </div>
          <h2 className="font-display m-0 mb-5 text-[clamp(36px,6vw,84px)] leading-[0.95] font-black tracking-[-0.04em] uppercase">
            SOS
          </h2>
          <p className="m-0 text-[clamp(16px,1.5vw,20px)] leading-relaxed opacity-95">
            Emergency numbers, towing, blood banks and the community SOS group
            rules. Drop your live location first. Keep texts minimal. Someone
            will come.
          </p>
        </div>
        <Link
          href="/sos"
          className="font-display relative inline-flex h-16 shrink-0 items-center justify-center rounded-full bg-white px-9 text-[17px] font-extrabold text-sos transition-transform hover:scale-104"
        >
          Open SOS page →
        </Link>
      </div>
    </Container>
  );
}
