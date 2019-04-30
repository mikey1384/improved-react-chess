import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Square from './Square';
import getPiece from '../helpers/piece';
import { css } from 'emotion';

Board.propTypes = {
  onClick: PropTypes.func.isRequired,
  player: PropTypes.number.isRequired,
  squares: PropTypes.array.isRequired
};

export default function Board({ onClick, squares, player }) {
  const board = [];
  for (let i = 0; i < 8; i++) {
    const squareRows = [];
    for (let j = 0; j < 8; j++) {
      const index = i * 8 + j;
      squareRows.push(
        <Square
          key={index}
          className={squares[index].state}
          style={
            squares[index].player
              ? {
                  ...getPiece(squares[index]).style,
                  cursor:
                    player === squares[index].player ||
                    squares[index].state === 'highlighted'
                      ? 'pointer'
                      : 'default'
                }
              : getPiece(squares[index]).style
          }
          shade={
            (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
              ? 'light'
              : 'dark'
          }
          onClick={() => onClick(index)}
        />
      );
    }
    board.push(<Fragment key={i}>{squareRows}</Fragment>);
  }
  return (
    <div
      className={css`
        margin: 0 auto;
        width: 480px;
        height: 480px;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
      `}
    >
      {board}
    </div>
  );
}

function isEven(num) {
  return num % 2 === 0;
}
