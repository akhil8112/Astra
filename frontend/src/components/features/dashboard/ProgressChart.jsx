import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import apiClient from '@/lib/api';

const ProgressChart = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgressData = async () => {
            try {
                const response = await apiClient.get('/dashboard/progress');

                // ✅ FIX 1: Validate that the API response is an array.
                // If it's not, default to an empty array to prevent crashes.
                if (Array.isArray(response.data)) {
                    setChartData(response.data);
                } else {
                    console.warn("Progress chart API did not return an array, defaulting to empty.");
                    setChartData([]);
                }

            } catch (error) {
                console.error("Failed to fetch progress data:", error);
                setChartData([]); // Also default to empty on error
            } finally {
                setLoading(false);
            }
        };
        fetchProgressData();
    }, []);

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Activities completed vs. skipped in the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                {loading ? (
                    <div className="h-[300px] flex items-center justify-center">Loading chart data...</div>
                ) : (
                    // ✅ FIX 2: Add an "empty state" message for a better UX.
                    chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "var(--radius)",
                                    }}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="skipped" name="Skipped" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            No activity data to display yet.
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
};

export default ProgressChart;