import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  dob: Date;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  codeId: String;

  @Prop() 
  codeIdExpiresAt: Date;
  
  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
