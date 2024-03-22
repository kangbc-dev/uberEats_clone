import { Field } from '@nestjs/graphql';

export class SendMailInput {
  @Field((type) => String)
  text: string;
}
