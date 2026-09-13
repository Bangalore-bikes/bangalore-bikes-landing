import type { Metadata } from "next";

import { Container, Tag } from "@/components/common/section";
import { PhoneIcon } from "@/components/icons/phone";
import { LINKS } from "@/data/site";
import {
  NATIONAL_NUMBERS,
  SOS_LINKS,
  SOS_RULES,
  TOWING_SERVICES,
} from "@/data/sos";

export const metadata: Metadata = {
  title: "SOS",
  description:
    "Emergency numbers, towing and roadside rescue, blood banks and the community SOS group rules for riders in Bangalore.",
};

const number = (index: number) => String(index + 1).padStart(2, "0");

export default function SosPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-sos text-white">
        <Container className="pt-18 pb-16">
          <div className="mb-5 flex items-center gap-3">
            <span className="relative block h-3.5 w-3.5">
              <span className="absolute inset-0 rounded-full bg-white" />
              <span className="animate-ring absolute inset-0 rounded-full bg-white" />
            </span>
            <span className="text-[13px] font-bold tracking-[0.18em] uppercase">
              Emergency · read this first
            </span>
          </div>

          <h1 className="font-display m-0 mb-6 text-[clamp(56px,12vw,180px)] leading-[0.9] font-black tracking-[-0.05em]">
            SOS
          </h1>

          <p className="m-0 mb-9 max-w-[720px] text-[clamp(17px,1.6vw,22px)] leading-snug">
            Just <em>SOS</em> and follow ups, no other stuff or you&apos;re out!
            Casual emergencies like bike broke down / stranded are{" "}
            <strong>prohibited from 12 am to 7 am</strong>.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {NATIONAL_NUMBERS.map((entry) => (
              <a
                key={entry.num}
                href={entry.tel}
                className="flex items-center justify-between rounded-2xl border border-white/30 bg-black/25 px-5.5 py-4.5 text-white transition-colors hover:bg-white hover:text-sos"
              >
                <div>
                  <div className="text-xs font-bold tracking-[0.14em] uppercase opacity-85">
                    {entry.label}
                  </div>
                  <div className="font-display text-[34px] leading-tight font-black">
                    {entry.num}
                  </div>
                </div>
                <PhoneIcon className="h-6.5 w-6.5" />
              </a>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-20">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div data-reveal="">
            <h2 className="font-display m-0 mb-4.5 text-[clamp(26px,3vw,40px)] leading-tight font-bold tracking-[-0.03em] uppercase">
              How to post in the SOS group
            </h2>
            <p className="m-0 mb-6 leading-relaxed text-fg2">
              Please use this group only in case of emergencies, or if you need
              any help from the community. Carry forward other discussions to{" "}
              <em>Off-Topic</em> or <em>General Discussions</em>. Please read
              each group&apos;s description, where to post and what to post.
            </p>
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center gap-2.5 rounded-full bg-fg px-6 font-bold text-bg transition-colors hover:bg-acc hover:text-acc-fg"
            >
              Join the WhatsApp community →
            </a>
          </div>

          <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
            {SOS_RULES.map((rule, index) => (
              <li
                key={rule}
                data-reveal=""
                className="flex items-start gap-5 rounded-2xl border border-line bg-bg2 px-6 py-5.5"
              >
                <span className="font-display min-w-7 pt-0.5 text-sm font-bold text-sos">
                  {number(index)}
                </span>
                <span className="text-[17px] leading-snug font-medium">
                  {rule}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      <section className="border-y border-line bg-bg2">
        <Container className="py-20">
          <h2
            data-reveal=""
            className="font-display m-0 mb-2.5 text-[clamp(26px,3vw,40px)] leading-tight font-bold tracking-[-0.03em] uppercase"
          >
            Towing &amp; roadside rescue
          </h2>
          <p data-reveal="" className="m-0 mb-9 text-fg2">
            Save these before your next ride. Tap to call.
          </p>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {TOWING_SERVICES.map((service) => (
              <div
                key={service.name}
                data-reveal=""
                className="flex flex-col gap-3.5 rounded-[18px] border border-line bg-bg p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-[17px] font-bold tracking-[-0.02em]">
                      {service.name}
                    </div>
                    <div className="mt-1 text-sm text-fg2">{service.note}</div>
                  </div>
                  <Tag>{service.tag}</Tag>
                </div>

                <div className="flex flex-col items-start justify-between gap-2.5 sm:flex-row sm:items-center">
                  <a
                    href={service.tel}
                    className="inline-flex h-12 items-center gap-2.5 rounded-full bg-sos px-5 text-base font-extrabold tracking-[0.02em] text-white transition-[filter] hover:brightness-110"
                  >
                    {service.num}
                  </a>
                  <a
                    href={service.map}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-fg2 underline underline-offset-4"
                  >
                    Map / site ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="pt-20 pb-25">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {SOS_LINKS.map((link) => (
            <a
              key={link.title}
              data-reveal=""
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[200px] flex-col justify-between gap-6 rounded-[18px] border border-line bg-bg2 p-6.5 transition-colors hover:border-sos"
            >
              <div className="text-xs font-bold tracking-[0.14em] text-sos uppercase">
                {link.tag}
              </div>
              <div>
                <div className="font-display mb-2 text-[19px] font-bold tracking-[-0.02em]">
                  {link.title}
                </div>
                <div className="text-sm leading-relaxed text-fg2">
                  {link.desc}
                </div>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </>
  );
}
