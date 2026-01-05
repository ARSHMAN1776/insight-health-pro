import React from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface ValidatedInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'number';
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  autoComplete?: string;
}

export function ValidatedInput<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  type = 'text',
  multiline = false,
  rows = 3,
  maxLength,
  required = false,
  disabled = false,
  className,
  inputClassName,
  onBlur,
  onChange,
  autoComplete,
}: ValidatedInputProps<T>) {
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
          <FormControl>
            {multiline ? (
              <Textarea
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                disabled={disabled}
                className={cn(
                  fieldState.error && 'border-destructive focus-visible:ring-destructive',
                  inputClassName
                )}
                {...field}
                onBlur={(e) => {
                  field.onBlur();
                  onBlur?.();
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value);
                  onChange?.(value);
                }}
              />
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                autoComplete={autoComplete}
                className={cn(
                  fieldState.error && 'border-destructive focus-visible:ring-destructive',
                  inputClassName
                )}
                {...field}
                onBlur={(e) => {
                  field.onBlur();
                  onBlur?.();
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value);
                  onChange?.(value);
                }}
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default ValidatedInput;
