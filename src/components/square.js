import React from 'react';
import PropTypes from 'prop-types';

Square.propTypes = {
  style: PropTypes.object,
  onClick: PropTypes.func,
  shade: PropTypes.string
};

export default function Square({ shade, onClick, style }) {
  return (
    <button style={style} className={'square ' + shade} onClick={onClick} />
  );
}
