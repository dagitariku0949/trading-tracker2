//+------------------------------------------------------------------+
//|                                        TradingDashboardSync.mq4  |
//|                                   Trading Dashboard Auto Sync EA |
//|                                  Syncs trades to your dashboard  |
//+------------------------------------------------------------------+
#property copyright "Trading Dashboard"
#property link      "http://localhost:5173"
#property version   "1.00"
#property strict

// Input Parameters
input string DashboardURL = "http://localhost:4000/api/trades"; // Dashboard API URL
input int    CheckInterval = 5;  // Check for new trades every X seconds
input bool   SyncOnClose = true; // Send trade when closed
input bool   SyncOnOpen = true;  // Send trade when opened
input bool   ShowAlerts = true;  // Show sync notifications

// Global Variables
datetime lastCheck = 0;
int lastTotalTrades = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("Trading Dashboard Sync EA Started");
   Print("Dashboard URL: ", DashboardURL);
   Print("Sync on Open: ", SyncOnOpen);
   Print("Sync on Close: ", SyncOnClose);
   
   // Check internet connection
   if(!IsConnected())
   {
      Alert("No internet connection! EA will not sync.");
      return(INIT_FAILED);
   }
   
   // Initial sync of all closed trades
   SyncAllClosedTrades();
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("Trading Dashboard Sync EA Stopped");
}

//+------------------------------------------------------------------+
//| Expert tick function                                               |
//+------------------------------------------------------------------+
void OnTick()
{
   // Check for new trades every X seconds
   if(TimeCurrent() - lastCheck >= CheckInterval)
   {
      CheckForNewTrades();
      lastCheck = TimeCurrent();
   }
}

//+------------------------------------------------------------------+
//| Check for new trades                                               |
//+------------------------------------------------------------------+
void CheckForNewTrades()
{
   int currentTotal = OrdersHistoryTotal();
   
   // If new closed trade detected
   if(currentTotal > lastTotalTrades)
   {
      // Sync the new closed trades
      for(int i = lastTotalTrades; i < currentTotal; i++)
      {
         if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
         {
            if(SyncOnClose)
            {
               SendTradeToServer(OrderTicket(), true);
            }
         }
      }
      lastTotalTrades = currentTotal;
   }
   
   // Check for newly opened trades
   if(SyncOnOpen)
   {
      for(int i = 0; i < OrdersTotal(); i++)
      {
         if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
         {
            // Check if this is a new trade (not synced yet)
            // You can add logic here to track synced trades
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Sync all closed trades (initial sync)                             |
//+------------------------------------------------------------------+
void SyncAllClosedTrades()
{
   Print("Syncing all closed trades...");
   
   int total = OrdersHistoryTotal();
   int synced = 0;
   
   for(int i = 0; i < total; i++)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         if(SendTradeToServer(OrderTicket(), true))
         {
            synced++;
         }
      }
   }
   
   lastTotalTrades = total;
   
   if(ShowAlerts)
   {
      Alert("Synced ", synced, " trades to dashboard");
   }
   
   Print("Initial sync complete: ", synced, " trades");
}

//+------------------------------------------------------------------+
//| Send trade data to server                                          |
//+------------------------------------------------------------------+
bool SendTradeToServer(int ticket, bool isClosed)
{
   if(!OrderSelect(ticket, SELECT_BY_TICKET))
   {
      Print("Error selecting order: ", ticket);
      return false;
   }
   
   // Prepare trade data
   string symbol = OrderSymbol();
   string direction = (OrderType() == OP_BUY || OrderType() == OP_BUYLIMIT || OrderType() == OP_BUYSTOP) ? "LONG" : "SHORT";
   double entryPrice = OrderOpenPrice();
   double exitPrice = isClosed ? OrderClosePrice() : 0;
   double lotSize = OrderLots();
   double pnl = OrderProfit() + OrderSwap() + OrderCommission();
   string status = isClosed ? "CLOSED" : "OPEN";
   datetime openTime = OrderOpenTime();
   
   // Build JSON payload
   string json = "{";
   json += "\"trade_date\":\"" + TimeToString(openTime, TIME_DATE|TIME_MINUTES) + "\",";
   json += "\"symbol\":\"" + symbol + "\",";
   json += "\"direction\":\"" + direction + "\",";
   json += "\"entry_price\":" + DoubleToString(entryPrice, 5) + ",";
   
   if(isClosed)
   {
      json += "\"exit_price\":" + DoubleToString(exitPrice, 5) + ",";
   }
   
   json += "\"lot_size\":" + DoubleToString(lotSize, 2) + ",";
   json += "\"pnl\":" + DoubleToString(pnl, 2) + ",";
   json += "\"status\":\"" + status + "\",";
   json += "\"weekly_tf\":0,";
   json += "\"daily_tf\":0,";
   json += "\"h4_tf\":0,";
   json += "\"h1_tf\":0,";
   json += "\"lower_tf\":0,";
   json += "\"notes\":\"Auto-synced from MT4\"";
   json += "}";
   
   // Send to server using WebRequest
   string headers = "Content-Type: application/json\r\n";
   char post[];
   char result[];
   string resultHeaders;
   
   StringToCharArray(json, post, 0, StringLen(json));
   
   int res = WebRequest(
      "POST",
      DashboardURL,
      headers,
      5000,  // timeout
      post,
      result,
      resultHeaders
   );
   
   if(res == 200)
   {
      Print("Trade synced successfully: ", symbol, " ", direction, " P&L: ", pnl);
      return true;
   }
   else
   {
      Print("Error syncing trade. HTTP Code: ", res);
      Print("Make sure dashboard is running and URL is correct");
      return false;
   }
}

//+------------------------------------------------------------------+
//| Check if connected to internet                                     |
//+------------------------------------------------------------------+
bool IsConnected()
{
   return(TerminalInfoInteger(TERMINAL_CONNECTED));
}
//+------------------------------------------------------------------+
