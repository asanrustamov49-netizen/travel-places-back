import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../plugins/pg";

interface IRegisterBody {
  name: string;
  email: string;
  password: string;
}

interface ILoginBody {
  email: string;
  password: string;
}

export const registerService = async (body: IRegisterBody) => {
  const { name, email, password } = body;

  // Проверяем, существует ли пользователь
  const existingUser = await pool.query(
    `
      SELECT id
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User with this email already exists");
  }

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создаём пользователя
  const result = await pool.query(
    `
      INSERT INTO users (
        name,
        email,
        password
      )
      VALUES ($1, $2, $3)
      RETURNING id, name, email, avatar, created_at
    `,
    [name, email, hashedPassword],
  );

  return result.rows[0];
};
export const loginService = async (body: ILoginBody) => {
  const { email, password } = body;

  const result = await pool.query(
    `
      SELECT *
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};
export const profileService = async (userId: number) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        avatar,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
    `,
    [userId],
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};
