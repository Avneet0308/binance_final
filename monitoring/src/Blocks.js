/* eslint-disable */
import React,{ Fragment } from 'react';
import PriceBlock from './PriceBlock';
import AddBlock from './AddBlock';
import EmptyBlock from './EmptyBlock';
import './blocks.css';

function Blocks(props) {
  return (
    <React.Fragment>
      {props.blocks.map((block, index) => {
        if (block === 'add') {
          return (
            <AddBlock key={'block' + index} index={index} onAdd={props.onAdd} />
          );
        } else if (block === 'empty') {
          return (
            <EmptyBlock
              key={'block' + index}
              index={index}
              priceVal={props.priceVal}
              onChange={props.onChange}
              onSubmit={props.onSubmit}
              onClose={props.onClose}
            />
          );
        } else {
          return (
            <div
              style={{ paddingLeft: '2px',paddingRight:'2px' }}
              key={index}
              className="col s12 m6 l3"
            >
              <div className="divc">
                <PriceBlock
                  index={index}
                  block={block}
                  onClose={props.onClose}
                  onReset={props.onReset}
                />
              </div>
            </div>
          );
        }
      })}
    </React.Fragment>
  );
}

export default Blocks;
