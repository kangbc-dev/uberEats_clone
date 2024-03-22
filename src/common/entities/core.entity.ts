import { Field, ObjectType } from '@nestjs/graphql';
import { PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
export class CoreEntity {
  @Field((returns) => String)
  @PrimaryGeneratedColumn()
  id: number;

  @Field((returns) => Date)
  @UpdateDateColumn()
  createdAt: Date;

  @Field((returns) => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
