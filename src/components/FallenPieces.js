import React from 'react';
import PropTypes from 'prop-types';
import Square from './Square';
import getPiece from '../helpers/piece';

FallenPieces.propTypes = {
  whiteFallenPieces: PropTypes.array.isRequired,
  blackFallenPieces: PropTypes.array.isRequired
};

export default function FallenPieces({ whiteFallenPieces, blackFallenPieces }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '6rem'
      }}
    >
      <div style={{ minHeight: '3rem' }}>
        {whiteFallenPieces.map((piece, index) => (
          <Square
            key={index}
            piece={getPiece(piece)}
            style={{ ...getPiece(piece).style, backgroundColor: null }}
          />
        ))}
      </div>
      <div style={{ minHeight: '3rem' }}>
        {blackFallenPieces.map((piece, index) => (
          <Square
            key={index}
            piece={getPiece(piece)}
            style={{ ...getPiece(piece).style, backgroundColor: null }}
          />
        ))}
      </div>
    </div>
  );
}
