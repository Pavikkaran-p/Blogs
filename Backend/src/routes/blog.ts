import { createBlogInput, updateBlogInput } from "@pavikkaran/blogapp";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
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
    const authHeader = c.req.header("authorization") || "";
    
    try {
      const user = await verify(authHeader, c.env.JWT_SECRET);
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

blogRouter.post('/',async (c) => {
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

blogRouter.get('/', async (c) => {
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

    try {
        const blogs = await prisma.blog.findMany();
        console.log("Fetched blogs:", blogs);
        return c.json({
            blogs: blogs,
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        c.status(500)
        return c.json({ error: "Failed to fetch blogs" });
    }
});
