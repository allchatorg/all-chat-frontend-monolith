"use client"

import * as React from "react"
import {format} from "date-fns"
import {Calendar as CalendarIcon, X} from "lucide-react"
import {DateRange} from "react-day-picker"

import {cn} from "@ads/lib/utils"
import {Button} from "@ads/components/ui/button"
import {Calendar} from "@ads/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger,} from "@ads/components/ui/popover"

interface DateRangePickerProps {
    value?: DateRange
    onChange: (range: DateRange | undefined) => void
    placeholder?: string
    className?: string
}

export function DateRangePicker({value, onChange, placeholder = "Pick a date range", className}: DateRangePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "h-9 w-full justify-start text-left font-normal sm:w-[260px]",
                        !value?.from && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4"/>
                    {value?.from ? (
                        value.to ? (
                            <>
                                {format(value.from, "MMM dd, yyyy")} &ndash; {format(value.to, "MMM dd, yyyy")}
                            </>
                        ) : (
                            format(value.from, "MMM dd, yyyy")
                        )
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    defaultMonth={value?.from}
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={2}
                    autoFocus
                />
                {value?.from && (
                    <div className="p-3 border-t">
                        <Button
                            variant="ghost"
                            className="w-full justify-center"
                            size="sm"
                            onClick={() => onChange(undefined)}
                        >
                            <X className="mr-2 h-4 w-4"/>
                            Clear
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
