import { ArgsType, Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restuarant.entity';

@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {} //omit이란 제외한다는 메소드 즉 id Field를 제외~
