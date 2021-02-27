import React, { useState, useEffect } from 'react';
import './priceBlock.css';
import binanceSocket from './websocket';

function PriceBlock(props) {
  const [coin, baseCoin] = props.block.split(',');
  const [trades, setTrades] = useState([]);
  const [tradesUpdate, setTradesUpdate] = useState([]);
  useEffect(() => {
    async function fetchTrades() {
      let response = await fetch(
        `https://api.binance.com/api/v3/trades?symbol=${coin}${baseCoin}&limit=100`
      );
      let data = await response.json();
      setTrades(data);
    }
    fetchTrades();
    binanceSocket(coin, baseCoin, setTradesUpdate);
  }, []);

  useEffect(() => {
    trades.pop();
    trades.unshift(tradesUpdate);
  }, [tradesUpdate]);

  return (
    <>
      <div className="leftDiv"></div>
      <div className="rightDiv">
        <table className="tradeTable">
          <thead>
            <tr>
              <td>
                Price{'\u00A0'}
                {'\u00A0'}
              </td>
              <td>
                Quantity{'\u00A0'}
                {'\u00A0'}
              </td>
              <td>
                {'\u00A0'}Time{'\u00A0'}
              </td>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, ind) => {
              return (
                <tr
                  key={ind}
                  style={{ color: trade.isBuyerMaker ? 'red' : 'green' }}
                >
                  <td>
                    {
                      /*Math.round(parseFloat(trade.price) * 100000000)*/ trade.price
                    }
                  </td>
                  <td>
                    {'\u00A0'}
                    {'\u00A0'}
                    {parseFloat(trade.quoteQty).toFixed(4)}
                    {'\u00A0'}
                    {'\u00A0'}
                  </td>
                  <td>
                    {new Date(new Date(trade.time).toUTCString())
                      .toString()
                      .slice(16, 24)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default PriceBlock;
