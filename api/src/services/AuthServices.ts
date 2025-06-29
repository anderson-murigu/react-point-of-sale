import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { UserLoginPost } from "../dtos/authTypes";

export class AuthServices {
  public async fetchUser(userPost: UserLoginPost): Promise<User> {
    const { AppDataSource } = await import("../persistence");
    const userRepository = AppDataSource.getRepository(User);
    const user: User = await userRepository.findOne({
      where: {
        id: userPost.userid,
        password: userPost.password
      }
    });
    return user;
  }
}