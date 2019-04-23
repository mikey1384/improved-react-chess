import React, { useState } from 'react';
import Board from './Board';
import FallenPieces from './FallenPieces.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';
import getPiece from '../helpers/piece';

export default function Game() {
  const [squares, setSquares] = useState(initialiseChessBoard());
  const [whiteFallenPieces, setWhiteFallenPieces] = useState([]);
  const [blackFallenPieces, setBlackFallenPieces] = useState([]);
  const [player, setPlayer] = useState(1);
  const [sourceSelection, setSourceSelection] = useState(-1);
  const [status, setStatus] = useState('');
  const [turn, setTurn] = useState('white');

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Board squares={squares} onClick={handleClick} />
        <div style={{ marginLeft: '1rem' }}>
          <p
            style={{
              fontSize: '1rem',
              margin: 0,
              fontWeight: 'bold',
              lineHeight: 1.5
            }}
          >
            Turn
          </p>
          <div
            style={{
              width: '2rem',
              height: '2rem',
              border: '1px solid #000',
              marginBottom: '1rem',
              backgroundColor: turn
            }}
          />
          <div style={{ minHeight: '4rem' }}>{status}</div>
          <FallenPieces
            whiteFallenPieces={whiteFallenPieces}
            blackFallenPieces={blackFallenPieces}
          />
        </div>
      </div>
    </div>
  );

  function handleClick(i) {
    if (sourceSelection === -1) {
      if (!squares[i] || squares[i].player !== player) {
        setStatus('Wrong selection. Choose player ' + player + ' pieces.');
      } else {
        setSquares(squares =>
          squares.map((square, index) =>
            index === i || isPossibleAndLegal({ src: i, dest: index })
              ? {
                  ...square,
                  state: 'highlighted'
                }
              : square
          )
        );
        setStatus('Choose destination for the selected piece');
        setSourceSelection(i);
      }
    } else {
      if (squares[i] && squares[i].player === player) {
        setSourceSelection(i);
        setStatus('Choose destination for the selected piece');
        setSquares(squares =>
          squares.map((square, index) => {
            if (index !== i && index === sourceSelection) {
              return {
                ...square,
                state: ''
              };
            }
            if (index === i || isPossibleAndLegal({ src: i, dest: index })) {
              return {
                ...square,
                state: 'highlighted'
              };
            }
            return {
              ...square,
              state: ''
            };
          })
        );
      } else {
        const newWhiteFallenPieces = [...whiteFallenPieces];
        const newBlackFallenPieces = [...blackFallenPieces];
        if (isPossibleAndLegal({ src: sourceSelection, dest: i })) {
          if (squares[i].player) {
            if (squares[i].player === 1) {
              newWhiteFallenPieces.push(squares[i]);
            } else {
              newBlackFallenPieces.push(squares[i]);
            }
          }
          setSourceSelection(-1);
          setSquares(squares =>
            squares.map((square, index) => {
              if (isCheck({ curr: sourceSelection, src: i, dest: index })) {
                return {
                  ...square,
                  state: 'check'
                };
              }
              if (index === i) {
                return {
                  ...squares[sourceSelection],
                  state: ''
                };
              }
              if (index === sourceSelection) return {};
              return {
                ...square,
                state: ''
              };
            })
          );
          setWhiteFallenPieces(newWhiteFallenPieces);
          setBlackFallenPieces(newBlackFallenPieces);
          setPlayer(player === 1 ? 2 : 1);
          setStatus('');
          setTurn(turn === 'white' ? 'black' : 'white');
        } else {
          setStatus(
            'Wrong selection. Choose valid source and destination again.'
          );
        }
      }
    }
  }

  function isMoveLegal(srcToDestPath, ignore, include) {
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

  function isPossibleAndLegal({ src, dest }) {
    if (squares[dest].player === player) {
      return false;
    }
    return (
      getPiece(squares[src]).isMovePossible(
        src,
        dest,
        !!squares[dest].player
      ) && isMoveLegal(getPiece(squares[src]).getSrcToDestPath(src, dest))
    );
  }

  function isCheck({ curr, src, dest }) {
    if (
      !squares[dest].player ||
      squares[dest].player === player ||
      squares[dest].type !== 'king'
    ) {
      return false;
    }
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i].player || squares[i].player !== player) {
        continue;
      }
      const moverIndex = i === curr ? curr : i;
      const index = i === curr ? src : i;
      if (
        getPiece(squares[moverIndex]).isMovePossible(index, dest, true) &&
        isMoveLegal(
          getPiece(squares[moverIndex]).getSrcToDestPath(index, dest),
          curr,
          src
        )
      ) {
        return true;
      }
    }
    return false;
  }
}
