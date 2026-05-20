'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { US_STATES, US_STATE_NAMES } from '@/lib/constants/us-states';
import { authSelectTriggerClass } from '@/lib/ui/auth-field-styles';
import { cn } from '@/lib/utils';

const STATE_NONE = '__none__';

type AuthStateSelectProps = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  showLabel?: boolean;
  optional?: boolean;
  placeholder?: string;
  className?: string;
};

export function AuthStateSelect({
  id,
  value,
  onValueChange,
  label = 'Your state',
  showLabel = false,
  optional = false,
  placeholder = 'Select your state…',
  className,
}: AuthStateSelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {showLabel ? (
        <Label htmlFor={id}>
          {label}
          {optional ? <span className='font-normal text-muted-foreground'> (optional)</span> : null}
        </Label>
      ) : null}
      <Select value={value || STATE_NONE} onValueChange={(next) => onValueChange(next === STATE_NONE ? '' : next)}>
        <SelectTrigger id={id} className={authSelectTriggerClass}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position='popper'>
          <SelectItem value={STATE_NONE}>{placeholder}</SelectItem>
          {US_STATES.map((abbr) => (
            <SelectItem key={abbr} value={abbr}>
              {US_STATE_NAMES[abbr]} ({abbr})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
