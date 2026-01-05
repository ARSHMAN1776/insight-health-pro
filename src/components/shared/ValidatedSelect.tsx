import React from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ValidatedSelectProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export function ValidatedSelect<T extends FieldValues>({
  form,
  name,
  label,
  options,
  placeholder = 'Select an option',
  description,
  required = false,
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  emptyText = 'No options available',
  className,
  onChange,
}: ValidatedSelectProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              onChange?.(value);
            }}
            value={field.value}
            disabled={disabled || loading}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  fieldState.error && 'border-destructive focus:ring-destructive'
                )}
              >
                <SelectValue placeholder={loading ? loadingText : placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-popover z-50">
              {options.length === 0 && !loading ? (
                <SelectItem value="" disabled>
                  {emptyText}
                </SelectItem>
              ) : (
                options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default ValidatedSelect;
