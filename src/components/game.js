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
  const [selectedIndex, setSelectedIndex] = useState(-1);
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
    if (selectedIndex === -1) {
      if (!squares[i] || squares[i].player !== player) {
        return setStatus(
          'Wrong selection. Choose player ' + player + ' pieces.'
        );
      }
      setSquares(squares =>
        squares.map((square, index) =>
          index === i || isPossibleAndLegal({ src: i, dest: index })
            ? {
                ...square,
                state: square.state === 'check' ? 'check' : 'highlighted'
              }
            : square
        )
      );
      setStatus('Choose destination for the selected piece');
      setSelectedIndex(i);
    } else {
      if (squares[i] && squares[i].player === player) {
        setSelectedIndex(i);
        setStatus('Choose destination for the selected piece');
        setSquares(squares =>
          squares.map((square, index) => {
            if (index === i || isPossibleAndLegal({ src: i, dest: index })) {
              return {
                ...square,
                state: square.state === 'check' ? 'check' : 'highlighted'
              };
            }
            return {
              ...square,
              state: square.state === 'check' ? 'check' : ''
            };
          })
        );
      } else {
        const newWhiteFallenPieces = [...whiteFallenPieces];
        const newBlackFallenPieces = [...blackFallenPieces];
        if (isPossibleAndLegal({ src: selectedIndex, dest: i })) {
          const potentialCapturer = kingWillBeCapturedBy({
            src: selectedIndex,
            dest: i
          });
          if (potentialCapturer !== -1) {
            setSquares(squares =>
              squares.map((square, index) => {
                if (index === potentialCapturer) {
                  return {
                    ...square,
                    state: 'danger'
                  };
                }
                return square;
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
          const newSquares = squares.map((square, index) => {
            if (index === i) {
              return {
                ...squares[selectedIndex],
                state: ''
              };
            }
            if (index === selectedIndex) return {};
            return {
              ...square,
              state: ''
            };
          });
          const theirKingIndex = getKingIndex({
            player: getOpponentPlayerId(player),
            squares: newSquares
          });
          if (
            checkerPos({
              squares: newSquares,
              kingIndex: theirKingIndex,
              player
            }) !== -1
          ) {
            newSquares[theirKingIndex] = {
              ...newSquares[theirKingIndex],
              state: 'check'
            };
          }
          setSquares(newSquares);
          setWhiteFallenPieces(newWhiteFallenPieces);
          setBlackFallenPieces(newBlackFallenPieces);
          setPlayer(getOpponentPlayerId(player));
          setStatus('');
          setTurn(turn === 'white' ? 'black' : 'white');
        }
      }
    }
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

  function isPossibleAndLegal({ src, dest }) {
    if (squares[dest].player === player) {
      return false;
    }
    return (
      getPiece(squares[src]).isMovePossible(
        src,
        dest,
        !!squares[dest].player
      ) &&
      isMoveLegal({
        srcToDestPath: getPiece(squares[src]).getSrcToDestPath(src, dest),
        squares
      })
    );
  }

  function checkerPos({ squares, kingIndex, player }) {
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
        return i;
      }
    }
    return -1;
  }

  function kingWillBeCapturedBy({ src, dest }) {
    let myKingIndex = -1;
    const newSquares = squares.map((square, index) => {
      if (index === dest) {
        return {
          ...squares[src],
          state: ''
        };
      }
      if (index === src) return {};
      return {
        ...square,
        state: ''
      };
    });

    for (let i = 0; i < newSquares.length; i++) {
      if (newSquares[i].type === 'king' && newSquares[i].player === player) {
        myKingIndex = i;
        break;
      }
    }

    for (let i = 0; i < newSquares.length; i++) {
      const checkerPosition = checkerPos({
        squares: newSquares,
        kingIndex: myKingIndex,
        player: getOpponentPlayerId(player)
      });
      if (checkerPosition !== -1) {
        return checkerPosition;
      }
    }
    return -1;
  }
}
