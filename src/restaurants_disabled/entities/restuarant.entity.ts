import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true }) //스키마에 Restaurant @InputType을 작성하지 않게 하는(확장만 가능한 {어디선가 복사해서 쓰는}) 데코레이션}
@ObjectType() // graphQL 문법
@Entity() //typeorm 문법 ()
export class Restaurant {
  @Field((type) => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field((type) => String)
  @IsString()
  @Column()
  @Length(2)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  adress: string;

  @Field((type) => String)
  @Column()
  @IsString()
  ownerName: string;

  @Field((type) => Boolean, {
    defaultValue: false,
  })
  @Column({ default: false })
  @IsOptional()
  @IsBoolean()
  isVegan: boolean;
}
