/* eslint-disable */
import React from 'react';
import './priceBlock.css';
import Binance from 'binance-api-node';

// Authenticated client, can make signed calls
const client = Binance({
  apiKey: '7wKI360u7GAGINr0euKn6EzEeZtjk3FC2cX91ZhcacbpX4fqMRVkZEPr6IPL2E1Y',
  apiSecret: 'AgIXUgqoj3aYdKtKHOHDQgsNWm3w2vqBByw2UKvsaEXJFSrW9epXO2I2spqGR6HO',
});

class PriceBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      trades: [0],
      depth: { asks: [0, 0], bids: [0, 0] },
      order: 'BUY',
      orderType: 'LIMIT',
      price: '',
      stop: '',
      limit: '',
      inBtc: '',
      amount: '',
    };

    this.handleOrderChange = this.handleOrderChange.bind(this);
    this.handleOrderTypeChange = this.handleOrderTypeChange.bind(this);
    this.handlePrice = this.handlePrice.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handleLimit = this.handleLimit.bind(this);
    this.handleInBtc = this.handleInBtc.bind(this);
    this.handleAmount = this.handleAmount.bind(this);
    this.handleDepthClick = this.handleDepthClick.bind(this);
    this.handleTradeClick = this.handleTradeClick.bind(this);
  }

  async handleTradeClick(event) {
    const [coin, baseCoin] = this.props.block.split(',');
    let symbol = coin + baseCoin;
    let quantity = this.state.amount;
    let price = this.state.price;
    let side = this.state.order;
    let type = this.state.orderType;
    if (type === 'MARKET') {
      console.log(
        (async () =>
          await client.order({
            symbol: symbol,
            side: side,
            type: type,
            quantity: quantity,
          }))()
      );
    } else if (type === 'LIMIT') {
      console.log(
        (async () =>
          await client.order({
            symbol: symbol,
            side: side,
            type: type,
            price:
              '0.' + '0'.repeat(8 - price.toString().length) + price.toString(),
            quantity: quantity,
          }))()
      );
    }
  }

  handleOrderChange(event) {
    this.setState({ order: event.target.value });
  }

  handleOrderTypeChange(event) {
    let val = event.target.value;
    this.setState({ orderType: event.target.value });
  }
  handlePrice(event) {
    this.setState({ price: event.target.value });
  }
  handleStop(event) {
    this.setState({ stop: event.target.value });
  }
  handleLimit(event) {
    this.setState({ limit: event.target.value });
  }
  handleInBtc(event) {
    if (isNaN(event.target.value)) event.target.value = '';
    if (this.state.price !== '')
      if (event.target.value !== '')
        this.setState({
          amount: Math.round(
            parseFloat(event.target.value) /
              (parseFloat(this.state.price) / 100000000)
          ),
        });
      else this.setState({ amount: '' });
    this.setState({ inBtc: event.target.value });
  }
  handleAmount(event) {
    if (isNaN(event.target.value)) event.target.value = '';
    if (this.state.price !== '')
      if (event.target.value !== '')
        this.setState({
          inBtc:
            parseFloat(event.target.value) *
            (parseFloat(this.state.price) / 100000000),
        });
      else this.setState({ inBtc: '' });
    this.setState({ amount: event.target.value });
  }
  handleDepthClick(val) {
    if (this.state.price !== '')
      if (this.state.inBtc !== '')
        this.setState({
          amount: Math.round(parseFloat(this.state.inBtc) / parseFloat(val)),
        });
    this.setState({ price: Math.round(parseFloat(val * 100000000)) });
  }

  componentDidMount() {
    const [coin, baseCoin] = this.props.block.split(',');
    console.log(baseCoin);
    //function a() to fetch trades data through https API
    const a = async () => {
      let response = await fetch(
        `https://www.binance.com/api/v1/aggTrades?limit=1000&symbol=${coin}${baseCoin}`
      );
      let data = await response.json();
      this.setState({ trades: data.reverse() });
    };

    //function b() to fetch depth data through https API
    const b = async () => {
      let response = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${coin}${baseCoin}&limit=5`
      );
      let data = await response.json();
      this.setState({
        depth: {
          asks: data.asks.slice(0, 2).reverse(),
          bids: data.bids.slice(0, 2),
        },
      });
    };

    //function of reconnecting WebSocket
    function ReconnectWebSocket(classObj, url, onmsg, timeInterval) {
      a();
      b();
      classObj.ws = new WebSocket(url);

      classObj.ws.onmessage = onmsg;

      classObj.ws.onclose = function (e) {
        console.log(
          'Socket is closed. Reconnect will be attempted in 1 second.',
          e.reason
        );
        setTimeout(function () {
          ReconnectWebSocket(classObj, url, onmsg, timeInterval);
        }, timeInterval);
      };

      classObj.ws.onerror = function (err) {
        console.error(
          'Socket encountered error: ',
          err.message,
          'Closing socket'
        );
        classObj.ws.close();
      };
    }

    //fuction to handle the incomming data from the socket
    let socketonmessage = (event) => {
      let stream = JSON.parse(event.data).stream;
      let data = JSON.parse(event.data).data;
      let tradesUpdate = this.state.trades;

      if (
        stream === `${coin.toLowerCase()}${baseCoin.toLowerCase()}@aggTrade`
      ) {
        tradesUpdate.pop();
        tradesUpdate.unshift({
          T: parseInt(data.T),
          p: data.p,
          q: parseFloat(data.q),
          m: data.m,
        });
        this.setState({ trades: tradesUpdate });
      } else if (
        stream === `${coin.toLowerCase()}${baseCoin.toLowerCase()}@depth`
      ) {
        let flag = 0;
        for (let i = 0; i < data.a.length; i++) {
          if (data.a[i] < this.state.depth.asks[1]) {
            flag = 1;
            break;
          } else if (data.a[i][0] === this.state.depth.asks[0][0])
            this.setState({
              depth: {
                asks: [data.a[i], this.state.depth.asks[1]],
                bids: [...this.state.depth.bids],
              },
            });
          else if (data.a[i][0] === this.state.depth.asks[1][0])
            this.setState({
              depth: {
                asks: [this.state.depth.asks[0], data.a[i]],
                bids: [...this.state.depth.bids],
              },
            });
        }
        for (let i = 0; i < data.b.length; i++) {
          if (data.b[i] > this.state.depth.bids[0]) {
            flag = 1;
            break;
          } else if (data.b[i][0] === this.state.depth.bids[0][0])
            this.setState({
              depth: {
                bids: [data.b[i], this.state.depth.bids[1]],
                asks: [...this.state.depth.asks],
              },
            });
          else if (data.b[i][0] === this.state.depth.bids[1][0])
            this.setState({
              depth: {
                bids: [this.state.depth.bids[0], data.b[i]],
                asks: [...this.state.depth.asks],
              },
            });
        }
        if (flag === 1) b();
      }
    };

    //ReconnectWebSocket function call
    ReconnectWebSocket(
      this,
      `wss://stream.binance.com/stream?streams=!miniTicker@arr@3000ms/${coin.toLowerCase()}${baseCoin.toLowerCase()}@depth/${coin.toLowerCase()}${baseCoin.toLowerCase()}@aggTrade`,
      socketonmessage,
      1000
    );
  } //end of componentDidMount()

  render() {
    return (
      <React.Fragment>
        {/* Left Division for Depth, Buy and Sell */}
        <div className="leftDiv">
          <div>
            {/* Name of Coin and current price */}
            <h6
              style={
                this.state.trades.length > 0
                  ? {
                      margin: '0px',
                      float: 'left',
                      color: this.state.trades[0]['m'] ? 'red' : 'green',
                    }
                  : {}
              }
            >
              {this.props.block.split(',')[0]}
              {'   '}
              {this.state.trades.length > 0
                ? Math.round(parseFloat(this.state.trades[0]['p']) * 100000000)
                : ''}
            </h6>
            {/* reset button */}
            <div style={{ float: 'right' }}>
              <a
                className="tooltipped icons"
                data-position="bottom"
                data-tooltip="Reset"
                id={'a' + this.props.index}
                onClick={() => this.props.onReset(parseInt(this.props.index))}
                tooltip="Reset"
                href="#"
              >
                <i className="tiny material-icons">repeat</i>
              </a>
              {/* close button */}
              <a
                className="icons"
                id={'a' + this.props.index}
                onClick={() => this.props.onClose(parseInt(this.props.index))}
                href="#"
              >
                <i className="tiny material-icons">close</i>
              </a>
            </div>
          </div>
          {/* Depth Table */}
          <table className="depthTable">
            <tbody>
              {this.state.depth.asks.map((ask, i) => {
                return (
                  <tr
                    key={'ask' + i}
                    style={{ color: 'red' }}
                    onClick={() => this.handleDepthClick(ask[0])}
                  >
                    <td style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                      <p>{Math.round(ask[0] * 100000000)}</p>
                    </td>
                    <td style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                      <p>{parseInt(ask[1])}</p>
                    </td>
                    <td style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                      <p>
                        {(parseFloat(ask[0]) * parseFloat(ask[1])).toFixed(4)}
                      </p>
                    </td>
                  </tr>
                );
              })}

              {this.state.depth.bids.map((bid, i) => {
                return (
                  <tr
                    key={'bid' + i}
                    style={{ color: 'green' }}
                    onClick={() => this.handleDepthClick(bid[0])}
                  >
                    <td style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                      <p>{Math.round(bid[0] * 100000000)}</p>
                    </td>
                    <td style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                      <p>{parseInt(bid[1])}</p>
                    </td>
                    <td style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                      <p>
                        {(parseFloat(bid[0]) * parseFloat(bid[1])).toFixed(4)}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Div for other pair current price */}
          <div>Div For Other Pairs</div>

          {/* Div for Buy or Sell */}
          <div
            style={{
              padding: '3px',
              border: '1px black solid',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              <select
                name="Buy"
                style={{
                  padding: '0.5px',
                  border: '1px black solid',
                  height: '20px',
                  width: '35%',
                }}
                className="browser-default"
                defaultValue={this.state.order}
                onChange={this.handleOrderChange}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>

              <select
                name="Buy"
                style={{
                  padding: '0.5px',
                  border: '1px black solid',
                  height: '20px',
                  width: '60%',
                }}
                className="browser-default"
                defaultValue={this.state.orderType}
                onChange={this.handleOrderTypeChange}
              >
                <option value="MARKET">MARKET</option>
                <option value="LIMIT">LIMIT</option>
                {/* <option value="STOP LIMIT" >STOP LIMIT</option>
                          <option value="OCO" >OCO</option> */}
              </select>
            </div>
            {
              /* for dynamic input fields of orderTypes */
              (() => {
                switch (this.state.orderType) {
                  case 'MARKET':
                    return (
                      <React.Fragment>
                        <input
                          style={{
                            width: '100%',
                            marginTop: '1px',
                            marginBottom: '1px',
                          }}
                          className="browser-default"
                          type="text"
                          placeholder="MARKET"
                          value="MARKET"
                          disabled
                        />
                        <input
                          style={{
                            width: '100%',
                            marginTop: '1px',
                            marginBottom: '1px',
                          }}
                          className="browser-default"
                          type="text"
                          placeholder="Amount"
                          value={this.state.amount}
                          onChange={this.handleAmount}
                        />
                      </React.Fragment>
                    );
                  case 'LIMIT':
                    return (
                      <React.Fragment>
                        <input
                          style={{
                            width: '100%',
                            marginTop: '1px',
                            marginBottom: '1px',
                          }}
                          className="browser-default"
                          type="text"
                          placeholder="Price"
                          value={this.state.price}
                          onChange={this.handlePrice}
                        />
                        <input
                          style={{
                            width: '100%',
                            marginTop: '1px',
                            marginBottom: '1px',
                          }}
                          className="browser-default"
                          type="text"
                          placeholder="In BTC"
                          value={this.state.inBtc}
                          onChange={this.handleInBtc}
                        />
                        <input
                          style={{
                            width: '100%',
                            marginTop: '1px',
                            marginBottom: '1px',
                          }}
                          className="browser-default"
                          type="text"
                          placeholder="Amount"
                          value={this.state.amount}
                          onChange={this.handleAmount}
                        />
                      </React.Fragment>
                    );
                  // case 'STOP LIMIT':
                  // return(
                  //   <>
                  //   <input style={{width:"100%",marginTop:"1px",marginBottom:"1px"}} className="browser-default" type="text" placeholder="STOP" value={this.state.stop} onChange={this.handleStop}/>
                  //   <input style={{width:"100%",marginTop:"1px",marginBottom:"1px"}} className="browser-default" type="text" placeholder="LIMIT" value={this.state.limit} onChange={this.handleLimit}/>
                  //   <input style={{width:"100%",marginTop:"1px",marginBottom:"1px"}} className="browser-default" type="text" placeholder="In BTC" value={this.state.inBtc} onChange={this.handleInBtc}/>
                  //   <input style={{width:"100%",marginTop:"1px",marginBottom:"1px"}} className="browser-default" type="text" placeholder="Amount" value={this.state.amount} onChange={this.handleAmount}/>
                  //   </>
                  // );
                  // case 'OCO':
                  // return(
                  //   <>
                  //   <input style={{width:"100%",marginTop:"1px",marginBottom:"1px"}} className="browser-default" type="text" placeholder="Price" value={this.state.price} onChange={this.handlePrice}/>
                  //   <input style={{width:"100%",marginTop:"1px",marginBottom:"1px"}} className="browser-default" type="text" placeholder="STOP" value={this.state.stop} onChange={this.handleStop}/>
                  //   <input style={{width:"100%",marginTop:"1px",marginBottom:"1px"}} className="browser-default" type="text" placeholder="LIMIT" value={this.state.limit} onChange={this.handleLimit}/>
                  //   <input style={{width:"100%",marginTop:"1px",marginBottom:"1px"}} className="browser-default" type="text" placeholder="In BTC" value={this.state.inBtc} onChange={this.handleInBtc}/>
                  //   <input style={{width:"100%",marginTop:"1px",marginBottom:"1px"}} className="browser-default" type="text" placeholder="Amount" value={this.state.amount} onChange={this.handleAmount}/>
                  //   </>
                  // );
                }
              })()
            }
            {
              /* Conditional Button Buy or sell */
              this.state.order === 'BUY' ? (
                <a
                  style={{
                    width: '100%',
                    marginTop: '2px',
                    marginBottom: '2px',
                    height: '30px',
                  }}
                  className="center-align btn btn-small waves-effect waves-light green"
                  onClick={this.handleTradeClick}
                >
                  BUY
                </a>
              ) : (
                <a
                  style={{
                    width: '100%',
                    marginTop: '2px',
                    marginBottom: '2px',
                    height: '30px',
                  }}
                  className="center-align btn btn-small waves-effect waves-light red"
                  onClick={this.handleTradeClick}
                >
                  SELL
                </a>
              )
            }
          </div>
        </div>
        {/* Division for Trades */}
        <div className="rightDiv">
          <table className="tradeTable">
            <thead>
              <tr>
                <td>
                  <p>Price</p>
                </td>
                <td>
                  <p>Quantity</p>
                </td>
                <td>
                  <p>Time</p>
                </td>
              </tr>
            </thead>
            <tbody>
              {this.state.trades.map((trade, ind) => {
                return (
                  <tr key={ind} style={{ color: trade.m ? 'red' : 'green' }}>
                    <td style={{ paddingTop: '1px' }}>
                      <p>{Math.round(parseFloat(trade.p) * 100000000)}</p>
                    </td>
                    <td style={{ paddingTop: '1px' }}>
                      <p>
                        {(parseFloat(trade.q) * parseFloat(trade.p)).toFixed(4)}
                      </p>
                    </td>
                    <td style={{ paddingTop: '1px' }}>
                      <p>
                        {new Date(new Date(trade.T).toUTCString())
                          .toString()
                          .slice(16, 24)}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}

export default PriceBlock;

