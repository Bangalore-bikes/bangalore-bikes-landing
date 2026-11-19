import Link from "next/link";
import { BookOpen, MapPin, PenLine, Users, Wrench, type LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";

const ACTIONS: Array<{ href: string; title: string; text: string; icon: LucideIcon }> = [
  { href: "/rides", title: "Upcoming rides", text: "See what is planned and who is leading.", icon: MapPin },
  { href: "/write", title: "Write a post", text: "Share a ride report or a workshop find.", icon: PenLine },
  { href: "/maintenance", title: "Keep it running", text: "Garages, checklists and care notes.", icon: Wrench },
  { href: "/wiki", title: "Rider handbook", text: "Rules, safety and first-ride advice.", icon: BookOpen },
  { href: "/join", title: "Join the group", text: "Scan the code and meet the riders.", icon: Users },
];

export function QuickActions() {
  return (
    <section aria-label="Quick links" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {ACTIONS.map(({ href, title, text, icon: Icon }, index) => (
        <Reveal key={href} delay={index * 60}>
          <Link
            href={href}
            className="lift flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5"
          >
            <Icon className="size-5 text-dixie" aria-hidden="true" />
            <span className="font-semibold">{title}</span>
            <span className="text-sm leading-snug text-muted-foreground">{text}</span>
          </Link>
        </Reveal>
      ))}
    </section>
  );
}
