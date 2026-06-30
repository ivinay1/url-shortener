const zod =  require("zod");

const registerUserSchema = zod.object({

    name: zod
            .string()
            .trim()
            .min(3, {message: "Name must be atleast 3 characters long"})
            .max(100, {message:"Name must be atmost 100 characters long"}),
    email: zod
            .string()
            .email("Invalid email format")
            .max(100,{message:"Email must be atmost 100 characters long"}),
    password: zod
                .string()
                .trim()
                .min(6, {message: "Password must be atleast 6 characters long"})
                .max(10, {message:"Password must be atmost 10 characters long"})

})

module.exports = registerUserSchema;