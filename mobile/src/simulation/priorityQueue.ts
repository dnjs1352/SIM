/**
 * 이진 최소 힙 기반 우선순위 큐.
 * push/pop은 O(log n), peek는 O(1).
 * 우선순위가 같으면 먼저 넣은 항목이 먼저 나온다(FIFO 안정성).
 * 시뮬레이션이 결정적으로 동작하려면 이 성질이 필요하다.
 */
export class PriorityQueue<T> {
  private readonly heap: { priority: number; sequence: number; value: T }[] = [];
  private nextSequence = 0;

  get size(): number {
    return this.heap.length;
  }

  push(priority: number, value: T): void {
    this.heap.push({ priority, sequence: this.nextSequence++, value });
    this.siftUp(this.heap.length - 1);
  }

  /** 가장 작은 우선순위 값을 반환한다. 비어 있으면 undefined. */
  peekPriority(): number | undefined {
    return this.heap[0]?.priority;
  }

  pop(): { priority: number; value: T } | undefined {
    const top = this.heap[0];
    if (top === undefined) return undefined;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return { priority: top.priority, value: top.value };
  }

  private isBefore(a: number, b: number): boolean {
    const left = this.heap[a];
    const right = this.heap[b];
    return left.priority < right.priority ||
      (left.priority === right.priority && left.sequence < right.sequence);
  }

  private swap(a: number, b: number): void {
    [this.heap[a], this.heap[b]] = [this.heap[b], this.heap[a]];
  }

  private siftUp(index: number): void {
    let child = index;
    while (child > 0) {
      const parent = (child - 1) >> 1;
      if (!this.isBefore(child, parent)) return;
      this.swap(child, parent);
      child = parent;
    }
  }

  private siftDown(index: number): void {
    let parent = index;
    const length = this.heap.length;
    for (;;) {
      const left = parent * 2 + 1;
      const right = left + 1;
      let smallest = parent;
      if (left < length && this.isBefore(left, smallest)) smallest = left;
      if (right < length && this.isBefore(right, smallest)) smallest = right;
      if (smallest === parent) return;
      this.swap(parent, smallest);
      parent = smallest;
    }
  }
}
