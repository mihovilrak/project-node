import { ChangeEvent } from 'react';

export type SimpleChangeEvent = {
  target: {
    name: string;
    value: any;
  };
};

// This is the type that components will use to define their props
export type FormChangeHandler = (e: SimpleChangeEvent) => void;

// This is the type for the actual implementation in TaskForm
export type FormChangeImplementation = (e: SimpleChangeEvent) => void;
