import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookSchema } from './schemas/book.schema';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }]),
  ],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService]
})
export class BookModule {}
