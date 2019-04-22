import React from 'react';
import PropTypes from 'prop-types';
import Square from './Square';

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
          ? 'light'
          : 'dark';
      squareRows.push(renderSquare(i * 8 + j, squareShade));
    }
    board.push(<div key={i}>{squareRows}</div>);
  }

  return <div>{board}</div>;

  function renderSquare(i, squareShade) {
    return (
      <Square
        key={i}
        style={squares[i] ? { ...squares[i].style, cursor: 'pointer' } : null}
        shade={squareShade}
        onClick={() => onClick(i)}
      />
    );
  }
}

function isEven(num) {
  return num % 2 === 0;
}
