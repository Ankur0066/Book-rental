import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'
import { CreateBookInput, UpdateBookInput } from '../schema/zod'

export const bookRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	},
    Variables: {
        userId: string
    }
}>();

bookRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("Authorization") || ""
    const user = await verify(authHeader, c.env.JWT_SECRET)
    try {
        if(user){
            //@ts-ignore
            c.set("userId", user.id);
            await next();
        }
        else{
            c.status(403) //unauthorized
            c.json({
                msg: "You are not logged in"
            })
        }
    } catch(e){
        c.status(403) //unauthorized
        c.json({
            msg: "You are not logged in"
        })
    }
    
});

  bookRouter.post('/',async (c) => {
    const body = await c.req.json()
    const { success } = CreateBookInput.safeParse(body)
    if(!success){
        c.status(411);
        return c.json({
            msg: "Inputs are Incorrect"
        })
    }
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

    const book = await prisma.post.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: authorId
        }
    })
        return c.json({
            id: book.id
        })
    })
  
  bookRouter.put('/',async (c) => {
    const body = await c.req.json()
    const { success } = UpdateBookInput.safeParse(body)
    if(!success){
        c.status(411);
        return c.json({
            msg: "Inputs are Incorrect"
        })
    }
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

    const book = await prisma.post.update({
        where: {
            id: body.id
        },

        data:{
            title: body.title,
            content: body.content,
        }
    })
        return c.json({
            id: book.id
        })
    })

    //TODO pagination
    bookRouter.get('/bulk',async (c) => {
        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL, 
        }).$extends(withAccelerate());
        const books = await prisma.post.findMany({
            select:{
                content: true,
                title: true,
                id: true,
                author: {
                    select: {
                        name: true
                    }
                }
               
            }
        });

        return c.json({
            books
        })
    })
  
  bookRouter.get('/:id',async (c) => {
    const id = c.req.param("id")
    // const body = await c.req.json()
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

    try {
    const book = await prisma.post.findFirst({
        where: {
            id: id
        },
        select: {
            id: true,
            title: true,
            content: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    })
        return c.json({
            book
        });
    } catch(e){
        c.status(411);
        return c.json({
            msg: "Error while fecthing the book post"
        })
    }
})


