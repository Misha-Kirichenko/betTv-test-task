import { IsDefined, IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  @IsDefined()
  login: string;

  @IsNotEmpty()
  @IsDefined()
  password: string;
}
