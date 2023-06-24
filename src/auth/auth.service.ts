import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDTO): Promise<{ token: string }> {
    const { login, password } = loginDto;
    const foundUser = await this.userModel.findOne({ email: login });

    if (!foundUser) throw new UnauthorizedException('invalid credentials');

    const passwordsMatch = await bcrypt.compare(password, foundUser.password);

    if (passwordsMatch) {
      await this.userModel.updateOne(
        { _id: foundUser._id },
        { lastLogin: Date.now() },
      );

      const token = this.jwtService.sign({ id: foundUser._id, login });
      return {
        token,
      };
    }

    throw new UnauthorizedException('invalid credentials');
  }
}
