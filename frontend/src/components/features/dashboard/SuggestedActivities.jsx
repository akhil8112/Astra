import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

//mock data for the hackathon. The backend will provide this.
const mockProgressData = [
    { date: "Mon", completed: 4, skipped: 1 },
    { date: "Tue", completed: 3, skipped: 2 },
    { date: "Wed", completed: 5, skipped: 0 },
    { date: "Thu", completed: 2, skipped: 1 },
    { date: "Fri", completed: 6, skipped: 1 },
    { date: "Sat", completed: 7, skipped: 0 },
    { date: "Sun", completed: 5, skipped: 2 },
];

const ProgressChart = () => {
    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Activities completed vs. skipped in the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockProgressData}>
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
            </CardContent>
        </Card>
    );
};

export default ProgressChart;