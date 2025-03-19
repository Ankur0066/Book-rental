import { Hono } from 'hono';
import { userRouter } from './route/user';
import { bookRouter } from './route/book';
// import { rentalRouter } from './route/rental'
import { cors } from 'hono/cors';
// Create the main Hono app
const app = new Hono();
app.use('/*', cors());
app.route("api/v1/user", userRouter);
app.route("api/v1/blog", bookRouter);
// app.route("api/v1/Rental", rentalRouter)
app.use('/message/*', async (c, next) => {
    await next();
});
export default app;
