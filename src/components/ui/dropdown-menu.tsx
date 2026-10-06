'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/src/lib/utils';

interface DropdownMenuContextValue {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('useDropdownMenu must be used within a DropdownMenu');
  }
  return context;
}

export interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = React.useCallback(
    (action: React.SetStateAction<boolean>) => {
      const nextOpen = typeof action === 'function' ? action(isOpen) : action;
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, isOpen, onOpenChange]
  );

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className, children, onClick, ...props }, forwardedRef) => {
  const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();

  const handleRef = (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <button
      ref={handleRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export function DropdownMenuContent({
  className,
  children,
  align = 'start',
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) {
  const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentWidth = contentRef.current ? contentRef.current.offsetWidth : 180;
    const contentHeight = contentRef.current ? contentRef.current.offsetHeight : 160;

    let top = triggerRect.bottom + sideOffset;
    // If overflowing viewport bottom, flip to above trigger
    if (top + contentHeight > window.innerHeight && triggerRect.top - contentHeight > 0) {
      top = triggerRect.top - contentHeight - sideOffset;
    }

    let left = triggerRect.left;
    if (align === 'end') {
      left = triggerRect.right - contentWidth;
    } else if (align === 'center') {
      left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
    }

    // Keep within horizontal window boundaries
    if (left + contentWidth > window.innerWidth - 8) {
      left = window.innerWidth - contentWidth - 8;
    }
    if (left < 8) {
      left = 8;
    }

    setCoords({ top, left });
  }, [align, sideOffset, triggerRef]);

  React.useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    function handleOutsideClick(event: MouseEvent) {
      if (
        triggerRef.current &&
        triggerRef.current.contains(event.target as Node)
      ) {
        return;
      }
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      updatePosition();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen, triggerRef, updatePosition]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      ref={contentRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      className={cn(
        'z-[9999] min-w-[8rem] overflow-hidden rounded-xl border border-border/80 bg-popover/95 p-1 text-popover-foreground shadow-2xl backdrop-blur-md',
        'animate-in fade-in-0 zoom-in-95 duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

export interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
}

export const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(({ className, children, onClick, ...props }, ref) => {
  const { setIsOpen } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      setIsOpen(false);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none transition-colors',
        'hover:bg-muted/80 focus:bg-muted/80 active:bg-muted text-foreground',
        'disabled:pointer-events-none disabled:opacity-50 text-left',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

export interface DropdownMenuLabelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export function DropdownMenuLabel({
  className,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <div
      className={cn(
        'px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export interface DropdownMenuSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <div
      className={cn('-mx-1 my-1 h-px bg-border/60', className)}
      {...props}
    />
  );
}
