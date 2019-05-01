import React, { useEffect, useState } from 'react';
import Board from './Board';
import FallenPieces from './FallenPieces.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';
import {
  checkerPos,
  getKingIndex,
  getOpponentPlayerId,
  isGameOver,
  isPossibleAndLegal,
  kingWillBeCapturedBy,
  returnBoardAfterMove,
  highlightPossiblePathsFromSrc
} from '../helpers/model';

export default function Game() {
  const [squares, setSquares] = useState(initialiseChessBoard());
  const [whiteFallenPieces, setWhiteFallenPieces] = useState([]);
  const [blackFallenPieces, setBlackFallenPieces] = useState([]);
  const [player, setPlayer] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [status, setStatus] = useState('');
  const [turn, setTurn] = useState('white');
  const [gameOverMsg, setGameOverMsg] = useState();
  useEffect(() => {
    const players = { white: 1, black: 2 };
    setSquares(squares =>
      squares.map(square =>
        square.player === players[turn]
          ? {
              ...square,
              state:
                gameOverMsg ||
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
          <div style={{ lineHeight: 2 }}>{status || gameOverMsg}</div>
          <FallenPieces blackFallenPieces={blackFallenPieces} />
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
        highlightPossiblePathsFromSrc({ player, squares, src: i })
      );
      setStatus('');
      setSelectedIndex(i);
    } else {
      if (squares[i] && squares[i].player === player) {
        setSelectedIndex(i);
        setStatus('');
        setSquares(squares =>
          highlightPossiblePathsFromSrc({ player, squares, src: i })
        );
      } else {
        const newWhiteFallenPieces = [...whiteFallenPieces];
        const newBlackFallenPieces = [...blackFallenPieces];
        if (
          isPossibleAndLegal({ src: selectedIndex, dest: i, squares, player })
        ) {
          const newSquares = returnBoardAfterMove({
            squares,
            src: selectedIndex,
            dest: i,
            player
          });
          const myKingIndex = getKingIndex({ player, squares: newSquares });
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
            squares[i].player === 1
              ? newWhiteFallenPieces.push(squares[i])
              : newBlackFallenPieces.push(squares[i]);
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
            if (gameOver === 'Checkmate') {
              setSquares(squares =>
                squares.map((square, index) =>
                  index === theirKingIndex
                    ? { ...square, state: 'checkmate' }
                    : square
                )
              );
            }
            setGameOverMsg(gameOver);
          }
          setPlayer(getOpponentPlayerId(player));
          setTurn(turn === 'white' ? 'black' : 'white');
        }
      }
    }
  }
}
