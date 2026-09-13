import { Container } from "@/components/common/section";
import { RedditIcon } from "@/components/icons/reddit";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { LINKS } from "@/data/site";

const CARD =
  "flex items-center justify-between gap-5 rounded-card border border-line bg-bg p-7.5 transition-colors hover:border-acc";

export function JoinSection() {
  return (
    <section className="border-t border-line bg-bg2">
      <Container className="py-24">
        <h2
          data-reveal=""
          className="font-display m-0 mb-11 text-[clamp(34px,7vw,104px)] leading-[0.95] font-black tracking-[-0.04em] uppercase"
        >
          Two wheels.
          <br />
          <span className="text-acc">One tribe.</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a
            data-reveal=""
            href={LINKS.reddit}
            target="_blank"
            rel="noopener noreferrer"
            className={CARD}
          >
            <div>
              <div className="mb-2 text-xs font-bold tracking-[0.14em] text-fg2 uppercase">
                Reddit
              </div>
              <div className="font-display text-[22px] font-bold tracking-[-0.02em]">
                r/bangalorebikes
              </div>
              <div className="mt-1.5 text-[15px] text-fg2">
                Discussions, ride posts, wiki, memes.
              </div>
            </div>
            <RedditIcon className="h-11 w-11 shrink-0" />
          </a>

          <a
            data-reveal=""
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={CARD}
          >
            <div>
              <div className="mb-2 text-xs font-bold tracking-[0.14em] text-fg2 uppercase">
                WhatsApp
              </div>
              <div className="font-display text-[22px] font-bold tracking-[-0.02em]">
                Community groups
              </div>
              <div className="mt-1.5 text-[15px] text-fg2">
                SOS, General, Off-Topic, ride planning.
              </div>
            </div>
            <WhatsAppIcon className="h-11 w-11 shrink-0" />
          </a>
        </div>
      </Container>
    </section>
  );
}
