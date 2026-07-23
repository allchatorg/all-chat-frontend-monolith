import * as React from 'react';
import {Card, CardContent} from "@ads/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@ads/components/ui/chart";
import {CartesianGrid, Line, LineChart, XAxis} from "recharts";
import {AdLinkStat} from "@ads/models/ad";
import {getVideoThumbnail} from "@/lib/utils/urlThumbnailExtractionUtils";

const linkClicksChartConfig = {
    clicksCount: {
        label: "Link Clicks",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function LinkStatsCard({link}: { link: AdLinkStat }) {
    const thumbnail = getVideoThumbnail(link.url);

    return (
        <Card className="border shadow-none">
            <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {thumbnail && (
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                            <div className="overflow-hidden border rounded-lg h-20 aspect-video relative">
                                <img
                                    src={thumbnail.url}
                                    alt="Link preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Hide preview if thumbnail fails to load
                                        e.currentTarget.parentElement?.parentElement?.remove();
                                    }}
                                />
                                <div
                                    className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/70 text-white uppercase">
                                    {thumbnail.platform}
                                </div>
                            </div>
                        </a>
                    )}
                    <div className="flex flex-col gap-1 min-w-0">
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium underline hover:opacity-80 break-all"
                        >
                            {link.url}
                        </a>
                        <p className="text-xs text-muted-foreground">
                            {link.totalClicks.toLocaleString()} total · {link.todaysClicks.toLocaleString()} today
                        </p>
                    </div>
                </div>
                {link.dailyStats.length > 0 ? (
                    <ChartContainer
                        config={linkClicksChartConfig}
                        className="aspect-auto h-[160px] w-full"
                    >
                        <LineChart
                            accessibilityLayer
                            data={link.dailyStats.slice().reverse()}
                            margin={{
                                top: 12,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted"/>
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[150px]"
                                        nameKey="clicksCount"
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })
                                        }}
                                    />
                                }
                            />
                            <Line
                                dataKey="clicksCount"
                                type="monotone"
                                stroke="var(--color-clicksCount)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div
                        className="flex h-[80px] items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
                        No clicks on this link yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
