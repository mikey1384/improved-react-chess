import React, { useState } from 'react';
import Board from './Board';
import FallenPieces from './FallenPieces.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';

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
            index === i
              ? {
                  ...square,
                  style: {
                    ...square.style,
                    backgroundColor: 'RGB(111,143,114)'
                  }
                }
              : square
          )
        );
        setStatus('Choose destination for the selected piece');
        setSourceSelection(i);
      }
    } else if (sourceSelection > -1) {
      if (squares[i] && squares[i].player === player) {
        setSourceSelection(i);
        setStatus('Choose destination for the selected piece');
        setSquares(squares =>
          squares.map((square, index) => {
            if (index !== i && index === sourceSelection) {
              return {
                ...square,
                style: {
                  ...square.style,
                  backgroundColor: null
                }
              };
            }
            if (index === i) {
              return {
                ...square,
                style: {
                  ...square.style,
                  backgroundColor: 'RGB(111,143,114)'
                }
              };
            }
            return square;
          })
        );
      } else {
        const isDestEnemyOccupied = !!squares[i];
        const newWhiteFallenPieces = [...whiteFallenPieces];
        const newBlackFallenPieces = [...blackFallenPieces];
        if (
          squares[sourceSelection].isMovePossible(
            sourceSelection,
            i,
            isDestEnemyOccupied
          ) &&
          isMoveLegal(
            squares[sourceSelection].getSrcToDestPath(sourceSelection, i)
          )
        ) {
          if (squares[i] !== null) {
            if (squares[i].player === 1) {
              newWhiteFallenPieces.push(squares[i]);
            } else {
              newBlackFallenPieces.push(squares[i]);
            }
          }
          setSourceSelection(-1);
          setSquares(squares =>
            squares.map((square, index) => {
              if (index === i) {
                return {
                  ...squares[sourceSelection],
                  style: {
                    ...squares[sourceSelection].style,
                    backgroundColor: null
                  }
                };
              }
              if (index === sourceSelection) return null;
              return square;
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

  function isMoveLegal(srcToDestPath) {
    let isLegal = true;
    for (let i = 0; i < srcToDestPath.length; i++) {
      if (squares[srcToDestPath[i]] !== null) {
        isLegal = false;
      }
    }
    return isLegal;
  }
}
