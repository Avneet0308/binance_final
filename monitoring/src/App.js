/* eslint-disable */
import React, {Fragment, useState } from 'react';
import Blocks from './Blocks';
import BtcAndEth from './BtcAndEth';

function App() {
  const [blocks, setBlocks] = useState(['HOT,BTC','MBL,BTC','add']);
  const [priceVal, setPriceVal] = useState({ 0: ['HOT', 'BTC'], 1:['MBL','BTC'] });
  function handleAdd(event) {
    let blockUpdate = [...blocks];
    blockUpdate.pop();
    blockUpdate.push('empty');
    blockUpdate.push('add');
    setPriceVal({ ...priceVal, [blockUpdate.length - 2]: [null, 'BTC'] });
    setBlocks(blockUpdate);
  }

  function handleChange(event) {
    console.log(event.target.value)
    if (event.target.name === 'coin') {
      let basePrice = priceVal[event.target.id][1];
      setPriceVal({
        ...priceVal,
        [event.target.id]: [event.target.value, basePrice],
      });
    } else {
      let coin = priceVal[event.target.id][0];
      setPriceVal({
        ...priceVal,
        [event.target.id]: [coin, event.target.value],
      });

    }
  }

  function handleSubmit(event) {
    let blockUpdate = [...blocks];
    blockUpdate[event.target.id] =
      priceVal[event.target.id][0] + ',' + priceVal[event.target.id][1];
    setBlocks(blockUpdate);
  }

  function handleClose(ind) {
    let blockUpdate = [...blocks];
    blockUpdate.splice(ind, 1);
    setBlocks(blockUpdate);
  }

  function handleReset(ind) {
    let blockUpdate = [...blocks];
    blockUpdate.splice(ind, 1, 'empty');
    setBlocks(blockUpdate);
  }

  return (
    <React.Fragment>
      <BtcAndEth />
      <Blocks
        priceVal={priceVal}
        blocks={blocks}
        onAdd={handleAdd}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={handleClose}
        onReset={handleReset}
      />
    </React.Fragment>
  );
}

export default App;
