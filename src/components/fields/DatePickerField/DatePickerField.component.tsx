import { Control, Controller, UseControllerProps } from 'react-hook-form';
import React, { useState, useRef, useMemo } from 'react';
import { Dayjs } from 'dayjs';

import { DatePicker, Input } from '@/components';

import { InputProps } from '@/components/common/Input/Input.component';
import { useOnClickOutSide, useToggleState } from '@/hooks';
import { formatDate } from '@/utils';

type DatePickerFieldProps = {
  control?: Control<any>;
} & InputProps &
  Omit<UseControllerProps, 'control'>;

const DatePickerField = ({
  name,
  className,
  control,
  onClick,
  ...restProps
}: DatePickerFieldProps) => {
  const [isDatePickerOpened, toggleDatePickerOpened] = useToggleState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const containerRef = useRef(null);

  const formattedDate = useMemo(() => {
    if (!selectedDate) {
      return '';
    }

    return formatDate(selectedDate.toDate(), 'YYYY.MM.DD');
  }, [selectedDate]);

  const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    onClick?.(event);

    if (!isDatePickerOpened) {
      toggleDatePickerOpened();
    }
  };

  const handleSelectDate = (clickedDate: Dayjs) => {
    setSelectedDate(clickedDate);
    toggleDatePickerOpened();
  };

  useOnClickOutSide(containerRef, () => {
    if (isDatePickerOpened) toggleDatePickerOpened();
  });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div ref={containerRef}>
          <Input {...restProps} value={formattedDate} onClick={handleClick} />
          {isDatePickerOpened && (
            <DatePicker
              className={className}
              selectedDate={selectedDate}
              handleSelectDate={(date) => {
                field.onChange(date);
                handleSelectDate(date);
              }}
            />
          )}
        </div>
      )}
    />
  );
};

export default DatePickerField;