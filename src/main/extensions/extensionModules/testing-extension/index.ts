interface Context {
  input: {
    query: string,
  },
}

export async function Query(context: Context) {
  console.log('handling it');
  return ['r1', 'r2'];
}

console.log('testing extension!');
