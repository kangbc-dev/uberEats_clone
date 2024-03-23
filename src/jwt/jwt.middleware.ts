import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { JwtService } from './jwt.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // 토큰이 잘못되어서 decoded값이 망가져도 서버가 안멈추게 try/catch 보기싫어도 한번 씌워놓음
    if ('x-jwt' in req.headers) {
      console.log(req.headers['x-jwt']);
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());
        // console.log(decoded);
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          try {
            const user = await this.userService.findById(decoded['id']);
            req['user'] = user;
          } catch (e) {
            console.log('error!');
            console.log(e.statusText);
          }
        }
      } catch (e) {
        console.log(e.statusText);
      }
    }
    next();
  }
}
