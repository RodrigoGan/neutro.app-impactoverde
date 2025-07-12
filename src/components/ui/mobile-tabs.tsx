import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MobileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabs({ tabs, activeTab, onTabChange, className }: MobileTabsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Efeito para centralizar a aba ativa
  useEffect(() => {
    if (tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (activeTabElement) {
        const containerWidth = tabsRef.current.offsetWidth;
        const tabLeft = (activeTabElement as HTMLElement).offsetLeft;
        const tabWidth = (activeTabElement as HTMLElement).offsetWidth;
        
        tabsRef.current.scrollTo({
          left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (tabsRef.current?.offsetLeft || 0));
    setScrollLeft(tabsRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (tabsRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (tabsRef.current) {
      tabsRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (tabsRef.current?.offsetLeft || 0));
    setScrollLeft(tabsRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (tabsRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (tabsRef.current) {
      tabsRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <div 
        ref={tabsRef}
        className={cn(
          "relative w-full overflow-x-auto scrollbar-hide",
          "flex space-x-1 px-2 py-3",
          "bg-background border-b",
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            data-tab-id={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              "min-w-[80px] h-[72px] px-3 py-2",
              "rounded-lg",
              "transition-all duration-200",
              activeTab === tab.id 
                ? "bg-neutro text-white shadow-md scale-105" 
                : "hover:bg-muted"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <div className={cn(
              "text-lg",
              activeTab === tab.id ? "text-white" : "text-muted-foreground"
            )}>
              {tab.icon}
            </div>
            <span className={cn(
              "text-xs font-medium",
              activeTab === tab.id ? "text-white" : "text-muted-foreground"
            )}>
              {tab.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
} 