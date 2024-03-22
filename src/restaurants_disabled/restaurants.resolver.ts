import {
  Args,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Restaurant } from './entities/restuarant.entity';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { RestaurantService } from './restaurants.service';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

const dummyRestaurants: Restaurant[] = [
  {
    id: 1,
    name: "Byung's Dabang",
    isVegan: true,
    adress: '대전',
    ownerName: '강 병찬',
  },
  {
    id: 2,
    name: "Byung's Chicken",
    isVegan: false,
    adress: '대전',
    ownerName: '강 병찬',
  },
  {
    id: 3,
    name: "Byung's Beer Time",
    isVegan: false,
    adress: '대전',
    ownerName: '강 병찬',
  },
];

@Resolver((of) => Restaurant)
export class RestaurantsResover {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query((returns) => Restaurant)
  restaurant(@Args('id') id: Number): Restaurant {
    return dummyRestaurants.find((restaurant) => restaurant.id === id);
  }
  @Query((returns) => [Restaurant])
  allRestaurantsForVegan(@Args('isVegan') isVegan: Boolean): Restaurant[] {
    return dummyRestaurants.filter(
      (restaurant) => restaurant.isVegan === isVegan,
    );
  }
  @Query((returns) => [Restaurant])
  allRestaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation((returns) => Boolean)
  async createRestaurant(
    @Args('input') createRestaurantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  @Mutation((returns) => Boolean)
  async updateRestaurant(
    @Args() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurant(updateRestaurantDto);
      console.log('셍공');
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
