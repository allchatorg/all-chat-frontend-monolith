import {Card} from "@ads/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@ads/components/ui/chart";
import {Bar, BarChart, XAxis, YAxis} from "recharts";
import * as React from "react";
import {clsx} from "clsx";

interface VerticalBarCardProps {
    title: string;
    current: number;
    max: number;
    fillColor?: string;
    backgroundColor?: string;
    className?: string;
}

export function VerticalBarCard({
                                    title,
                                    current,
                                    max,
                                    fillColor = "#3b82f6",
                                    backgroundColor = "hsl(var(--muted-foreground) / 0.2)",
                                    className
                                }: VerticalBarCardProps) {
    const percentage = Math.round((current / max) * 100);

    const data = [
        {
            name: title,
            value: current,
            remaining: max - current,
        },
    ];

    const chartConfig = {
        value: {
            label: "Served",
            color: fillColor,
        },
        remaining: {
            label: "Remaining",
            color: backgroundColor,
        },
    } satisfies ChartConfig;

    return (
        <Card
            className={clsx("flex flex-col justify-center border-none shadow-none bg-muted/80 p-4 min-w-[140px]", className)}>
            <div className="text-sm font-medium text-muted-foreground mb-2 text-center">{title}</div>
            <ChartContainer config={chartConfig} className="h-[120px] w-full">
                <BarChart
                    data={data}
                    margin={{top: 0, right: 0, bottom: 0, left: 0}}
                >
                    <XAxis dataKey="name" hide/>
                    <YAxis domain={[0, max]} hide/>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel/>}
                    />
                    <Bar
                        dataKey="value"
                        fill={fillColor}
                        radius={[0, 0, 0, 0]}
                        maxBarSize={60}
                        stackId="a"
                    />
                    <Bar
                        dataKey="remaining"
                        fill={backgroundColor}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                        stackId="a"
                    />
                </BarChart>
            </ChartContainer>
            <div className="text-xs text-muted-foreground text-center mt-2">
                {current} / {max} ({percentage}%)
            </div>
        </Card>
    );
}