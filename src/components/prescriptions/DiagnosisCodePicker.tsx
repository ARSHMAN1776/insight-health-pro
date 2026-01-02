import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinicalCodes, DiagnosisCode } from '@/hooks/useClinicalCodes';

interface DiagnosisCodePickerProps {
  value?: string;
  onChange: (code: string, description: string) => void;
  placeholder?: string;
  className?: string;
}

const DiagnosisCodePicker: React.FC<DiagnosisCodePickerProps> = ({
  value,
  onChange,
  placeholder = "Select ICD-10 diagnosis code...",
  className
}) => {
  const { diagnosisCodes, loading, fetchDiagnosisCodes, getCategoryOptions } = useClinicalCodes();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState<DiagnosisCode | null>(null);

  useEffect(() => {
    fetchDiagnosisCodes();
  }, [fetchDiagnosisCodes]);

  useEffect(() => {
    if (search.length >= 2) {
      fetchDiagnosisCodes(search);
    } else if (search.length === 0) {
      fetchDiagnosisCodes();
    }
  }, [search, fetchDiagnosisCodes]);

  useEffect(() => {
    if (value && diagnosisCodes.length > 0) {
      const found = diagnosisCodes.find(c => c.code === value);
      if (found) setSelectedCode(found);
    }
  }, [value, diagnosisCodes]);

  const handleSelect = (code: DiagnosisCode) => {
    setSelectedCode(code);
    onChange(code.code, code.description);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCode(null);
    onChange('', '');
  };

  const categories = getCategoryOptions(diagnosisCodes);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedCode ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Badge variant="secondary" className="shrink-0">
                {selectedCode.code}
              </Badge>
              <span className="truncate text-sm">{selectedCode.description}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <div className="flex items-center gap-1 ml-2">
            {selectedCode && (
              <X 
                className="h-4 w-4 opacity-50 hover:opacity-100" 
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search ICD-10 codes..."
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
            ) : diagnosisCodes.length === 0 ? (
              <CommandEmpty>No diagnosis codes found.</CommandEmpty>
            ) : (
              categories.map(category => {
                const categoryItems = diagnosisCodes.filter(c => c.category === category);
                if (categoryItems.length === 0) return null;
                
                return (
                  <CommandGroup key={category} heading={category || 'Other'}>
                    {categoryItems.map((code) => (
                      <CommandItem
                        key={code.id}
                        value={`${code.code} ${code.description}`}
                        onSelect={() => handleSelect(code)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCode?.id === code.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="shrink-0 font-mono">
                              {code.code}
                            </Badge>
                            {code.is_billable && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                Billable
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm truncate">{code.description}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DiagnosisCodePicker;
