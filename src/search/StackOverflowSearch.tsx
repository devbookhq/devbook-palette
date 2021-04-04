import { useSearchStore } from './search.store';
import { observer } from 'mobx-react-lite';
import { SearchSource } from 'services/search.service';

function StackOverflowSearch() {
  const searchStore = useSearchStore();

  const results = searchStore.getResults.get(SearchSource.StackOverflow);

  console.log(results);

  console.log(results);
  return (
    <div>
      Stack Overflow search
      <div>
        {JSON.stringify(results)}
      </div>
    </div>
  );
}

export default observer(StackOverflowSearch);
