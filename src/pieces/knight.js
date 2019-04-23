export default function Knight(player) {
  return {
    player,
    style: {
      backgroundImage: `url('${
        player === 1
          ? 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg'
          : 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg'
      }')`
    },
    isMovePossible(src, dest) {
      const srcRow = Math.floor(src / 8);
      const srcColumn = src % 8;
      const destRow = Math.floor(dest / 8);
      const destColumn = dest % 8;
      return (
        (srcRow + 2 === destRow && srcColumn - 1 === destColumn) ||
        (srcRow + 2 === destRow && srcColumn + 1 === destColumn) ||
        (srcRow + 1 === destRow && srcColumn - 2 === destColumn) ||
        (srcRow + 1 === destRow && srcColumn + 2 === destColumn) ||
        (srcRow - 2 === destRow && srcColumn - 1 === destColumn) ||
        (srcRow - 2 === destRow && srcColumn + 1 === destColumn) ||
        (srcRow - 1 === destRow && srcColumn - 2 === destColumn) ||
        (srcRow - 1 === destRow && srcColumn + 2 === destColumn)
      );
    },
    getSrcToDestPath() {
      return [];
    }
  };
}
