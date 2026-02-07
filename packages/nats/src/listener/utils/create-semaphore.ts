export interface Semaphore {
  acquire: () => Promise<void>;
  release: () => void;
}

export function createSemaphore(limit: number): Semaphore {
  let active = 0;
  const queue: Array<() => void> = [];

  const acquire = async () => {
    if (active < limit) {
      active++;
      return;
    }

    await new Promise<void>((res) => queue.push(res));
    active++;
  };

  const release = () => {
    active--;
    const next = queue.shift();

    if (next) {
      next();
    }
  };

  return { acquire, release };
}
