"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  type TooltipProps 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphDataMode } from "@/constants/types";
import getGraphData from "@/server-actions/dashboard/graph";
import type { PerformanceData, DateRange } from "./types";

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">
          Value: KSH {payload[0].value?.toLocaleString("en-KE", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }
  return null;
};

const formatDate = (date: Date, range: DateRange) => {
  if (range === "1w") {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric"
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};

const calculateDomain = (data: PerformanceData[]) => {
  if (!data.length) return [0, 0] as [number, number];
  
  const values = data.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Add 10% padding to the domain
  const padding = (max - min) * 0.1;
  return [Math.max(0, min - padding), max + padding] as [number, number];
};

export const PortfolioPerformance = ({ userAddress }: { userAddress: string }) => {
  const [dateRange, setDateRange] = useState<DateRange>("1w");
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPerformanceData = useCallback(async () => {
    if (!userAddress) return;
    
    setLoading(true);
    try {
      const fromDate = new Date();
      if (dateRange === "1w") fromDate.setDate(fromDate.getDate() - 7);
      if (dateRange === "1m") fromDate.setMonth(fromDate.getMonth() - 1);

      const mode = dateRange === "1w" ? GraphDataMode.WEEKLY : GraphDataMode.MONTHLY;
      const performance = await getGraphData({
        user_address: userAddress,
        from: fromDate,
        to: new Date(),
        mode,
      });

      setPerformanceData(
        performance.map(item => ({
          ...item,
          name: formatDate(item.date, dateRange),
        }))
      );
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  }, [userAddress, dateRange]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const domain = calculateDomain(performanceData);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Your portfolio value over time (KSH)</CardDescription>
          </div>
          <Tabs 
            defaultValue="1w" 
            className="w-auto" 
            onValueChange={(value) => setDateRange(value as DateRange)}
          >
            <TabsList>
              <TabsTrigger value="1w">1W</TabsTrigger>
              <TabsTrigger value="1m">1M</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performanceData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  domain={domain}
                  tickFormatter={(value) => `${value.toLocaleString("en-KE")} KSH`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="bump"
                  dataKey="value"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};