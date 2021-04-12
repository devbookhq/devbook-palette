import { memo } from 'react';

interface DocsContentProps {
  containerRef: React.RefObject<HTMLDivElement>;
  html: string;
}

function DocsContent({ containerRef, html }: DocsContentProps) {
  return (
    <div
      id="doc-page"
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default memo(DocsContent);
