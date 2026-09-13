import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/common/section";
import { WikiBrowser } from "@/components/wiki/wiki-browser";

export const metadata: Metadata = {
  title: "Wiki",
  description:
    "Subreddit rules and etiquette, group ride rules, WhatsApp code of conduct and emergency contacts.",
};

export default function WikiPage() {
  return (
    <Container className="pt-20 pb-25">
      <PageHeader eyebrow="Wiki · rules · etiquette">
        Know the
        <br />
        rules.
      </PageHeader>

      <div className="mt-12">
        <WikiBrowser />
      </div>
    </Container>
  );
}
