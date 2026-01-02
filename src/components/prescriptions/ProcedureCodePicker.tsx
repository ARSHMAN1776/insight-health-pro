import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinicalCodes, ProcedureCode } from '@/hooks/useClinicalCodes';

interface ProcedureCodePickerProps {
  value?: string[];
  onChange: (codes: { code: string; description: string; price?: number }[]) => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

const ProcedureCodePicker: React.FC<ProcedureCodePickerProps> = ({
  value = [],
  onChange,
  placeholder = "Select CPT procedure codes...",
  className,
  multiple = true
}) => {
  const { procedureCodes, loading, fetchProcedureCodes, getCategoryOptions } = useClinicalCodes();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<ProcedureCode[]>([]);

  useEffect(() => {
    fetchProcedureCodes();
  }, [fetchProcedureCodes]);

  useEffect(() => {
    if (search.length >= 2) {
      fetchProcedureCodes(search);
    } else if (search.length === 0) {
      fetchProcedureCodes();
    }
  }, [search, fetchProcedureCodes]);

  useEffect(() => {
    if (value && value.length > 0 && procedureCodes.length > 0) {
      const found = procedureCodes.filter(c => value.includes(c.code));
      setSelectedCodes(found);
    }
  }, [value, procedureCodes]);

  const handleSelect = (code: ProcedureCode) => {
    let newSelected: ProcedureCode[];
    
    if (multiple) {
      const isSelected = selectedCodes.some(c => c.id === code.id);
      if (isSelected) {
        newSelected = selectedCodes.filter(c => c.id !== code.id);
      } else {
        newSelected = [...selectedCodes, code];
      }
    } else {
      newSelected = [code];
      setOpen(false);
    }
    
    setSelectedCodes(newSelected);
    onChange(newSelected.map(c => ({
      code: c.code,
      description: c.description,
      price: c.base_price || undefined
    })));
  };

  const handleRemove = (codeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = selectedCodes.filter(c => c.id !== codeId);
    setSelectedCodes(newSelected);
    onChange(newSelected.map(c => ({
      code: c.code,
      description: c.description,
      price: c.base_price || undefined
    })));
  };

  const categories = getCategoryOptions(procedureCodes);
  const totalPrice = selectedCodes.reduce((sum, c) => sum + (c.base_price || 0), 0);

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[40px] h-auto"
          >
            {selectedCodes.length > 0 ? (
              <div className="flex flex-wrap gap-1 flex-1">
                {selectedCodes.slice(0, 3).map(code => (
                  <Badge key={code.id} variant="secondary" className="shrink-0">
                    {code.code}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={(e) => handleRemove(code.id, e)}
                    />
                  </Badge>
                ))}
                {selectedCodes.length > 3 && (
                  <Badge variant="outline">+{selectedCodes.length - 3} more</Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                placeholder="Search CPT codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <CommandList className="max-h-[300px]">
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading codes...
                </div>
              ) : procedureCodes.length === 0 ? (
                <CommandEmpty>No procedure codes found.</CommandEmpty>
              ) : (
                categories.map(category => {
                  const categoryItems = procedureCodes.filter(c => c.category === category);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <CommandGroup key={category} heading={category || 'Other'}>
                      {categoryItems.map((code) => {
                        const isSelected = selectedCodes.some(c => c.id === code.id);
                        return (
                          <CommandItem
                            key={code.id}
                            value={`${code.code} ${code.description}`}
                            onSelect={() => handleSelect(code)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="shrink-0 font-mono">
                                  {code.code}
                                </Badge>
                                {code.base_price && (
                                  <span className="text-xs text-muted-foreground">
                                    ${code.base_price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm truncate">{code.description}</span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  );
                })
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCodes.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selectedCodes.length} procedure{selectedCodes.length > 1 ? 's' : ''} selected
          </span>
          <span className="font-medium">
            Total: ${totalPrice.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProcedureCodePicker;
