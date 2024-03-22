import { Module } from '@nestjs/common';
import { RestaurantsResover } from './restaurants.resolver';
import { Restaurant } from './entities/restuarant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  providers: [RestaurantsResover, RestaurantService],
})
export class RestaurantsModule {}
