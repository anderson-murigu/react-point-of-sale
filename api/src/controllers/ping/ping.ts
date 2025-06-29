import { Get, Controller } from 'routing-controllers';

@Controller()
export class PingController {
  @Get('/')
  public async ping() {
    return 'Welcome to react-point-of-sale api';
  }
}