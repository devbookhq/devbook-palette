import { SourceFilters } from 'Search/search.store';
import { SearchSource } from 'services/search.service';

import DocsFilterSources from './DocsFilterSources';

interface DocsFilterModalProps {
  filters: SourceFilters[SearchSource.Docs];
}

function DocsFilterModal({ filters }: DocsFilterModalProps) {
  return (
    <>
      Docs Filter Modal
      <DocsFilterSources
        sources={filters.availableFilters}
        selected={filters.selectedFilter}
      />
    </>
  );
}

export default DocsFilterModal;
