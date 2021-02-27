/* eslint-disable */
import React from 'react';

function EmptyBlock(props) {
  let coins = [
    'HOT',
    'MBL',
    'STMX',
    'POE',
    'DOGE',
    'DREP',
    'SC',
    'TNB',
    'FUEL',
    'PHB',
    'ANKR',
    'TROY',
    'FUN',
    'CELR',
    'ONE',
    'ERD',
    'XVG',
    'TFUEL',
    'DOCK',
    'POA',
    'VET',
    'MATIC',
  ];
  return (
    <div style={{ paddingLeft: '2px',paddingRight:'2px' }} className="col s12 m6 l3">
      <form className="divc">
        <div>
          <div style={{ float: 'right' }}>
            <a
              className="icons"
              id={'a' + props.index}
              onClick={() => props.onClose(parseInt(props.index))}
              href="#"
            >
              <i className="material-icons">close</i>
            </a>
          </div>
        </div>
        <div style={{ margin: '10px' }}>
          <select
            name="coin"
            id={props.index}
            style={{ border: '1px black solid' }}
            className="browser-default"
            defaultValue={props.priceVal[props.index][0]}
            onChange={props.onChange}
          >
            <option value="" disabled selected>
              Choose Coin
            </option>
            {coins.map((c, ci) => (
              <option key={ci} value={c}>
                {c}
              </option>
            ))}
          </select>
          <br />
          <select
            name="basecoin"
            id={props.index}
            style={{ border: '1px black solid' }}
            className="browser-default"
            defaultValue={props.priceVal[props.index][1] || 'BTC'}
            onChange={props.onChange}
          >
           
            <option value="BTC">BTC</option>
            <option value="USDT">USDT</option>
            <option value="BNB">BNB</option>
          </select>
          <br />
          <a
            id={props.index}
            className="center-align btn btn-large waves-effect waves-light red"
            onClick={props.onSubmit}
          >
            Submit
          </a>
        </div>
      </form>
    </div>
  );
}

export default EmptyBlock;
