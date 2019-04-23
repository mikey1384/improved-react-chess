export default function Queen(player) {
  return {
    player,
    style: {
      backgroundImage: `url('${
        player === 1
          ? 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg'
          : 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg'
      }')`
    },
    isMovePossible(src, dest) {
      const srcRow = Math.floor(src / 8);
      const srcColumn = src % 8;
      const destRow = Math.floor(dest / 8);
      const destColumn = dest % 8;

      return (
        Math.abs(srcRow - destRow) === Math.abs(srcColumn - destColumn) ||
        srcRow === destRow ||
        srcColumn === destColumn
      );
    },
    getSrcToDestPath(src, dest) {
      let path = [];
      let pathStart;
      let pathEnd;
      let incrementBy;
      if (src > dest) {
        pathStart = dest;
        pathEnd = src;
      } else {
        pathStart = src;
        pathEnd = dest;
      }
      if (Math.abs(src - dest) % 8 === 0) {
        incrementBy = 8;
        pathStart += 8;
      } else if (Math.abs(src - dest) % 9 === 0) {
        incrementBy = 9;
        pathStart += 9;
      } else if (Math.abs(src - dest) % 7 === 0) {
        incrementBy = 7;
        pathStart += 7;
      } else {
        incrementBy = 1;
        pathStart += 1;
      }
      for (let i = pathStart; i < pathEnd; i += incrementBy) {
        path.push(i);
      }
      return path;
    }
  };
}
