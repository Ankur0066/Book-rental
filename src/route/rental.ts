import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';
import  RentBookInput  from '../index';

export const rentalRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

// Middleware to authenticate the user
rentalRouter.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization') || '';
  try {
    const user = await verify(authHeader, c.env.JWT_SECRET);
    if (user) {
      //@ts-ignore
      c.set('userId', user.id);
      await next();
    } else {
      c.status(403); // Unauthorized
      return c.json({ msg: 'You are not logged in' });
    }
  } catch (e) {
    c.status(403); // Unauthorized
    return c.json({ msg: 'You are not logged in' });
  }
});

// Rent a book
rentalRouter.post('/rent', async (c) => {
  const body = await c.req.json();
  const { success } = RentBookInput.safeParse(body);

  // Validate input
  if (!success) {
    c.status(400); // Bad request
    return c.json({ msg: 'Invalid input' });
  }

  const userId = c.get('userId'); // Get the user ID from the middleware
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    // Check if the book exists
    const book = await prisma.book.findUnique({
      where: { id: body.bookId },
    });

    if (!book) {
      c.status(404); // Not found
      return c.json({ msg: 'Book not found' });
    }

    // Check if the book is already rented
    const existingRental = await prisma.rental.findFirst({
      where: { bookId: body.bookId, returned: false },
    });

    if (existingRental) {
      c.status(409); // Conflict
      return c.json({ msg: 'Book is already rented' });
    }

    // Rent the book
    const rental = await prisma.rental.create({
      data: {
        bookId: body.bookId,
        userId: userId,
        rentedAt: new Date(),
        returned: false,
      },
    });

    return c.json({ msg: 'Book rented successfully', rental });
  } catch (e) {
    console.error(e);
    c.status(500); // Internal server error
    return c.json({ msg: 'Error renting the book' });
  }
});