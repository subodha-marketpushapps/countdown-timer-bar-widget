import React, { useState } from "react";
import { Page } from "@wix/design-system";
import SectionFooter from "../SectionFooter/SectionFooter";

import MiniLogo from "./MiniLogo";

interface PageLayoutProps {
  title: string | undefined;
  subtitle?: string;
  children: React.ReactNode;
  actionBar?: React.ReactNode;
  pageTail?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  children,
  actionBar,
  pageTail,
}) => {
  const pageRef = React.createRef<Page>();
  const [isMiniHeader, setIsMiniHeader] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onScroll = (htmlElement: any) => {
    let scrollY = htmlElement?.target?.scrollTop;
    if (scrollY == undefined || scrollY == null) scrollY = 79;
    setIsMiniHeader(scrollY > 78);
  };

  return (
    <>
      <Page
        ref={pageRef}
        height="calc(100vh - 46px)"
        className="mkp-page"
        scrollProps={{ onScrollChanged: onScroll }}
      >
        <Page.Header
          title={title}
          subtitle={subtitle}
          actionsBar={actionBar}
          breadcrumbs={isMiniHeader ? "" : <MiniLogo />}
        />
        {pageTail && React.isValidElement(pageTail) && (
          <Page.Tail>{pageTail}</Page.Tail>
        )}
        <Page.Content>{children}</Page.Content>
      </Page>
      <SectionFooter />
    </>
  );
};

export default PageLayout;
