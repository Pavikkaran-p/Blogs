import { createBlogInput, updateBlogInput } from "@pavikkaran/blogapp";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { decode, verify } from "hono/jwt";

export const blogRouter=new Hono<{
    Bindings:{
        DATABASE_URL: string,
		JWT_SECRET:string
    },
    Variables:{
        userId:string;
    }
}>()

blogRouter.use("/*", async (c, next) => {
    const authToken = getCookie(c, "token");
    const cur = getCookie(c);
    // if(cur)
    // return c.json(cur)
    console.log(authToken)
    if (!authToken) {
      return c.text('Token not found', 401);
    }   
    const jwtToken = authToken.startsWith('Bearer ') ? authToken.split(' ')[1] : authToken;
    console.log(jwtToken)
    if(!jwtToken) return c.text("Unauthorized 01");
    try {
      const user = await verify(jwtToken, c.env.JWT_SECRET);
      if (user ) {
        c.set('userId', String(user.id));
        console.log("first")
        console.log(user.id)
        await next(); 
        console.log("second")
      } else {
        c.status(400);
        return c.text("Invalid auth header: user ID missing");
      }
    } catch (error) {
      console.log("JWT verification failed", error);
      c.status(401);
      return c.text("Unauthorized");
    }
  });

blogRouter.post('/newblog',async (c) => {
    const body=await c.req.json()
    const {success} =createBlogInput.safeParse(body)
	if(!success){
		c.status(411)
		return c.json({
			message:"Inputs not correct"
		})
	}
    const authorId=c.get("userId")
	try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL,
        }).$extends(withAccelerate())
        const blog=await prisma.blog.create({
            data:{
                title: body.title,
                content:body.content,
                authorId:Number(authorId)
            }
        })
        return c.text(blog.id)
    } catch (error) {
        console.log(error)
    }
})

blogRouter.put('/',async (c) => {
    try {
        const body=await c.req.json()
        const {success} =updateBlogInput.safeParse(body)
        if(!success){
            c.status(411)
            return c.json({
                message:"Inputs not correct"
            })
        }
        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL,
        }).$extends(withAccelerate())
        const blog=await prisma.blog.update({
            where:{
                id:body.id
            },
            data:{
                title: body.title,
                content:body.content
            }
        })
        return c.text(blog.id)
    } catch (error) {
        console.log(error)
        c.text("Error")
    }
	return c.text('Hello hono')
})

blogRouter.get('/blogbyid/:id',async (c) => {
	const id=c.req.param("id")
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate())
    try {
        const blog=await prisma.blog.findFirst({
            where:{
                id:id
            }
        })
        return c.json({
            blog
        })
    } catch (error) {
        c.status(403)
        console.log("Error")
    }

	return c.text('get blog route')
})

blogRouter.get('/allblogs', async (c) => {
    console.log("Request received at /allblogs route");
    const databaseUrl = c.env?.DATABASE_URL;
    if (!databaseUrl) {
        console.log("DATABASE_URL is not defined");
        c.status(500)
        return c.json({ error: "DATABASE_URL is not configured." });
    }
    const prisma = new PrismaClient({
        datasourceUrl: databaseUrl,
    }).$extends(withAccelerate());
    console.log("00002")
    try {
        const blogs = await prisma.blog.findMany();
        // console.log("Fetched blogs:", blogs);
        return c.json({
            blogs: blogs,
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        c.status(500)
        return c.json({ error: "Failed to fetch blogs" });
    }
});
