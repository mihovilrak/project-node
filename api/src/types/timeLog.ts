export interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  log_date: Date;
  spent_time: number;
  description: string;
  activity_type_id: string;
  created_on: Date;
  updated_on: Date;
}

export interface TimeLogCreateInput {
  log_date: Date;
  spent_time: number;
  description: string;
  activity_type_id: string;
}

export interface TimeLogUpdateInput {
  log_date?: Date;
  spent_time?: number;
  description?: string;
  activity_type_id?: string;
}

export interface TimeLogQueryFilters {
  startDate?: Date;
  endDate?: Date;
  activity_type_id?: string;
  user_id?: string;
}

export interface SpentTime {
  total_spent_time: number;
}
