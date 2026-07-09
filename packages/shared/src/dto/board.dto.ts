import { BoardVisibility } from "../enums";

export interface CreateBoardDto {
    name: string;
    description?: string;
    visibility: BoardVisibility
} 

export type UpdateBoardDto = Partial<CreateBoardDto>;