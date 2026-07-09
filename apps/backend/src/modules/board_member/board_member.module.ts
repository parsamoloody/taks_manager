import { Module } from '@nestjs/common';
import { BoardMemberController } from './board_member.controller';
import { BoardMemberService } from './board_member.service';

@Module({
  controllers: [BoardMemberController],
  providers: [BoardMemberService]
})
export class BoardMemberModule {}
