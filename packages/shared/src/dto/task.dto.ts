import { TaskPriority, TaskStatus } from "../enums";

export interface CreateTaskDto {
    title: string;
    description?: string;
    order: number;
    priority?: TaskPriority;
    startDate?: Date;
    dueDate?: Date;
    lables?: CreateTaskDto[];
    assignee?: string[]
}
export interface UpdateTaskDto extends CreateTaskDto {
    status?: TaskStatus;
}