import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './login.dto';
import {
  ApiBadRequestResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 200,
    description: 'Successful autentification',
    schema: {
      type: 'object',
      example: {
        token:
          'Nz4nejkIztnqLJ59JKjzWetwpZWMr5h9mtfDS=!iQOdWrYyraV-qLJ8y47dt0Ij4KGdnOPn7QWECaj7QMaDTAel8Mvkn/=u/fTt',
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        statusCode: 400,
        message: ['property other_field should not exist'],
        error: 'Unauthorized',
      },
    },
    description: 'Non-whitelisted property passed',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        statusCode: 401,
        message: 'invalid credentials',
        error: 'Unauthorized',
      },
    },
    description: 'Invalid credentials',
  })
  @ApiTags('Authentification')
  @Post('login')
  login(@Body() loginDto: LoginDTO): Promise<{ token: string }> {
    return this.authService.login(loginDto);
  }
}
