"use client";

import cs from "classnames";
import dynamic from "next/dynamic";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type PageBlock } from "notion-types";
import {
  formatDate,
  getBlockTitle,
  getPageProperty,
  // normalizeTitle,
  parsePageId,
} from "notion-utils";
import * as React from "react";
import BodyClassName from "react-body-classname";
import { type NotionComponents, NotionRenderer } from "react-notion-x";
import { useSearchParam } from "react-use";

import type * as types from "@/lib/notion/types";
import * as config from "@/lib/notion/config";
import { mapImageUrl } from "@/lib/notion/map-image-url";
import { getCanonicalPageUrl, mapPageUrl } from "@/lib/notion/map-page-url";
import { searchNotion } from "@/lib/notion/search-notion";

import { Footer } from "./Footer";
import { GitHubShareButton } from "./GitHubShareButton";
import { Loading } from "./Loading";
import { NotionPageHeader } from "./NotionPageHeader";
import { PageAside } from "./PageAside";
import { PageHead } from "./PageHead";
import styles from "./styles.module.css";
import { notFound } from "next/navigation";

// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then(async (m) => {
    // add / remove any prism syntaxes here
    await Promise.allSettled([
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-markup-templating.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-markup.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-bash.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-c.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-cpp.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-csharp.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-docker.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-java.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-js-templates.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-coffeescript.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-diff.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-git.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-go.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-graphql.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-handlebars.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-less.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-makefile.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-markdown.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-objectivec.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-ocaml.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-python.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-reason.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-rust.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-sass.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-scss.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-solidity.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-sql.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-stylus.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-swift.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-wasm.js"),
      // @ts-expect-error Ignore prisma types
      import("prismjs/components/prism-yaml.js"),
    ]);
    return m.Code;
  })
);

const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection
  )
);
const Modal = dynamic(
  () =>
    import("react-notion-x/build/third-party/modal").then((m) => {
      m.Modal.setAppElement(".notion-viewport");
      return m.Modal;
    }),
  {
    ssr: false,
  }
);

const propertyLastEditedTimeValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { block, pageHeader }: any,
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && block?.last_edited_time) {
    return `Last updated ${formatDate(block?.last_edited_time, {
      month: "long",
    })}`;
  }

  return defaultFn();
};

const propertyDateValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { data, schema, pageHeader }: any,
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === "published") {
    const publishDate = data?.[0]?.[1]?.[0]?.[1]?.start_date;

    if (publishDate) {
      return `${formatDate(publishDate, {
        month: "long",
      })}`;
    }
  }

  return defaultFn();
};

const propertyTextValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { schema, pageHeader }: any,
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === "author") {
    return <b>{defaultFn()}</b>;
  }

  return defaultFn();
};

// const propertySelectValue = (
//   { schema, value, key, pageHeader }: any,
//   defaultFn: () => React.ReactNode
// ) => {
//   value = normalizeTitle(value)

//   if (pageHeader && schema.type === 'multi_select' && value) {
//     return (
//       <Link href={`/tags/${value}`} key={key} legacyBehavior>
//         <a>{defaultFn()}</a>
//       </Link>
//     )
//   }

//   return defaultFn()
// }

const HeroHeader = dynamic<{ className?: string }>(
  () => import("./HeroHeader").then((m) => m.HeroHeader),
  { ssr: false }
);

export function NotionPage({
  site,
  recordMap,
  error,
  pageId,
  tagsPage,
  propertyToFilterName,
}: types.PageProps) {
  const router = useRouter();
  const lite = useSearchParam("lite");

  const components = React.useMemo<Partial<NotionComponents>>(
    () => ({
      nextLegacyImage: Image,
      nextLink: Link,
      Code,
      Collection,
      Modal,
      Header: NotionPageHeader,
      propertyLastEditedTimeValue,
      propertyTextValue,
      propertyDateValue,
      // propertySelectValue
    }),
    []
  );

  // lite mode is for oembed
  const isLiteMode = lite === "true";

  const siteMapPageUrl = React.useMemo(() => {
    const params: Record<string, string> = {};
    if (lite) params.lite = lite;

    const searchParams = new URLSearchParams(params);
    return site ? mapPageUrl(site, recordMap!, searchParams) : undefined;
  }, [site, recordMap, lite]);

  const keys = Object.keys(recordMap?.block || {});
  const block = recordMap?.block?.[keys[0]!]?.value;

  // const isRootPage =
  //   parsePageId(block?.id) === parsePageId(site?.rootNotionPageId)
  const isBlogPost =
    block?.type === "page" && block?.parent_table === "collection";
  const isBioPage =
    parsePageId(block?.id) === parsePageId("8d0062776d0c4afca96eb1ace93a7538");

  const showTableOfContents = !!isBlogPost;
  const minTableOfContentsItems = 3;

  const pageAside = React.useMemo(
    () => (
      <PageAside
        block={block!}
        recordMap={recordMap!}
        isBlogPost={isBlogPost}
      />
    ),
    [block, recordMap, isBlogPost]
  );

  const footer = React.useMemo(() => <Footer />, []);

  const pageCover = React.useMemo(() => {
    if (isBioPage) {
      return (
        <HeroHeader className="notion-page-cover-wrapper notion-page-cover-hero" />
      );
    } else {
      return null;
    }
  }, [isBioPage]);

  if (router.isFallback) {
    return <Loading />;
  }

  if (error || !site || !block) {
    return notFound();
  }

  const name = getBlockTitle(block, recordMap) || site.name;
  const title =
    tagsPage && propertyToFilterName ? `${propertyToFilterName} ${name}` : name;

  console.log("notion page", {
    isDev: config.isDev,
    title,
    pageId,
    rootNotionPageId: site.rootNotionPageId,
    recordMap,
  });

  if (!config.isServer) {
    // add important objects to the window global for easy debugging
    const g = window as unknown as Record<string, unknown>;
    g.pageId = pageId;
    g.recordMap = recordMap;
    g.block = block;
  }

  const canonicalPageUrl = config.isDev
    ? undefined
    : getCanonicalPageUrl(site, recordMap)(pageId);

  const socialImage = mapImageUrl(
    getPageProperty<string>("Social Image", block, recordMap) ||
      (block as PageBlock).format?.page_cover ||
      config.defaultPageCover,
    block
  );

  const socialDescription =
    getPageProperty<string>("Description", block, recordMap) ||
    config.description;

  return (
    <>
      <PageHead
        pageId={pageId}
        site={site}
        title={title}
        description={socialDescription}
        image={socialImage}
        url={canonicalPageUrl}
      />

      {isLiteMode && <BodyClassName className="notion-lite" />}
      <BodyClassName className="dark-mode" />

      <NotionRenderer
        bodyClassName={cs(
          styles.notion,
          pageId === site.rootNotionPageId && "index-page",
          tagsPage && "tags-page"
        )}
        darkMode={true}
        components={components}
        recordMap={recordMap}
        rootPageId={site.rootNotionPageId}
        rootDomain={site.domain}
        fullPage={!isLiteMode}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={false}
        showTableOfContents={showTableOfContents}
        minTableOfContentsItems={minTableOfContentsItems}
        defaultPageIcon={config.defaultPageIcon}
        defaultPageCover={config.defaultPageCover}
        defaultPageCoverPosition={config.defaultPageCoverPosition}
        linkTableTitleProperties={false}
        mapPageUrl={siteMapPageUrl}
        mapImageUrl={mapImageUrl}
        searchNotion={config.isSearchEnabled ? searchNotion : undefined}
        pageAside={pageAside}
        footer={footer}
        pageTitle={tagsPage && propertyToFilterName ? title : undefined}
        pageCover={pageCover}
      />

      <GitHubShareButton />
    </>
  );
}
