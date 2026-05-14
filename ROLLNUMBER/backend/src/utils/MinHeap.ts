/**
 * MinHeap / Priority Queue implementation for Top N elements optimization
 *
 * Time Complexity:
 * - Insert: O(log k)
 * - Find Min (Top): O(1)
 * - Delete Min: O(log k)
 * Overall algorithm to find Top K out of N items: O(n log k)
 *
 * Space Complexity: O(k)
 */

export class MinHeap<T> {
  private heap: T[] = [];
  private readonly compare: (a: T, b: T) => number;

  /**
   * @param compareFn - comparison function returning a negative number if a < b, 
   *                    positive if a > b, or 0 if equal. For Min Heap, the smallest 
   *                    element according to this comparator rises to the top.
   */
  constructor(compareFn: (a: T, b: T) => number) {
    this.compare = compareFn;
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public peek(): T | undefined {
    return this.heap[0];
  }

  public push(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return min;
  }

  /**
   * Retreive all items in the heap, sorted in ascending or descending order depending on caller usage.
   * Since this is a MinHeap, popping until empty will yield items from smallest to largest.
   */
  public toSortedArray(): T[] {
    const result: T[] = [];
    const heapCopy = new MinHeap<T>(this.compare);
    heapCopy.heap = [...this.heap];
    while (!heapCopy.isEmpty()) {
      result.push(heapCopy.pop()!);
    }
    return result;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let leftIndex = 2 * index + 1;
      let rightIndex = 2 * index + 2;
      let smallestIndex = index;

      if (leftIndex < length && this.compare(this.heap[leftIndex], this.heap[smallestIndex]) < 0) {
        smallestIndex = leftIndex;
      }

      if (rightIndex < length && this.compare(this.heap[rightIndex], this.heap[smallestIndex]) < 0) {
        smallestIndex = rightIndex;
      }

      if (smallestIndex === index) break;
      this.swap(index, smallestIndex);
      index = smallestIndex;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
