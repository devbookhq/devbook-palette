import { SearchSource } from 'services/search.service';
import Button from 'components/Button';

interface SearchSourceFilterProps {
  source: SearchSource;
  onSelect: () => void;
  isSelected: boolean;
}

function SearchSourceFilter({ source, onSelect }: SearchSourceFilterProps) {

  return (
    <>
      <Button
        onClick={onSelect}
      >
        {source}
      </Button>
    </>
  );
}

export default SearchSourceFilter;
