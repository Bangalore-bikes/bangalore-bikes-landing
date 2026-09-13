import { LINKS } from "./site";

export type WikiEntry = { readonly h: string; readonly d: string };

export type WikiSection = {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly intro: string;
  readonly items: readonly WikiEntry[];
  readonly link?: string;
  readonly linkLabel?: string;
};

export const WIKI_SECTIONS: readonly WikiSection[] = [
  {
    id: "subreddit-rules",
    label: "Subreddit rules",
    title: "Subreddit Rules & Etiquette",
    intro:
      "A guide to basic community behavior and subreddit rules that is expected in our community from you.",
    items: [
      {
        h: "Be civil",
        d: "No harassment, gatekeeping or brand wars. Disagree with the point, not the person.",
      },
      {
        h: "Bangalore-relevant",
        d: "Posts should relate to riding in and around Bangalore. General bike talk goes to r/Indiabikes.",
      },
      {
        h: "No sales or promos",
        d: "Selling, affiliate links and dealer promotions are removed. Use the flaired monthly thread.",
      },
      {
        h: "Flair your posts",
        d: "Ride report, Question, Meetup, SOS. Unflaired posts get removed.",
      },
      {
        h: "Search before asking",
        d: "Common questions (first bike, gear, service) are in this wiki.",
      },
      {
        h: "Report, don't retaliate",
        d: "Use the report button. Mods are active on both forums.",
      },
    ],
    link: LINKS.reddit,
    linkLabel: "Open r/bangalorebikes",
  },
  {
    id: "ride-rules",
    label: "Ride rules",
    title: "Ride Rules",
    intro:
      "Essential safety rules and guidelines to be followed while joining our group rides.",
    items: [
      {
        h: "Full gear, always",
        d: "Certified helmet mandatory. Jacket, gloves and riding shoes strongly recommended on every group ride.",
      },
      {
        h: "Lead and sweep",
        d: "Nobody overtakes the lead. Nobody falls behind the sweep. Staggered formation on highways.",
      },
      {
        h: "Ride your own ride",
        d: "No racing, no wheelies, no stunts. Ride at the pace you're comfortable with.",
      },
      {
        h: "Full tank, checked bike",
        d: "Fuel up before the meet point. Tyres, brakes, chain and lights checked the night before.",
      },
      {
        h: "Regroup points",
        d: "Regroup at every turn-off and fuel stop. Wait for the sweep before moving on.",
      },
      {
        h: "Papers and contacts",
        d: "Carry DL, RC, insurance and PUC. Emergency contact saved in your phone as ICE.",
      },
    ],
  },
  {
    id: "whatsapp-rules",
    label: "WhatsApp rules",
    title: "WhatsApp Group Rules",
    intro:
      "Code of conduct for members of our WhatsApp groups. Read each group's description: where to post and what to post.",
    items: [
      {
        h: "SOS is for SOS",
        d: "Only emergencies and follow-ups. Casual breakdowns are prohibited 12 AM to 7 AM.",
      },
      {
        h: "Right group, right topic",
        d: "Ride planning in General, everything else in Off-Topic. No cross-posting.",
      },
      {
        h: "No forwards, no spam",
        d: "No good-morning messages, no chain forwards, no sales.",
      },
      {
        h: "Keep texts minimal",
        d: "Say it once. Don't repeat what someone already said.",
      },
      {
        h: "Respect privacy",
        d: "No sharing numbers, live locations or photos of members outside the group.",
      },
      { h: "Mods have the final say", d: "Three warnings and you're out." },
    ],
    link: LINKS.whatsapp,
    linkLabel: "Join WhatsApp community",
  },
  {
    id: "emergency-contacts",
    label: "Emergency contacts",
    title: "Emergency Contacts",
    intro:
      "A list of important contacts like police, ambulance, towing services, and more.",
    items: [
      { h: "112 / 100 / 108", d: "Unified emergency, police, ambulance." },
      {
        h: "Towing & rescue",
        d: "RESCUE Roadside Assistance, IBCC Rescue, Sri Lakshmi Towing.",
      },
      {
        h: "Blood",
        d: "Friends2Support donor search, eRaktKosh availability.",
      },
      { h: "Police", d: "Bengaluru City Police senior officers list." },
    ],
    link: "/sos",
    linkLabel: "Open SOS page",
  },
] as const;
