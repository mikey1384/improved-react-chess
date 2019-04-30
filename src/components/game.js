import React, { useEffect, useState } from 'react';
import Board from './Board';
import FallenPieces from './FallenPieces.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';
import getPiece from '../helpers/piece';

export default function Game() {
  const [squares, setSquares] = useState(initialiseChessBoard());
  const [whiteFallenPieces, setWhiteFallenPieces] = useState([]);
  const [blackFallenPieces, setBlackFallenPieces] = useState([]);
  const [player, setPlayer] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [status, setStatus] = useState('');
  const [turn, setTurn] = useState('white');
  useEffect(() => {
    const players = { white: 1, black: 2 };
    setSquares(squares =>
      squares.map(square =>
        square.player === players[turn]
          ? {
              ...square,
              state:
                ['check', 'checkmate'].indexOf(square.state) !== -1
                  ? square.state
                  : 'highlighted'
            }
          : square
      )
    );
  }, [turn]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <FallenPieces whiteFallenPieces={whiteFallenPieces} />
        <Board squares={squares} onClick={handleClick} player={player} />
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <FallenPieces blackFallenPieces={blackFallenPieces} />
          <div style={{ minHeight: '1rem' }}>{status}</div>
        </div>
      </div>
    </div>
  );

  function handleClick(i) {
    if (selectedIndex === -1) {
      if (!squares[i] || squares[i].player !== player) {
        return;
      }
      setSquares(squares =>
        squares.map((square, index) =>
          index === i ||
          isPossibleAndLegal({ src: i, dest: index, squares, player })
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
        )
      );
      setStatus('');
      setSelectedIndex(i);
    } else {
      if (squares[i] && squares[i].player === player) {
        setSelectedIndex(i);
        setStatus('');
        setSquares(squares =>
          squares.map((square, index) => {
            if (
              index === i ||
              isPossibleAndLegal({ src: i, dest: index, squares, player })
            ) {
              return {
                ...square,
                state:
                  ['check', 'checkmate'].indexOf(square.state) !== -1
                    ? square.state
                    : 'highlighted'
              };
            }
            return {
              ...square,
              state:
                ['check', 'checkmate'].indexOf(square.state) !== -1
                  ? square.state
                  : ''
            };
          })
        );
      } else {
        const newWhiteFallenPieces = [...whiteFallenPieces];
        const newBlackFallenPieces = [...blackFallenPieces];
        if (
          isPossibleAndLegal({ src: selectedIndex, dest: i, squares, player })
        ) {
          let myKingIndex = -1;
          const newSquares = returnBoardAfterMove({
            squares,
            src: selectedIndex,
            dest: i,
            player
          });
          for (let i = 0; i < newSquares.length; i++) {
            if (
              newSquares[i].type === 'king' &&
              newSquares[i].player === player
            ) {
              myKingIndex = i;
              break;
            }
          }
          const potentialCapturers = kingWillBeCapturedBy({
            kingIndex: myKingIndex,
            player,
            squares: newSquares
          });

          if (potentialCapturers.length > 0) {
            setSquares(squares =>
              squares.map((square, index) => {
                if (potentialCapturers.indexOf(index) !== -1) {
                  return {
                    ...square,
                    state: 'danger'
                  };
                }
                return {
                  ...square,
                  state: square.state === 'danger' ? '' : square.state
                };
              })
            );
            setStatus('Your King will be captured if you make that move.');
            return;
          }
          if (squares[i].player) {
            if (squares[i].player === 1) {
              newWhiteFallenPieces.push(squares[i]);
            } else {
              newBlackFallenPieces.push(squares[i]);
            }
          }
          setSelectedIndex(-1);
          const theirKingIndex = getKingIndex({
            player: getOpponentPlayerId(player),
            squares: newSquares
          });
          if (
            checkerPos({
              squares: newSquares,
              kingIndex: theirKingIndex,
              player
            }).length !== 0
          ) {
            newSquares[theirKingIndex] = {
              ...newSquares[theirKingIndex],
              state: 'check'
            };
          }
          setSquares(newSquares);
          setWhiteFallenPieces(newWhiteFallenPieces);
          setBlackFallenPieces(newBlackFallenPieces);
          setStatus('');
          const gameOver = isGameOver({
            player: getOpponentPlayerId(player),
            squares: newSquares
          });
          if (gameOver) {
            if (gameOver.isCheckmate) {
              setSquares(squares =>
                squares.map((square, index) =>
                  index === theirKingIndex
                    ? { ...square, state: 'checkmate' }
                    : square
                )
              );
              console.log('checkmate');
            } else {
              console.log('stalemate');
            }
          }
          setPlayer(getOpponentPlayerId(player));
          setTurn(turn === 'white' ? 'black' : 'white');
        }
      }
    }
  }
}

function checkerPos({ squares, kingIndex, player }) {
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

function getKingIndex({ player, squares }) {
  let kingIndex = -1;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i].type === 'king' && squares[i].player === player) {
      kingIndex = i;
      break;
    }
  }
  return kingIndex;
}

function getOpponentPlayerId(player) {
  return player === 1 ? 2 : 1;
}

function isGameOver({ player, squares }) {
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
      if (trajectory.length === 0) return { isCheckmate: true };
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
      if (blockPoints.length === 0) return { isCheckmate: true };
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
    return { isCheckmate: true };
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
  return { isStalemate: true };
}

function isMoveLegal({ srcToDestPath, ignore, include, squares }) {
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

function isPossibleAndLegal({ src, dest, player, squares }) {
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

function kingWillBeCapturedBy({ kingIndex, player, squares }) {
  const checkerPositions = checkerPos({
    squares: squares,
    kingIndex,
    player: getOpponentPlayerId(player)
  });
  return checkerPositions;
}

function returnBoardAfterMove({ squares, src, dest, player }) {
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
