interface ConferenceLayoutManagerOptionsLayoutGrid {
  from: number;
  to: number;
  col: number;
  row: number;
}

const defaultLayout: ConferenceLayoutManagerOptionsLayoutGrid[] = [
  // video layers layout
  { from: 1, to: 1, col: 1, row: 1 },
  { from: 2, to: 2, col: 2, row: 1 },
  { from: 3, to: 4, col: 2, row: 2 },
  { from: 5, to: 6, col: 3, row: 2 },
  { from: 7, to: 9, col: 3, row: 3 },
];

interface ConferenceLayoutManagerOptions {
  width: number; // container width
  height: number; // container height
  margin?: number;
  layout?: ConferenceLayoutManagerOptionsLayoutGrid[];
  fillIfLoose?: boolean;
}

export class ConferenceLayoutManager {
  options: Required<ConferenceLayoutManagerOptions>;
  max: number;

  /**
   * Current Video Count
   */
  currentCount = 0;

  /**
   * Current Page Number
   */
  currentPage = 1;

  constructor(options: ConferenceLayoutManagerOptions) {
    this.options = {
      margin: 4,
      layout: defaultLayout,
      fillIfLoose: true,
      ...options,
    };

    this.max = Math.max(...this.options.layout.map((item) => item.to));
  }

  get maxPage() {
    return Math.ceil(this.currentCount / this.max);
  }

  get pageSize() {
    return this.max;
  }

  setOptions(options: Partial<ConferenceLayoutManagerOptions>) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  updateCount(count: number) {
    this.currentCount = count;
  }

  updatePage(page: number) {
    if (page <= 0 || page > this.maxPage) {
      return;
    }

    this.currentPage = page;
  }

  prevPage() {
    this.updatePage(this.currentPage - 1);
  }

  nextPage() {
    this.updatePage(this.currentPage + 1);
  }

  getLayout() {
    const displaySlot = Math.min(this.max, this.currentCount);

    const grid = this.pickGrid(displaySlot);
    const { col, row } = grid;

    const margin = this.options.margin;
    const cellWidth = this.options.width / col;
    const cellHeight = this.options.height / row;

    // start seq
    const start = this.options.fillIfLoose
      ? Math.max(
          0,
          Math.min(
            (this.currentPage - 1) * this.pageSize,
            this.currentCount - displaySlot
          )
        )
      : (this.currentPage - 1) * this.pageSize;
    const displayCount = Math.min(this.currentCount - start, this.max);

    return Array.from({ length: displayCount }).map((_, i) => {
      return {
        left: (i % col) * cellWidth + margin,
        top: Math.floor(i / col) * cellHeight + margin,
        cellWidth: cellWidth - margin * 2,
        cellHeight: cellHeight - margin * 2,
        seq: start + i,
      };
    });
  }

  private pickGrid(count: number) {
    const layout = this.options.layout.find(
      (grid) => grid.from <= count && grid.to >= count
    );

    if (layout) {
      return layout;
    }

    return this.options.layout[this.options.layout.length - 1];
  }
}
