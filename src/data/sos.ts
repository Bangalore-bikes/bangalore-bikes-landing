export type EmergencyNumber = {
  readonly label: string;
  readonly num: string;
  readonly tel: string;
};

export const NATIONAL_NUMBERS: readonly EmergencyNumber[] = [
  { label: "All emergencies", num: "112", tel: "tel:112" },
  { label: "Ambulance", num: "108", tel: "tel:108" },
  { label: "Police", num: "100", tel: "tel:100" },
] as const;

export const SOS_RULES: readonly string[] = [
  "Elaborate the context and depth of situation.",
  "Drop live location in first message.",
  "Keep texts minimal.",
  "Don't ask / say the same thing someone already did.",
  "Once a problem is resolved, don't continue talking there.",
] as const;

export type TowingService = {
  readonly name: string;
  readonly note: string;
  readonly tag: string;
  readonly num: string;
  readonly tel: string;
  readonly map: string;
};

export const TOWING_SERVICES: readonly TowingService[] = [
  {
    name: "RESCUE Roadside Assistance",
    note: "Two-wheeler roadside assistance, Bangalore",
    tag: "Bikes",
    num: "099865 00500",
    tel: "tel:+919986500500",
    map: "https://g.co/kgs/ibWGnp2",
  },
  {
    name: "IBCC RESCUE",
    note: "Community rescue network",
    tag: "Bikes",
    num: "+91 95388 69608",
    tel: "tel:+919538869608",
    map: "https://startngo.co.in/",
  },
  {
    name: "Sri Lakshmi Towing service",
    note: "Towing, Bangalore",
    tag: "Towing",
    num: "099443 44680",
    tel: "tel:+919944344680",
    map: "https://g.co/kgs/6HehVV4",
  },
  {
    name: "Jai Maruthi towing service",
    note: "Near Hosur · 4-wheelers only",
    tag: "Cars only",
    num: "096200 9262",
    tel: "tel:+9196200 9262",
    map: "https://g.co/kgs/d9emXQU",
  },
] as const;

export type SosLink = {
  readonly tag: string;
  readonly title: string;
  readonly desc: string;
  readonly href: string;
};

export const SOS_LINKS: readonly SosLink[] = [
  {
    tag: "Blood donors",
    title: "Friends2Support",
    desc: "Search voluntary blood donors by group and city.",
    href: "https://www.friends2support.org/inner/news/searchresult.aspx",
  },
  {
    tag: "Blood availability",
    title: "eRaktKosh",
    desc: "Government portal: live blood stock at blood banks across Karnataka.",
    href: "https://eraktkosh.mohfw.gov.in/eraktkoshPortal/#/publicPages/bloodAvailabilitySearch",
  },
  {
    tag: "Police",
    title: "Bengaluru City Police officers",
    desc: "Senior officers list with direct contact details.",
    href: "https://bcp.karnataka.gov.in/41/-senior-officers-list-/en",
  },
] as const;
