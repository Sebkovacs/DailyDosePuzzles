export function shuffleArray<T>(array: T[], seed: string): T[] {
  let m = array.length, t, i;
  let hash = 0;
  for (let j = 0; j < seed.length; j++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(j);
    hash |= 0;
  }

  const random = () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };

  const newArray = [...array];
  while (m) {
    i = Math.floor(random() * m--);
    t = newArray[m];
    newArray[m] = newArray[i];
    newArray[i] = t;
  }
  return newArray;
}
