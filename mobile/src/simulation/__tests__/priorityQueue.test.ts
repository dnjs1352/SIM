import { PriorityQueue } from '../priorityQueue';

describe('PriorityQueue', () => {
  it('pops items in ascending priority order', () => {
    const queue = new PriorityQueue<string>();
    [5, 1, 4, 2, 3].forEach((priority) => queue.push(priority, `p${priority}`));
    const popped: string[] = [];
    while (queue.size > 0) popped.push(queue.pop()!.value);
    expect(popped).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
  });

  it('keeps insertion order for equal priorities', () => {
    const queue = new PriorityQueue<number>();
    for (let value = 0; value < 50; value++) queue.push(value % 2, value);
    const popped: number[] = [];
    while (queue.size > 0) popped.push(queue.pop()!.value);
    const evens = popped.slice(0, 25);
    const odds = popped.slice(25);
    expect(evens).toEqual([...evens].sort((a, b) => a - b));
    expect(odds).toEqual([...odds].sort((a, b) => a - b));
    expect(evens.every((value) => value % 2 === 0)).toBe(true);
  });

  it('returns undefined when empty', () => {
    const queue = new PriorityQueue<number>();
    expect(queue.pop()).toBeUndefined();
    expect(queue.peekPriority()).toBeUndefined();
  });
});
