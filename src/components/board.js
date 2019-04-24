import React from 'react';
import PropTypes from 'prop-types';
import Square from './Square';
import getPiece from '../helpers/piece';

Board.propTypes = {
  onClick: PropTypes.func.isRequired,
  squares: PropTypes.array.isRequired
};

export default function Board({ onClick, squares }) {
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
              ? { ...getPiece(squares[index]).style, cursor: 'pointer' }
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
    board.push(<div key={i}>{squareRows}</div>);
  }
  return <div>{board}</div>;
}

function isEven(num) {
  return num % 2 === 0;
}
