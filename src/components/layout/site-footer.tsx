import Link from "next/link";

import { Container } from "@/components/common/section";
import { LINKS, NAV_ITEMS, SITE } from "@/data/site";

const COLUMN_TITLE =
  "mb-1 text-xs font-bold tracking-[0.14em] text-fg2 uppercase";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg2">
      <Container className="pt-14 pb-8">
        <div className="mb-12 flex flex-col justify-between gap-10 md:flex-row md:flex-wrap">
          <div className="max-w-[320px]">
            <div className="font-display mb-3 text-[22px] font-black tracking-[-0.03em] uppercase">
              {SITE.name}
            </div>
            <p className="m-0 text-[15px] leading-relaxed text-fg2">
              Free, independent, non-profit. We plan the ride and we go. Ride
              safe, ride together.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 md:gap-14">
            <div className="flex flex-col gap-2.5">
              <div className={COLUMN_TITLE}>Site</div>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[15px] font-medium transition-colors hover:text-acc"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <div className={COLUMN_TITLE}>Community</div>
              <a
                href={LINKS.reddit}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-medium transition-colors hover:text-acc"
              >
                Reddit ↗
              </a>
              <a
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-medium transition-colors hover:text-acc"
              >
                WhatsApp ↗
              </a>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-medium transition-colors hover:text-acc"
              >
                GitHub ↗
              </a>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="mb-1 text-xs font-bold tracking-[0.14em] text-sos uppercase">
                Emergency
              </div>
              <a href="tel:112" className="text-[15px] font-bold">
                112 · All emergencies
              </a>
              <a href="tel:108" className="text-[15px] font-bold">
                108 · Ambulance
              </a>
              <Link href="/sos" className="text-[15px] font-bold text-sos">
                SOS page →
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-line pt-6 text-[13px] text-fg2 md:flex-row">
          <span>
            © {new Date().getFullYear()} {SITE.name} · {SITE.subreddit}
          </span>
          <span>Namma Bengaluru · Karnataka</span>
        </div>
      </Container>
    </footer>
  );
}
