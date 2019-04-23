import React from 'react';
import PropTypes from 'prop-types';

Square.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
  shade: PropTypes.string
};

export default function Square({ className, shade, onClick, style }) {
  return (
    <button
      style={style}
      className={`square ${shade} ${className}`}
      onClick={onClick}
    />
  );
}
