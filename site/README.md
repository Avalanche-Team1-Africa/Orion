
# Orion

## Background

Orion is a platform where users can buy and sell stocks from the NSE in an easy way. We created Orion to solve the issue of how difficult it is to get NSE stocks. Thus its goal is to make the process of buying and selling NSE stocks as easy as possible

## How is it made

### Backend

The backend does the following:

#### Tokenizing NSE stocks

The backend calls the smart contract function for tokenizing stocks and stores the stocks bought and sold on the platform in a MongoDB database.

The backend uses the [Equity Market Data Feed API](https://www.nse.co.ke/dataservices/wp-content/uploads/Equities-Market-Data-Feed-MITCH-UDP_v1.22.pdf) to get the current price of a stock on NSE.

#### Displaying current stock prices

The backend connects to the Real Time Channel described in the API which sends real time updates of the instruments on NSE. It listens for statistics from the channel. The specific message listened for is the **Statistics** message and in particular the **closing price**.

##### Connecting to the RPC Channel

The RPC channel uses UDP.

There are multiple groups and instruments can be in any of the groups but in just one during a day. The instrument can move to another group on another day

> Documentation does not show the IP addresses of the groups

