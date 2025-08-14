import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { BookingSchedule, Frequency } from '@/types/booking';

interface ScheduleFormProps {
  data: BookingSchedule;
  onChange: (data: Partial<BookingSchedule>) => void;
  errors?: Record<string, string>;
}

export class ScheduleForm extends React.Component<ScheduleFormProps> {
  private readonly timeOptions = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' }
  ];

  private readonly frequencyOptions = [
    { value: Frequency.ONE_TIME, label: 'One-time' },
    { value: Frequency.WEEKLY, label: 'Weekly (15% off)' },
    { value: Frequency.BIWEEKLY, label: 'Bi-weekly (10% off)' },
    { value: Frequency.MONTHLY, label: 'Monthly (5% off)' }
  ];

  private handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange({ date: new Date(e.target.value) });
  };

  private handleTimeChange = (value: string): void => {
    this.props.onChange({ time: value });
  };

  private handleFrequencyChange = (value: string): void => {
    this.props.onChange({ frequency: value as Frequency });
  };

  private formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  private getMinDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDateForInput(tomorrow);
  };

  public render(): React.ReactNode {
    const { data, errors = {} } = this.props;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">When to Come</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            required
            value={this.formatDateForInput(data.date)}
            onChange={this.handleDateChange}
            error={errors.date}
            min={this.getMinDate()}
          />

          <Select
            label="Time"
            required
            value={data.time}
            onChange={this.handleTimeChange}
            error={errors.time}
            options={this.timeOptions}
            placeholder="Select time"
          />
        </div>

        <Select
          label="Frequency"
          required
          value={data.frequency}
          onChange={this.handleFrequencyChange}
          error={errors.frequency}
          options={this.frequencyOptions}
        />

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Recurring Service Benefits:</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p>• Automatic discounts on every service</p>
            <p>• Priority scheduling with your preferred team</p>
            <p>• Consistent quality with the same cleaning professionals</p>
            <p>• Flexible - cancel or modify anytime</p>
          </div>
        </div>
      </div>
    );
  }
}
