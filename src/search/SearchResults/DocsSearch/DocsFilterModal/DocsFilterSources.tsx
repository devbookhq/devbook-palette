import { DocSource } from 'services/search.service';
import DocsFilterSource from './DocsFilterSource';

interface DocsFilterSourcesProps {
  sources: DocSource[];
  selected: DocSource | undefined;
}

function DocsFilterSources({ sources, selected }: DocsFilterSourcesProps) {
  return (
    <>
      {sources.map(source =>
        <DocsFilterSource
          source={source}
          isSelected={selected?.slug === source.slug}
        />
      )}
    </>
  );
}

export default DocsFilterSources;
