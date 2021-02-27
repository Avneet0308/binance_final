import React from 'react';

function AddBlock(props) {
  return (
    <div style={{ paddingLeft: '2px',paddingRight:'2px' }} className="col s12 m6 l3">
      <div className="divca valign-wrapper">
        <a
          id={'add' + props.index}
          className="center-align btn-floating btn-large waves-effect waves-light red"
          onClick={props.onAdd}
        >
          <i className="material-icons">add</i>
        </a>
      </div>
    </div>
  );
}

export default AddBlock;
