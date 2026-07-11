export interface CreateListDto {
    title: string;
    order: number;
}

export interface UpdateListDto extends CreateListDto { }