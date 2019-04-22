import React, { useState } from 'react';

import '../index.css';
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
      <div className="game">
        <div className="game-board">
          <Board squares={squares} onClick={handleClick} />
        </div>
        <div className="game-info">
          <h3>Turn</h3>
          <div id="player-turn-box" style={{ backgroundColor: turn }} />
          <div className="game-status">{status}</div>

          <div className="fallen-soldier-block">
            {
              <FallenPieces
                whiteFallenPieces={whiteFallenPieces}
                blackFallenPieces={blackFallenPieces}
              />
            }
          </div>
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
        setStatus(
          'Wrong selection. Choose valid source and destination again.'
        );
        setSourceSelection(-1);
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
              if (index === i) return squares[sourceSelection];
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
          setSourceSelection(-1);
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
