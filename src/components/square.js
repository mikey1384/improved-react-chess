import React from 'react';
import PropTypes from 'prop-types';

Square.propTypes = {
  className: PropTypes.string,
  count: PropTypes.number,
  player: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
  shade: PropTypes.string
};

export default function Square({
  count,
  className,
  shade,
  onClick,
  style,
  player
}) {
  return (
    <button
      style={{ position: 'relative', ...style }}
      className={`square ${shade} ${className}`}
      onClick={onClick}
    >
      {count > 1 && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: '-5px',
            color: player === 'black' ? '#fff' : '#000'
          }}
        >
          &times;{count}
        </div>
      )}
    </button>
  );
}
