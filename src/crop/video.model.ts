import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

@Schema({ versionKey: false })
export class Video {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  origin: string;

  @Prop({ required: true, default: Date.now() })
  timestamp: number;

  @Prop({ required: true })
  type: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
