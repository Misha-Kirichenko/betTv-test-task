import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.model';


@Injectable()
export class UserSeederService implements OnApplicationBootstrap {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
  }

  private async seedUsers() {
    const usersToSeed = [
      {
        fullName: 'John Doe',
        email: 'admin@1bettv.com',
        password: await bcrypt.hash('betTvPassword', 10),
      },
      // Add more user objects if needed
    ];

    for (const user of usersToSeed) {
      const existingUser = await this.userModel.findOne({ email: user.email });
      if (!existingUser) {
        await this.userModel.create(user);
      }
    }
  }
}
