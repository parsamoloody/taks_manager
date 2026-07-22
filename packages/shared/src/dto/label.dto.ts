export interface LabelDto {
  id: string;
  boardId: string;
  name: string;
  color: string;
}

export interface CreateLabelDto {
  name: string;
  color: string;
}

export type UpdateLabelDto = Partial<CreateLabelDto>;

// Backwards-compatible aliases.
export type CreateLabel = CreateLabelDto;
export type UpdateLabel = UpdateLabelDto;
