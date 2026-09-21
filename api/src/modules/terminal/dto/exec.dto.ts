import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ExecDto {
  @ApiProperty({
    description: 'The raw command line to execute, exactly as typed.',
    example: 'sudo hire-me',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1, { message: 'A command is required.' })
  @MaxLength(200, { message: 'Command too long — 200 characters max.' })
  command!: string;
}
