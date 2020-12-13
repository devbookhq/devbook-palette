import { useLayoutEffect } from 'react';

function useOnWindowResize(handler: (event: any) => void, deps: any[] = []) {
  useLayoutEffect(() => {
    window.addEventListener('resize', handler);

    // This is a hack to get a correct height of the container.
    // The other solution is to get the height of the container
    // on the initial render but that solution returned an incorrect
    // value. I'm not sure why.
    // The value is correct once you resize the window though.
    window.resizeTo(window.outerWidth, window.outerHeight - 1);
    window.resizeTo(window.outerWidth, window.outerHeight + 1);

    return () => window.removeEventListener('resize', handler);
  }, [...deps]);
}

export default useOnWindowResize;
