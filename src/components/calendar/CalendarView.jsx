import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Gift, Sparkles } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const specialDates = {
  '12-25': { label: '🎄 Natal', color: 'bg-red-500' },
  '12-31': { label: '🎆 Ano Novo', color: 'bg-yellow-500' },
  '12-24': { label: '🌟 Véspera de Natal', color: 'bg-red-400' }
};

export default function CalendarView({ goals, onDayClick, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const getGoalsForDay = (date) => {
    return goals.filter(goal => {
      if (!goal.due_date) return false;
      return isSameDay(new Date(goal.due_date), date);
    });
  };

  const getSpecialDate = (date) => {
    const key = format(date, 'MM-dd');
    return specialDates[key];
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-red-100 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-xl text-red-700 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {days.map(day => {
            const dayGoals = getGoalsForDay(day);
            const specialDate = getSpecialDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day.toString()}
                onClick={() => onDayClick(day)}
                className={`
                  aspect-square p-1 rounded-lg transition-all relative group
                  ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : 'text-gray-700'}
                  ${isSelected ? 'bg-red-500 text-white shadow-lg scale-105' : 'hover:bg-red-50'}
                  ${isCurrentDay && !isSelected ? 'ring-2 ring-red-400 ring-offset-1' : ''}
                `}
              >
                <div className="text-sm font-medium">{format(day, 'd')}</div>
                
                {specialDate && (
                  <div className={`absolute -top-1 -right-1 w-3 h-3 ${specialDate.color} rounded-full animate-pulse`} />
                )}

                {dayGoals.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayGoals.slice(0, 3).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`} />
                    ))}
                  </div>
                )}

                {specialDate && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    <Badge className="text-xs bg-gray-800 text-white">{specialDate.label}</Badge>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Metas</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Data especial</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}