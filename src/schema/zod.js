import z from "zod";
export const signupInput = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
});
export const signinInput = z.object({
    username: z.string().email(),
    password: z.string().min(6),
});
export const createBookInput = z.object({
    title: z.string(),
    content: z.string(),
});
export const updateBookInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.number()
});
