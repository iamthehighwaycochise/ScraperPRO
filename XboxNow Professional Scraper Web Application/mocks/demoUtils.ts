import { randomFloat, randomBool, randomInt, mockEnabled } from './random';

export async function simulateNetworkDelay() {
  if (!mockEnabled) return;
  const delay = 1000 + randomFloat(0, 2000);
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function mockUploadSuccess() {
  return mockEnabled ? randomBool(0.1) : true;
}

export function randomSidebarWidth() {
  return mockEnabled ? `${randomInt(50, 90)}%` : '70%';
}
