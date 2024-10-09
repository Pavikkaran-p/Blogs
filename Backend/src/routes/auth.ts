import { signUpInput } from "@pavikkaran/blogapp";
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const { success } = signUpInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
      message: "Inputs not correct",
    });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return c.json({ message: "User already exists" }, 400);
    }
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    });
    const jwtToken = await sign(
      { id: user.id, email: user.email },
      c.env.JWT_SECRET
    );
    console.log(jwtToken);
    const token = "Bearer " + jwtToken;

    setCookie(c, "token", token, {
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60,
    });
    return c.json({
      jwt: token,
    });
  } catch (error) {
    c.status(403);
    return c.text("Something went wrong");
  }
});

userRouter.post("/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { success } = signUpInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({
        message: "Inputs not correct",
      });
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password,
      },
    });
    if (!user) return c.json("User not found");

    const jwtToken = await sign(
      { id: user.id, email: user.email },
      c.env.JWT_SECRET
    );
    console.log(jwtToken);
    const token = "Bearer " + jwtToken;
    // c.cookie('cookieName', 'cookieValue', { maxAge: 90000});
    setCookie(c, "token", token, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      secure: false,
      sameSite: "None",
    });
    return c.json({
      jwt: token,
    });
  } catch (error) {
    console.log(error);
    c.status(403);
    return c.text("Something went wrong");
  }
});
