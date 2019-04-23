export default function Bishop(player) {
  return {
    player,
    style: {
      backgroundImage: `url('${
        player === 1
          ? 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg'
          : 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg'
      }')`
    },
    isMovePossible(src, dest) {
      const srcRow = Math.floor(src / 8);
      const srcColumn = src % 8;
      const destRow = Math.floor(dest / 8);
      const destColumn = dest % 8;
      return Math.abs(srcRow - destRow) === Math.abs(srcColumn - destColumn);
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
      if (Math.abs(src - dest) % 9 === 0) {
        incrementBy = 9;
        pathStart += 9;
      } else {
        incrementBy = 7;
        pathStart += 7;
      }

      for (let i = pathStart; i < pathEnd; i += incrementBy) {
        path.push(i);
      }
      return path;
    }
  };
}
