export interface AddBoardMemberDto {
    email: string;
}

export interface RemoveBoardMemberDto extends AddBoardMemberDto { }
export interface UpdateBoardMemberDto extends AddBoardMemberDto { }