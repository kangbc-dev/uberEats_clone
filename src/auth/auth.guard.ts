import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
//이 클래스는 false를 리턴하면, request를 중단함
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext(); //gql context 얻는 방법(http context => gqlContext)
    const user = gqlContext['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}
