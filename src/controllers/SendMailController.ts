import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { resolve } from "path";

import { UserRepository } from "../repositories/UsersRepository";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import SendMailService from "../services/SendMailService";
import { AppError } from "../errors/AppError";

class SendMailController {
  async execute(req: Request, res: Response) {
    const { email, survey_id } = req.body;

    const usersRepository = getCustomRepository(UserRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUserRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({ email });

    if (!user) {
      throw new AppError("Users does not exist");
    }

    const survey = await surveysRepository.findOne({
      id: survey_id,
    });

    if (!survey) {
      throw new AppError("Survey does not exist");
    }

    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMails.hbs");

    const surveyUserAlreadyExists = await surveysUserRepository.findOne({
      where: { user_id: user.id, value: null },
      relations: ["user", "survey"],
    });

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: "",
      link: process.env.URL_MAIL,
    };

    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;
      await SendMailService.execute(email, survey.title, variables, npsPath);
      return res.json(surveyUserAlreadyExists);
    }

    //salvar as informações na tabela urveyUser
    const surveyUser = surveysUserRepository.create({
      user_id: user.id,
      survey_id,
    });

    await surveysUserRepository.save(surveyUser);
    //Enivar e-mail para usuario
    variables.id = surveyUser.id;

    await SendMailService.execute(email, survey.title, variables, npsPath);
    return res.json(surveyUser);
  }
}

export { SendMailController };
