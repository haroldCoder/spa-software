'use client';

import * as React from 'react';
import { Button } from './button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface DatePickerProps {
  value?: Date | string | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  includeTime?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAY_NAMES_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export function DatePicker({
  value,
  onChange,
  minDate,
  includeTime = false,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Normalize current selected date
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const d = typeof value === 'string' ? new Date(value) : value;
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  // Current view state for the calendar month and year
  const [viewDate, setViewDate] = React.useState<Date>(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  // Time state (HH:mm)
  const [timeString, setTimeString] = React.useState<string>(() => {
    if (selectedDate) {
      const h = String(selectedDate.getHours()).padStart(2, '0');
      const m = String(selectedDate.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }
    return '10:00';
  });

  // Keep viewDate & timeString in sync when value changes externally
  React.useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate));
      const h = String(selectedDate.getHours()).padStart(2, '0');
      const m = String(selectedDate.getMinutes()).padStart(2, '0');
      setTimeString(`${h}:${m}`);
    }
  }, [selectedDate]);

  // Handle click outside to close popover safely
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Generate days matrix for current view month
  const calendarDays = React.useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i);
      const isPast = minDate ? d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false;
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: isPast,
      });
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const isToday =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
      const isSelected =
        selectedDate !== null &&
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate();
      const isPast = minDate ? d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false;

      days.push({
        date: d,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled: isPast,
      });
    }

    // Days from next month to fill grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(viewYear, viewMonth + 1, day);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDate, minDate]);

  const handleSelectDay = (day: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    const newDate = new Date(day);
    if (includeTime && timeString) {
      const [h, m] = timeString.split(':').map(Number);
      newDate.setHours(h || 10, m || 0, 0, 0);
    } else if (selectedDate) {
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    } else {
      newDate.setHours(10, 0, 0, 0);
    }
    onChange(newDate);

    // If time is not included, clicking the day selects it and closes the popover
    if (!includeTime) {
      setIsOpen(false);
    }
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = e.target.value;
    setTimeString(newTime);

    if (newTime) {
      const [h, m] = newTime.split(':').map(Number);
      const baseDate = selectedDate ? new Date(selectedDate) : new Date();
      baseDate.setHours(h || 0, m || 0, 0, 0);
      onChange(baseDate);
    }
  };

  // Format label for button trigger
  const formattedDisplay = React.useMemo(() => {
    if (!selectedDate) return placeholder;

    const dateStr = new Intl.DateTimeFormat('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(selectedDate);

    if (!includeTime) return dateStr;

    const timeStr = new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(selectedDate);

    return `${dateStr} • ${timeStr}`;
  }, [selectedDate, includeTime, placeholder]);

  return (
    <div className={cn('relative inline-block w-full text-left', className)} ref={containerRef}>
      {/* Trigger Button styled according to Shadcn UI Popover Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center justify-between gap-2.5 h-10 px-3.5 rounded-xl border border-input bg-background text-sm font-normal text-foreground transition-all duration-200',
          'hover:border-spa-rose/40 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-spa-rose/30 shadow-xs cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'border-spa-rose ring-2 ring-spa-rose/25',
          !selectedDate && 'text-muted-foreground'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="h-4 w-4 text-spa-rose shrink-0" />
          <span className="truncate capitalize">{formattedDisplay}</span>
        </div>
        {includeTime && <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-70" />}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'absolute left-0 mt-2 z-50 w-full sm:w-[310px] rounded-2xl border border-border/80 bg-popover p-4 shadow-2xl backdrop-blur-md',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {/* Calendar Header with Month & Year navigation */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/60">
            <span className="text-sm font-serif font-bold text-foreground capitalize">
              {MONTH_NAMES_ES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="h-7 w-7 p-0 rounded-lg hover:bg-spa-rose/10 hover:text-spa-rose"
                title="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="h-7 w-7 p-0 rounded-lg hover:bg-spa-rose/10 hover:text-spa-rose"
                title="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES_ES.map((day) => (
              <span
                key={day}
                className="text-[11px] font-semibold text-muted-foreground py-1 select-none"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              const dayNum = item.date.getDate();
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={item.isDisabled}
                  onClick={(e) => handleSelectDay(item.date, e)}
                  className={cn(
                    'h-8 w-8 mx-auto flex items-center justify-center text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer',
                    !item.isCurrentMonth && 'text-muted-foreground/30 hover:bg-transparent',
                    item.isCurrentMonth && !item.isSelected && 'text-foreground hover:bg-spa-rose/15 hover:text-spa-rose',
                    item.isToday && !item.isSelected && 'border border-spa-rose/50 font-bold text-spa-rose',
                    item.isSelected &&
                      'bg-gradient-to-tr from-spa-rose to-spa-blush text-white font-bold shadow-md shadow-spa-rose/30 scale-105',
                    item.isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-inherit'
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Inline Time input if includeTime is true */}
          {includeTime && (
            <div className="mt-3.5 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-spa-rose" />
                  <span>Hora de la Cita</span>
                </span>
                <input
                  type="time"
                  value={timeString}
                  onChange={handleTimeInputChange}
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 px-2 text-xs font-mono font-semibold rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-spa-rose cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="mt-3 pt-2">
            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="w-full h-8 text-xs bg-spa-rose text-white hover:bg-spa-rose/90 rounded-lg gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Confirmar</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
