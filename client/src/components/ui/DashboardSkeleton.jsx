import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 opacity-50">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px]" />
                            <Skeleton className="h-3 w-[80px] mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Chart Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[140px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>
                    
                    {/* Table Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[120px]" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-[30%]" />
                                        <Skeleton className="h-4 w-[20%]" />
                                        <Skeleton className="h-4 w-[10%]" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-1 space-y-6">
                    {/* Activity Feed Skeleton */}
                    <Card className="h-full">
                         <CardHeader>
                            <Skeleton className="h-6 w-[100px]" />
                         </CardHeader>
                         <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[150px]" />
                                            <Skeleton className="h-3 w-[100px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
