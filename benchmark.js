const { performance } = require('perf_hooks');

// Mock data
const N = 1000;
const activeGrid = Array.from({ length: N }, (_, i) => `word${i}`);
// let's assume selectedChain has a subset or all of these words
const selectedChain = Array.from({ length: N }, (_, i) => `word${i}`);

function baseline() {
  let iterations = 1000;
  let start = performance.now();
  for (let iter = 0; iter < iterations; iter++) {
    const result = activeGrid.map((word) => {
      const selectedIndex = selectedChain.indexOf(word);
      const isSelected = selectedIndex !== -1;
      return isSelected;
    });
  }
  let end = performance.now();
  return end - start;
}

function optimized() {
  let iterations = 1000;
  let start = performance.now();
  for (let iter = 0; iter < iterations; iter++) {
    const selectedChainMap = new Map(selectedChain.map((w, i) => [w, i]));
    const result = activeGrid.map((word) => {
      const selectedIndex = selectedChainMap.has(word) ? selectedChainMap.get(word) : -1;
      const isSelected = selectedIndex !== -1;
      return isSelected;
    });
  }
  let end = performance.now();
  return end - start;
}

const baselineTime = baseline();
const optimizedTime = optimized();

console.log(`Baseline Time: ${baselineTime.toFixed(2)} ms`);
console.log(`Optimized Time: ${optimizedTime.toFixed(2)} ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
