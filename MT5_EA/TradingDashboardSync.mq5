//+------------------------------------------------------------------+
//|                                        TradingDashboardSync.mq5  |
//|                                   Trading Dashboard Auto Sync EA |
//|                                  Syncs trades to your dashboard  |
//+------------------------------------------------------------------+
#property copyright "Trading Dashboard"
#property link      "http://localhost:5173"
#property version   "1.00"

// Input Parameters
input string DashboardURL = "http://localhost:4000/api/trades"; // Dashboard API URL
input int    CheckInterval = 5;  // Check for new trades every X seconds
input bool   SyncOnClose = true; // Send trade when closed
input bool   ShowAlerts = true;  // Show sync notifications

// Global Variables
datetime lastCheck = 0;
int lastTotalTrades = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("Trading Dashboard Sync EA Started (MT5)");
   Print("Dashboard URL: ", DashboardURL);
   Print("Sync on Close: ", SyncOnClose);
   
   // Check internet connection
   if(!TerminalInfoInteger(TERMINAL_CONNECTED))
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
   int currentTotal = HistoryDealsTotal();
   
   // If new closed trade detected
   if(currentTotal > lastTotalTrades)
   {
      // Sync the new closed trades
      HistorySelect(0, TimeCurrent());
      
      for(int i = lastTotalTrades; i < currentTotal; i++)
      {
         ulong ticket = HistoryDealGetTicket(i);
         if(ticket > 0)
         {
            if(HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_OUT)
            {
               if(SyncOnClose)
               {
                  SendTradeToServer(ticket);
               }
            }
         }
      }
      lastTotalTrades = currentTotal;
   }
}

//+------------------------------------------------------------------+
//| Sync all closed trades (initial sync)                             |
//+------------------------------------------------------------------+
void SyncAllClosedTrades()
{
   Print("Syncing all closed trades...");
   
   HistorySelect(0, TimeCurrent());
   int total = HistoryDealsTotal();
   int synced = 0;
   
   for(int i = 0; i < total; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket > 0)
      {
         if(HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_OUT)
         {
            if(SendTradeToServer(ticket))
            {
               synced++;
            }
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
bool SendTradeToServer(ulong ticket)
{
   if(!HistoryDealSelect(ticket))
   {
      Print("Error selecting deal: ", ticket);
      return false;
   }
   
   // Get deal properties
   string symbol = HistoryDealGetString(ticket, DEAL_SYMBOL);
   long dealType = HistoryDealGetInteger(ticket, DEAL_TYPE);
   string direction = (dealType == DEAL_TYPE_BUY) ? "LONG" : "SHORT";
   double price = HistoryDealGetDouble(ticket, DEAL_PRICE);
   double volume = HistoryDealGetDouble(ticket, DEAL_VOLUME);
   double profit = HistoryDealGetDouble(ticket, DEAL_PROFIT);
   double commission = HistoryDealGetDouble(ticket, DEAL_COMMISSION);
   double swap = HistoryDealGetDouble(ticket, DEAL_SWAP);
   datetime dealTime = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
   
   // Get position ticket to find entry price
   ulong positionTicket = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
   double entryPrice = price; // Default to current price
   double exitPrice = price;
   
   // Try to find entry deal
   HistorySelectByPosition(positionTicket);
   int dealsTotal = HistoryDealsTotal();
   
   for(int i = 0; i < dealsTotal; i++)
   {
      ulong dealTicket = HistoryDealGetTicket(i);
      if(HistoryDealGetInteger(dealTicket, DEAL_ENTRY) == DEAL_ENTRY_IN)
      {
         entryPrice = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
         break;
      }
   }
   
   // Calculate total P&L
   double totalPnL = profit + commission + swap;
   
   // Build JSON payload
   string json = "{";
   json += "\"trade_date\":\"" + TimeToString(dealTime, TIME_DATE|TIME_MINUTES) + "\",";
   json += "\"symbol\":\"" + symbol + "\",";
   json += "\"direction\":\"" + direction + "\",";
   json += "\"entry_price\":" + DoubleToString(entryPrice, 5) + ",";
   json += "\"exit_price\":" + DoubleToString(exitPrice, 5) + ",";
   json += "\"lot_size\":" + DoubleToString(volume, 2) + ",";
   json += "\"pnl\":" + DoubleToString(totalPnL, 2) + ",";
   json += "\"status\":\"CLOSED\",";
   json += "\"weekly_tf\":0,";
   json += "\"daily_tf\":0,";
   json += "\"h4_tf\":0,";
   json += "\"h1_tf\":0,";
   json += "\"lower_tf\":0,";
   json += "\"notes\":\"Auto-synced from MT5\"";
   json += "}";
   
   // Send to server using WebRequest
   string headers = "Content-Type: application/json\r\n";
   char post[];
   char result[];
   string resultHeaders;
   
   StringToCharArray(json, post, 0, StringLen(json));
   ArrayResize(post, ArraySize(post) - 1); // Remove null terminator
   
   int res = WebRequest(
      "POST",
      DashboardURL,
      headers,
      5000,  // timeout
      post,
      result,
      resultHeaders
   );
   
   if(res == 200 || res == 201)
   {
      Print("Trade synced successfully: ", symbol, " ", direction, " P&L: ", totalPnL);
      return true;
   }
   else
   {
      Print("Error syncing trade. HTTP Code: ", res);
      Print("Make sure dashboard is running and URL is correct");
      Print("Enable WebRequest for: ", DashboardURL);
      return false;
   }
}
//+------------------------------------------------------------------+
