import getPiece from './piece';

export function checkerPos({ squares, kingIndex, player }) {
  const result = [];
  for (let i = 0; i < squares.length; i++) {
    if (!squares[i].player || squares[i].player !== player) {
      continue;
    }
    if (
      getPiece(squares[i]).isMovePossible(i, kingIndex, true) &&
      isMoveLegal({
        srcToDestPath: getPiece(squares[i]).getSrcToDestPath(i, kingIndex),
        squares
      })
    ) {
      result.push(i);
    }
  }
  return result;
}

export function getPieceIndex({ player, squares, type }) {
  let result = -1;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i].type === type && squares[i].player === player) {
      result = i;
      break;
    }
  }
  return result;
}

export function getOpponentPlayerId(player) {
  return player === 1 ? 2 : 1;
}

export function getPlayerPieces({ player, squares }) {
  let kingIndex = -1;
  const playerPieces = squares.reduce((prev, curr, index) => {
    if (curr.player && curr.player === player) {
      if (curr.type === 'king') {
        kingIndex = index;
        return [{ piece: curr, index }].concat(prev);
      }
      return prev.concat({ piece: curr, index });
    }
    return prev;
  }, []);
  return { kingIndex, playerPieces };
}

export function highlightPossiblePathsFromSrc({ player, squares, src }) {
  return squares.map((square, index) =>
    index === src || isPossibleAndLegal({ src, dest: index, squares, player })
      ? {
          ...square,
          state:
            ['check', 'checkmate'].indexOf(square.state) !== -1
              ? square.state
              : 'highlighted'
        }
      : {
          ...square,
          state:
            ['check', 'checkmate'].indexOf(square.state) !== -1
              ? square.state
              : ''
        }
  );
}

export function isGameOver({ player, squares }) {
  const { kingIndex, playerPieces } = getPlayerPieces({ player, squares });
  let isChecked = false;
  const nextDest = [
    kingIndex - 1,
    kingIndex + 1,
    kingIndex - 7,
    kingIndex - 8,
    kingIndex - 9,
    kingIndex + 7,
    kingIndex + 8,
    kingIndex + 9
  ];
  let checkers = [];
  const kingPiece = squares[kingIndex];
  if (kingPiece.state === 'check') {
    isChecked = true;
    checkers = checkerPos({
      squares,
      kingIndex,
      player: getOpponentPlayerId(player)
    });
  }
  const possibleNextDest = nextDest.filter(
    dest =>
      dest >= 0 &&
      dest <= 63 &&
      isPossibleAndLegal({
        src: kingIndex,
        dest,
        player,
        squares
      })
  );
  if (possibleNextDest.length === 0 && kingPiece.state !== 'check') {
    return false;
  }
  let kingCanMove = false;
  let potentialKingSlayers = [];
  for (let dest of possibleNextDest) {
    const newSquares = returnBoardAfterMove({
      src: kingIndex,
      dest,
      player,
      squares
    });
    potentialKingSlayers = kingWillBeCapturedBy({
      kingIndex: dest,
      player,
      squares: newSquares
    });
    if (potentialKingSlayers.length === 0) {
      kingCanMove = true;
    }
  }
  if (kingCanMove) return false;
  if (isChecked) {
    if (checkers.length === 1) {
      for (let piece of playerPieces) {
        if (
          piece.piece.type !== 'king' &&
          isPossibleAndLegal({
            src: piece.index,
            dest: checkers[0],
            player,
            squares
          })
        ) {
          return false;
        }
      }
    }
    const allBlockPoints = [];
    for (let checker of checkers) {
      const trajectory = getPiece(squares[checker]).getSrcToDestPath(
        checker,
        kingIndex
      );
      if (trajectory.length === 0) return 'Checkmate';
      const blockPoints = [];
      for (let square of trajectory) {
        for (let piece of playerPieces) {
          if (
            piece.piece.type !== 'king' &&
            isPossibleAndLegal({
              src: piece.index,
              dest: square,
              player,
              squares
            })
          ) {
            if (checkers.length === 1) return false;
            if (blockPoints.indexOf(square) === -1) blockPoints.push(square);
          }
        }
      }
      if (blockPoints.length === 0) return 'Checkmate';
      allBlockPoints.push(blockPoints);
    }
    if (allBlockPoints.length === 1) return false;
    for (let i = 0; i < allBlockPoints[0].length; i++) {
      let blockable = true;
      for (let j = 0; j < allBlockPoints.length; j++) {
        if (allBlockPoints[j].indexOf(allBlockPoints[0][i]) === -1) {
          blockable = false;
          break;
        }
      }
      if (blockable) return false;
    }
    return 'Checkmate';
  } else {
    for (let i = 0; i < squares.length; i++) {
      for (let piece of playerPieces) {
        if (
          isPossibleAndLegal({ src: piece.index, dest: i, player, squares })
        ) {
          const newSquares = returnBoardAfterMove({
            src: piece.index,
            dest: i,
            player,
            squares
          });
          if (
            kingWillBeCapturedBy({
              kingIndex: piece.piece.type === 'king' ? i : kingIndex,
              player,
              squares: newSquares
            }).length === 0
          ) {
            return false;
          }
        }
      }
    }
  }
  return 'Stalemate';
}

export function isMoveLegal({ srcToDestPath, ignore, include, squares }) {
  for (let i = 0; i < srcToDestPath.length; i++) {
    if (
      srcToDestPath[i] === include ||
      (srcToDestPath[i] !== ignore && squares[srcToDestPath[i]].player)
    ) {
      return false;
    }
  }
  return true;
}

export function isPossibleAndLegal({ src, dest, player, squares }) {
  if (squares[dest].player === player) {
    return false;
  }
  return (
    getPiece(squares[src]).isMovePossible(src, dest, !!squares[dest].player) &&
    isMoveLegal({
      srcToDestPath: getPiece(squares[src]).getSrcToDestPath(src, dest),
      squares
    })
  );
}

export function kingWillBeCapturedBy({ kingIndex, player, squares }) {
  const checkerPositions = checkerPos({
    squares: squares,
    kingIndex,
    player: getOpponentPlayerId(player)
  });
  return checkerPositions;
}

export function returnBoardAfterMove({ squares, src, dest, player }) {
  const newSquares = squares.map((square, index) => {
    if (index === dest) {
      const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
      const lastRow = [56, 57, 58, 59, 60, 61, 62, 63];
      let transform = false;
      if (squares[src].type === 'pawn') {
        if (player === 1 && firstRow.indexOf(index) !== -1) {
          transform = true;
        }
        if (player === 2 && lastRow.indexOf(index) !== -1) {
          transform = true;
        }
      }
      return {
        ...squares[src],
        state: '',
        type: transform ? 'queen' : squares[src].type
      };
    }
    if (index === src) return {};
    return {
      ...square,
      state: ''
    };
  });
  return newSquares;
}
