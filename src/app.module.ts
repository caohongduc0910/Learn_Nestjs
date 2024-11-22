import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BookModule } from './book/book.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { RoleModule } from './role/role.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      }),
    }),
    BookModule,
    UserModule,
    AuthModule,
    MailerModule,
    RoleModule,
  ],
})
export class AppModule {}
