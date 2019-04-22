import React from 'react';
import PropTypes from 'prop-types';
import '../index.css';

Square.propTypes = {
  style: PropTypes.object,
  onClick: PropTypes.func,
  shade: PropTypes.string
};

export default function Square({ shade, onClick, style }) {
  return (
    <button className={'square ' + shade} onClick={onClick} style={style} />
  );
}
