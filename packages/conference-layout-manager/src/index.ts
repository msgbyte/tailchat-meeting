interface PeerLayoutManagerOptionsLayoutGrid {
  from: number;
  to: number;
  col: number;
  row: number;
}

const defaultLayout: PeerLayoutManagerOptionsLayoutGrid[] = [
  // video layers layout
  { from: 1, to: 1, col: 1, row: 1 },
  { from: 2, to: 2, col: 2, row: 1 },
  { from: 3, to: 4, col: 2, row: 2 },
  { from: 5, to: 6, col: 3, row: 2 },
  { from: 7, to: 9, col: 3, row: 3 },
];

interface PeerLayoutManagerOptions {
  width: number; // container width
  height: number; // container height
  margin?: number;
  layout?: PeerLayoutManagerOptionsLayoutGrid[];
}

export class PeerLayoutManager {
  options: Required<PeerLayoutManagerOptions>;
  max: number;
  constructor(options: PeerLayoutManagerOptions) {
    this.options = {
      margin: 4,
      layout: defaultLayout,
      ...options,
    };

    this.max = Math.max(...this.options.layout.map((item) => item.to));
  }

  parse(count: number) {
    count = Math.min(this.max, count);

    const grid = this.pickGrid(count);
    const { col, row } = grid;

    const margin = this.options.margin;
    const cellWidth = this.options.width / col;
    const cellHeight = this.options.height / row;

    return Array.from({ length: count }).map((_, i) => {
      return {
        left: (i % col) * cellWidth + margin,
        top: Math.floor(i / col) * cellHeight + margin,
        cellWidth: cellWidth - margin * 2,
        cellHeight: cellHeight - margin * 2,
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
