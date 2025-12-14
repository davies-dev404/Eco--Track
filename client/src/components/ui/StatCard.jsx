import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export function StatCard({ title, value, subtext, icon: Icon, trend }) {
    // trend: { value: 12, direction: 'up' | 'down' | 'neutral' }
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {trend && (
                        <span className={`flex items-center mr-2 font-medium ${
                            trend.direction === 'up' ? 'text-green-600' : 
                            trend.direction === 'down' ? 'text-red-600' : 'text-slate-500'
                        }`}>
                            {trend.direction === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> :
                             trend.direction === 'down' ? <ArrowDownRight className="h-3 w-3 mr-1" /> :
                             <Minus className="h-3 w-3 mr-1" />}
                            {trend.value}%
                        </span>
                    )}
                    {subtext}
                </div>
            </CardContent>
        </Card>
    );
}
