import { DocSource } from 'services/search.service';

interface DocsFilterSourceProps {
  source: DocSource;
  isSelected: boolean
}

function DocsFilterSource({ source, isSelected }: DocsFilterSourceProps) {
  return (
    <>
      Docs Filter
      {source.slug}
    </>
  );
}

export default DocsFilterSource;
