import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { communityLinks } from "@/lib/community";
import { Button } from "@/components/ui/button";

export function WhatsAppJoin() {
  return (
    <section
      aria-labelledby="whatsapp-join-title"
      className="my-8 grid items-center gap-8 rounded-xl bg-secondary p-6 text-secondary-foreground sm:p-10 lg:grid-cols-[1.2fr_1fr]"
    >
      <div>
        <MessageCircle className="size-8 text-emerald-500" aria-hidden="true" />
        <h2
          id="whatsapp-join-title"
          className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
        >
          Good rides start with good company.
        </h2>
        <p className="mt-5 max-w-prose leading-relaxed text-muted-foreground">
          Join the Bangalore Bikes WhatsApp group for community conversations
          and ride planning. On your phone, tap the invite. On a bigger screen,
          scan the code with your phone.
        </p>
        <Button
          asChild
          className="mt-6 min-h-12 bg-emerald-500 px-5 text-black hover:bg-emerald-400"
        >
          <a href={communityLinks.whatsapp}>
            Join the WhatsApp group{" "}
            <ArrowUpRight className="ml-2 size-4" aria-hidden="true" />
          </a>
        </Button>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Joining is optional and may expose your phone number to other members.
          Group availability and invite links can change.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link
            href="/wiki/whatsapp"
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Read the privacy & group guide
          </Link>
          <a
            href={communityLinks.whatsappShort}
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Use the short invite link
          </a>
        </div>
      </div>
      <figure className="mx-auto w-full max-w-xs text-center">
        <a
          href={communityLinks.whatsapp}
          className="block rounded-xl bg-white p-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Image
            src="/whatsapp-invite.png"
            width={320}
            height={320}
            alt="Scan this QR code to open the Bangalore Bikes WhatsApp group invitation"
            className="h-auto w-full"
          />
        </a>
        <figcaption className="mt-4 text-sm text-muted-foreground">
          Scan to open the WhatsApp invitation.
        </figcaption>
        <div className="mt-2 flex flex-wrap justify-center gap-x-5 text-sm">
          <a
            href="/whatsapp-invite.png"
            download
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Download PNG
          </a>
          <a
            href="/whatsapp-invite.svg"
            download
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Download SVG
          </a>
        </div>
        <a
          href="/whatsapp-short-invite.png"
          download
          className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          Download the short-link QR
        </a>
      </figure>
    </section>
  );
}
