const mockEnabled = import.meta.env.VITE_USE_MOCKS === 'true';

let seed = 42;
function pseudoRandom(): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function random(): number {
  return mockEnabled ? pseudoRandom() : Math.random();
}

export function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return random() * (max - min) + min;
}

export function randomBool(threshold = 0.5): boolean {
  return random() > threshold;
}

export { mockEnabled };
