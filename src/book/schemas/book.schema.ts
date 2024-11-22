import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import slugify from 'slugify';

export type BookDocument = HydratedDocument<Book>;

export enum Category {
  AVENTURE = 'Adventure',
  CRIME = 'Crime',
  FANTASY = 'Fantasy',
  SCIFI = 'Science fiction',
}

@Schema({
  timestamps: true,
})
export class Book {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  author: string;

  @Prop()
  price: number;

  @Prop()
  category: Category;

  @Prop({ unique: true })
  slug: String;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.pre('save', function (next) {
  const book = this as BookDocument;

  if (book.isModified('title')) {
    book.slug = slugify(book.title, { lower: true });
  }

  next();
});
