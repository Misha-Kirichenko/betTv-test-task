import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class LoginDTO {

  @ApiProperty({example: "admin@1bettv.com"})
  @IsNotEmpty()
  @IsDefined()
  login: string;

  @ApiProperty({example: "betTvPassword"})
  @IsNotEmpty()
  @IsDefined()
  password: string;
}
