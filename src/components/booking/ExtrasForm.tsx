import React from 'react';
import { ServiceExtras } from '@/types/booking';

interface ExtrasFormProps {
  data: ServiceExtras;
  onChange: (data: Partial<ServiceExtras>) => void;
}

interface CheckboxItemProps {
  id: string;
  label: string;
  price: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

class CheckboxItem extends React.Component<CheckboxItemProps> {
  private handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(e.target.checked);
  };

  public render(): React.ReactNode {
    const { id, label, price, checked } = this.props;

    return (
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={this.handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor={id} className="text-sm font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
        </div>
        <span className="text-sm font-semibold text-gray-900">{price}</span>
      </div>
    );
  }
}

interface CounterItemProps {
  id: string;
  label: string;
  price: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

class CounterItem extends React.Component<CounterItemProps> {
  private handleDecrement = (): void => {
    const { value, onChange, min = 0 } = this.props;
    if (value > min) {
      onChange(value - 1);
    }
  };

  private handleIncrement = (): void => {
    const { value, onChange, max = 10 } = this.props;
    if (value < max) {
      onChange(value + 1);
    }
  };

  public render(): React.ReactNode {
    const { id, label, price, value, min = 0, max = 10 } = this.props;

    return (
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div className="flex-1">
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          <div className="text-sm font-semibold text-gray-900">{price}</div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={this.handleDecrement}
            disabled={value <= min}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium">{value}</span>
          <button
            type="button"
            onClick={this.handleIncrement}
            disabled={value >= max}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>
    );
  }
}

export class ExtrasForm extends React.Component<ExtrasFormProps> {
  private handleCheckboxChange = (field: keyof ServiceExtras) => (checked: boolean): void => {
    this.props.onChange({ [field]: checked });
  };

  private handleCounterChange = (field: keyof ServiceExtras) => (value: number): void => {
    this.props.onChange({ [field]: value });
  };

  public render(): React.ReactNode {
    const { data } = this.props;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Extras</h3>
        
        <div className="space-y-3">
          <CheckboxItem
            id="insideFridge"
            label="Inside Fridge"
            price="+$25"
            checked={data.insideFridge}
            onChange={this.handleCheckboxChange('insideFridge')}
          />

          <CheckboxItem
            id="insideOven"
            label="Inside Oven"
            price="+$20"
            checked={data.insideOven}
            onChange={this.handleCheckboxChange('insideOven')}
          />

          <CheckboxItem
            id="cabinets"
            label="Inside Cabinets"
            price="+$30"
            checked={data.cabinets}
            onChange={this.handleCheckboxChange('cabinets')}
          />

          <CheckboxItem
            id="walls"
            label="Walls"
            price="+$40"
            checked={data.walls}
            onChange={this.handleCheckboxChange('walls')}
          />

          <CheckboxItem
            id="petHairRemoval"
            label="Pet Hair Removal"
            price="+$35"
            checked={data.petHairRemoval}
            onChange={this.handleCheckboxChange('petHairRemoval')}
          />

          <CounterItem
            id="windows"
            label="Windows (interior)"
            price="$5 each"
            value={data.windows}
            onChange={this.handleCounterChange('windows')}
            max={20}
          />

          <CounterItem
            id="laundry"
            label="Laundry Loads"
            price="$15 per load"
            value={data.laundry}
            onChange={this.handleCounterChange('laundry')}
            max={5}
          />
        </div>


      </div>
    );
  }
}
