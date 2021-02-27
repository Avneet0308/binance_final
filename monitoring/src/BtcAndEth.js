/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './BtcAndEth.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ReconnectWebSocket(url, onmsg, timeInterval,flag) {
  var ws = new WebSocket(url);
  ws.onopen = function (e){
  if(flag === '0')
  ws.send('{"method":"SUBSCRIBE","params":["5UyANoSQLFTOxMNlw5RWbMYI0ZT5NexZRk2aJnVl0a7wozZfFLOUudU7gIyD"],"id":3}');
 }

  ws.onmessage = onmsg;

  ws.onclose = function (e) {
    console.log(
      'Socket is closed. Reconnect will be attempted in 1 second.',
      e.reason
    );
    setTimeout(function () {
      ReconnectWebSocket(url, onmsg, timeInterval);
    }, timeInterval);
  };

  ws.onerror = function (err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };
}

function BtcAndEth(props) {
  function trades_socket() {
    let btcOnMsg = function (event) {
      let data = JSON.parse(event.data).data;
      if (data.e === 'aggTrade') {
        setBtcPrices({
          price: parseFloat(data.p).toFixed(2),
          b: data.m,
        });
      }
    };

    let ethOnMsg = function (event) {
      let stream = JSON.parse(event.data).stream;
      let data = JSON.parse(event.data).data;
      if (stream === 'ethusdt@aggTrade') {
        setEthPrices({
          price: parseFloat(data.p).toFixed(2),
          b: data.m,
        });
      }
      //TOKEN for the specific account
      else if(stream==='5UyANoSQLFTOxMNlw5RWbMYI0ZT5NexZRk2aJnVl0a7wozZfFLOUudU7gIyD'){
        //order update data
        if(data.e==='executionReport'){
          let symbol = data.s;
          let order = data.S;
          let oderType = data.o;
          let qtn = Math.round(parseFloat(data.q));
          let price = Math.round(parseFloat(data.p)*100000000);
          let filledInThisStream = data.l;
          let filledInThisStreamBtc = data.Y;
          let filledInTotal = data.z;
          let filledInTotalbtc = data.Z;
          let TradeStatus = data.X;
            
          //update of new placed order
          if(TradeStatus === 'PARTIALLY_FILLED')
          {
            let pfilled = () => toast.info(symbol+' : Filled :'+Math.round(parseFloat(filledInTotal)/qtn*100)+"%", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              });

              pfilled();
              
          }
          else if(TradeStatus === 'NEW'){

            let newOrder = ()=> toast('Order Placed.......................'+symbol+" Qtantity : "+qtn+" price: "+price, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              });
              newOrder();
          }

          else if(TradeStatus === 'FILLED'){

            let filled = ()=> toast.success('Order Filled.......................'+symbol+" Qtantity : "+qtn+" price: "+price, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              });
              filled();
          }

          else if(TradeStatus === 'CANCELED'){

            let canceled = ()=> toast.error('Order Canceled.....................'+symbol+" Qtantity : "+qtn+" price: "+price, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              });
              canceled();
          }
          
        }
      }
    };

    ReconnectWebSocket(
      `wss://stream.binance.com/stream?streams=!miniTicker@arr@3000ms/btcusdt@depth/btcusdt@aggTrade`,
      btcOnMsg,
      1000,'1'
    );
    ReconnectWebSocket(
      `wss://stream.binance.com/stream?streams=!miniTicker@arr@3000ms/ethusdt@depth/ethusdt@aggTrade`,
      ethOnMsg,
      1000,'0'
    );
  }

  const [btcPrices, setBtcPrices] = useState({ price: '0000.00', b: true });

  const [ethPrices, setEthPrices] = useState({ price: '000.00', b: true });

  useEffect(trades_socket, []);

  return (
    <div className="priceDiv">
      <ToastContainer
position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
/>
      <table className="priceTable">
        <tbody>
          <tr>
            <td>
              <h3 style={{ color: btcPrices.b ? 'red' : 'green' }}>
                BTC {btcPrices.price}
              </h3>
            </td>
            <td>
              <h3 style={{ color: ethPrices.b ? 'red' : 'green' }}>
                ETH {ethPrices.price}
              </h3>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BtcAndEth;
