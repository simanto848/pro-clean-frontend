"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
}

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const minutes = ["00", "15", "30", "45"]
const periods = ["AM", "PM"]

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [h, m, p] = value ? [value.substring(0, 2), value.substring(3, 5), value.substring(6, 8)] : ["09", "00", "AM"]
  const updateTime = (newH: string, newM: string, newP: string) => {
    onChange(`${newH}:${newM} ${newP}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/20 bg-primary/5">
        <Clock className="h-5 w-5 text-primary animate-pulse" />
        <span className="text-sm font-medium text-primary">
          {value ? `Selected Time: ${value}` : "Please select a time"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Hour</label>
          <Select value={h} onValueChange={(val) => val && updateTime(val, m, p)}>
            <SelectTrigger className="w-full h-12 rounded-xl border-2 hover:border-primary/50 transition-all bg-card shadow-sm">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour}>{hour}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Min</label>
          <Select value={m} onValueChange={(val) => val && updateTime(h, val, p)}>
            <SelectTrigger className="w-full h-12 rounded-xl border-2 hover:border-primary/50 transition-all bg-card shadow-sm">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((min) => (
                <SelectItem key={min} value={min}>{min}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">AM/PM</label>
          <Select value={p} onValueChange={(val) => val && updateTime(h, m, val)}>
            <SelectTrigger className="w-full h-12 rounded-xl border-2 hover:border-primary/50 transition-all bg-card shadow-sm">
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>{period}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
