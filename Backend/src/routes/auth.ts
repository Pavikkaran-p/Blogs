import { signUpInput } from "@pavikkaran/blogapp";
import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt';

export const userRouter=new Hono<{
	Bindings:{
		DATABASE_URL: string,
		JWT_SECRET:string
	}
}>();

userRouter.post('/signup',async (c) => {
	const body=await c.req.json()
	const {success} =signUpInput.safeParse(body)
	if(!success){
		c.status(411)
		return c.json({
			message:"Inputs not correct"
		})
	}
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate())
	try {
		const existingUser = await prisma.user.findUnique({
			where: { email: body.email },
		  });
		  
		  if (existingUser) {
			return c.json({ message: 'User already exists' }, 400)	
		  }
		console.log(body.email)
		const user=await prisma.user.create({
			data:{
				email:body.email,
				password:body.password,
			}
		})
		const jwt_token=await sign({id:user.id,email:user.email},c.env.JWT_SECRET)
		console.log(c.env.JWT_SECRET)
		console.log(jwt_token)
		const token="Bearer "+jwt_token
		return c.json({
			jwt:token
		})
	} catch (error) {
		// console.log(error)
		c.status(403)
		return c.text("Something went wrong") 
	}
})

userRouter.post('/signin',async (c) => {
	try {
		const body=await c.req.json()
		const {success} =signUpInput.safeParse(body)
		if(!success){
			c.status(411)
			return c.json({
				message:"Inputs not correct"
			})
		}
		const prisma = new PrismaClient({
			datasourceUrl: c.env?.DATABASE_URL,
		}).$extends(withAccelerate())
		const user=await prisma.user.findUnique({
			where:{
				email:body.email,
				password:body.password
			}
		})
		if(!user) return c.json("User not found")
		const jwt_token=await sign({id:user?.id,email:user?.email},c.env.JWT_SECRET)
		const token=jwt_token
		return c.json({
			jwt:token
		})			
	} catch (error) {
		console.log(error)
		c.status(403)
		return c.text("Something went wrong") 
	}
})