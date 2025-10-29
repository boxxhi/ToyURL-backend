import express from "express";
import dotenv from "dotenv";

import { drizzle } from "drizzle-orm/libsql";
import { createCode, createToken, encodePassword } from "./util.ts";
import { googleTable, linksTable, usersTable } from "./db/schema.ts";
import { eq } from "drizzle-orm";

import { OAuth2Client } from "google-auth-library";

dotenv.config();

const app = express();
const port = process.env.PORT;

const db = drizzle(process.env.DB_FILE_NAME!);

const CLIENT_ID =
    "648082753611-avdkjg12avmnjhkug73j7asfsd9gef7e.apps.googleusercontent.com";
const googleClient = new OAuth2Client({
    client_id: CLIENT_ID,
    redirect_uris: ["http://localhost:3000", "http://localhost:5173"],
});

app.use(express.json());
app.use(express.static("dist"));

app.post("/api/create-url", async (req, res) => {
    const data = req.body;
    const url = data["url"];
    const code = createCode(url);

    await db.insert(linksTable).values({
        original_link: url,
        code: code,
        created_at: Date.now(),
    });

    res.status(201).send({
        shorterUrl: `${process.env.URL}/c/${code}`,
    });
});

app.post("/api/lookup", async (req, res) => {
    const data = req.body;
    const code = data["code"];

    const links = await db
        .select({
            code: linksTable.code,
            original_link: linksTable.original_link,
            created_at: linksTable.created_at,
        })
        .from(linksTable)
        .where(eq(linksTable.code, code));

    if (links.length > 0) {
        // Un dia despues de creado el link, se elimina
        if (Date.now() - links[0].created_at > 86400000) {
            await db.delete(linksTable).where(eq(linksTable.code, code));

            return void res.status(404).send({
                message: "Link not found",
            });
        }

        return void res.status(200).send({
            redirectUrl: links[0].original_link,
        });
    }

    res.status(404).send({
        message: "Link not found",
    });
});

app.post("/api/google", async (req, res) => {
    const { token } = req.body;

    const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    if (!response.ok) {
        return void res.status(401).send({
            success: false,
            message: "invalid_token"
        })
    }

    const user = await response.json();
    const user_id = user.sub.toString()

    const matches = await db
        .select({
            user_id: googleTable.user_id
        })
        .from(googleTable)
        .where(eq(googleTable.user_id, user_id))

    if (matches.length == 0) {
        await db.insert(googleTable).values({
            user_id: user_id,
            email: user.email,
            created_at: Date.now()
        })
    }
    
    res.status(200).send({
        success: true,
        token: createToken(user.email, user_id, true)
    })
    
});

app.post("/api/login", async (req, res) => {
    const data = req.body;

    const password = data["password"];
    const email = data["email"];

    const realPasswords = await db
        .select({
            password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email));

    if (realPasswords.length == 0) {
        return void res.status(401).send({
            message: "email_not_found",
            success: false,
        });
    }

    const realPassword = realPasswords[0].password;

    if (encodePassword(password) === realPassword) {
        return void res.status(200).send({
            success: true,
            token: createToken(email, password),
        });
    }

    res.status(401).send({
        success: false,
        message: "invalid_password",
    });
});

app.post("/api/register", async (req, res) => {
    const data = req.body;
    const password = data["password"];
    const email = data["email"];

    const emailEntries = await db
        .select({ email: usersTable.email })
        .from(usersTable);
    const emails = emailEntries.map((v) => v.email);

    if (emails.includes(email)) {
        return res.status(401).send({
            success: false,
            message: "already_used",
        });
    }

    await db.insert(usersTable).values({
        email: email,
        password: encodePassword(password),
        created_at: Date.now(),
    });

    res.status(201).send({
        success: true,
        token: createToken(email, password),
    });
});

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "dist" });
});

app.get("/code", (req, res) => {
    res.status(404);
});

app.get("/c/:code", (req, res) => {
    res.sendFile("code.html", { root: "dist" });
});

app.get("/login", (req, res) => {
    res.sendFile("login.html", { root: "dist" });
});

app.get("/register", (req, res) => {
    res.sendFile("register.html", { root: "dist" });
});

app.listen(port, () => {
    console.log(`Listen on port ${port}`);
});
