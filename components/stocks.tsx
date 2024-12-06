import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Generate random price changes with more realistic movements
const generateNewPrice = (basePrice) => {
  const maxChange = basePrice * 0.002; // Max 0.2% change per update
  const change = (Math.random() - 0.5) * maxChange;
  return Number((basePrice + change).toFixed(2));
};

// Generate historical data points with realistic trends
const generateHistoricalData = (baseValue, numPoints = 24) => {
  let currentValue = baseValue;
  const volatility = 0.05; // 0.5% volatility
  const trend = 0.01; // Slight upward trend

  return new Array(numPoints).fill(0).map((_, index) => {
    const timestamp = new Date(
      Date.now() - (numPoints - index) * 30 * 60 * 1000
    ); // 30-minute intervals
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    currentValue = currentValue * (1 + randomChange + trend);
    return {
      timestamp: timestamp.toISOString(),
      value: Number(currentValue),
    };
  });
};

const StockCard = ({ symbol, name, price, change }) => (
  <div className="bg-white dark:bg-[#1C1C1E] rounded-xl p-4 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-lg dark:text-white">{symbol}</h3>
        <p className="text-gray-500 dark:text-[#98989F] text-sm">{name}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-lg dark:text-white">${price}</p>
        <p className={change > 0 ? "text-[#30D158]" : "text-[#FF453A]"}>
          {change > 0 ? "+" : ""}
          {change}%
        </p>
      </div>
    </div>
  </div>
);

const HomePage = ({
  updateWidget,
}: {
  updateWidget: (arg0: {
    currentValue: number;
    dailyChange: number;
    dailyChangePercent: number;
    historyData: { timestamp: string; value: number }[];
  }) => void;
}) => {
  const basePortfolioValue = 84521.63;
  const [portfolioValue, setPortfolioValue] = useState(basePortfolioValue);
  const [portfolioChange, setPortfolioChange] = useState(1242.35);
  const [historyData, setHistoryData] = useState(() =>
    generateHistoricalData(basePortfolioValue)
  );
  const [stocks, setStocks] = useState([
    { symbol: "AAPL", name: "Apple Inc.", price: 178.32, change: 2.45 },
    { symbol: "TSLA", name: "Tesla, Inc.", price: 238.45, change: -1.23 },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 338.11,
      change: 0.89,
    },
  ]);

  // Convert history data to chart format
  const chartData = historyData.map((item) => ({
    date: new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: item.value,
  }));

  useEffect(() => {
    // Update widget with latest data
    const openingValue = historyData[0].value;
    const currentValue = portfolioValue;
    const dailyChange = currentValue - openingValue;
    const dailyChangePercent = (dailyChange / openingValue) * 100;

    updateWidget({
      currentValue,
      dailyChange,
      dailyChangePercent,
      historyData,
    });
  }, [historyData, portfolioValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update portfolio value with realistic movements
      const newPortfolioValue = generateNewPrice(portfolioValue);
      setPortfolioValue(newPortfolioValue);

      // Update historical data
      setHistoryData((prevHistory) => {
        const newDataPoint = {
          timestamp: new Date().toISOString(),
          value: newPortfolioValue,
        };
        return [...prevHistory.slice(1), newDataPoint];
      });

      // Update stock prices with correlated movements
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const newPrice = generateNewPrice(parseFloat(stock.price));
          const priceChange = ((newPrice - stock.price) / stock.price) * 100;
          return {
            ...stock,
            price: newPrice,
            change: Number((stock.change + priceChange).toFixed(2)),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [portfolioValue, stocks]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black container">
      {/* Header */}
      <div className="bg-white dark:bg-[#1C1C1E]">
        <div className="px-4 pt-2 pb-4">
          {/* Portfolio Value */}
          <div className="mb-6">
            <p className="text-gray-500 dark:text-[#98989F] text-sm mb-1">
              Total Balance
            </p>
            <h2 className="text-4xl font-bold dark:text-white">
              ${portfolioValue.toFixed(2)}
            </h2>
            <p
              className={
                portfolioChange >= 0 ? "text-[#30D158]" : "text-[#FF453A]"
              }
            >
              {portfolioChange >= 0 ? "+" : ""}
              {portfolioChange.toFixed(2)} (
              {((portfolioChange / portfolioValue) * 100).toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#1C1C1E] px-4 py-6 mb-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#98989F" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#98989F" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2C2C2E",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "white",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#30D158"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-3 mt-4">
          {["1D", "1W", "1M", "3M", "1Y", "All"].map((range) => (
            <button
              key={range}
              className={`px-4 py-1 rounded-full text-sm ${
                range === "1M"
                  ? "bg-[#0A84FF] text-white"
                  : "bg-[#2C2C2E] dark:text-[#98989F]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Watchlist
        </h3>
        <div className="space-y-3">
          {stocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
              price={stock.price}
              change={stock.change}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;