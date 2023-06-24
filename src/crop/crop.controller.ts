import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('crop')
export class CropController {
  @UseGuards(AuthGuard)
  @Post()
  crop() {
    return 'crop crop';
  }
}
