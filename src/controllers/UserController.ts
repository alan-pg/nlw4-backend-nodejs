import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UserRepository } from "../repositories/UsersRepository";

class UserContoller {
  async create(req: Request, res: Response) {
    const { name, email } = req.body;

    const userRepository = getCustomRepository(UserRepository);

    const userAlreadyExists = await userRepository.findOne({ email });

    if (userAlreadyExists) {
      return res.status(400).json({ error: "User already exists!" });
    }

    const user = userRepository.create({
      name,
      email,
    });

    await userRepository.save(user);

    return res.status(201).json(user);
  }
}

export { UserContoller };

