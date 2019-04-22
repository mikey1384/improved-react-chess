import React from 'react';
import PropTypes from 'prop-types';
import Square from './Square';
import { css } from 'emotion';

Board.propTypes = {
  onClick: PropTypes.func.isRequired,
  squares: PropTypes.array.isRequired
};

export default function Board({ onClick, squares }) {
  const board = [];
  for (let i = 0; i < 8; i++) {
    const squareRows = [];
    for (let j = 0; j < 8; j++) {
      const squareShade =
        (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
          ? 'light-square'
          : 'dark-square';
      squareRows.push(renderSquare(i * 8 + j, squareShade));
    }
    board.push(
      <div
        key={i}
        className={css`
          &:after {
            clear: both;
            content: '';
            display: table;
          }
        `}
      >
        {squareRows}
      </div>
    );
  }

  return <div>{board}</div>;

  function renderSquare(i, squareShade) {
    return (
      <Square
        key={i}
        style={squares[i] ? squares[i].style : null}
        shade={squareShade}
        onClick={() => onClick(i)}
      />
    );
  }
}

function isEven(num) {
  return num % 2 === 0;
}
