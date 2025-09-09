import express from "express";
import dotenv from "dotenv";

import { drizzle } from "drizzle-orm/libsql";
import { createCode } from "./util.ts";
import { linksTable } from "./db/schema.ts";
import { eq } from "drizzle-orm";

dotenv.config();

const app = express();
const port = process.env.PORT;

const db = drizzle(process.env.DB_FILE_NAME!);

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
        if (Date.now() - links[0].created_at > 86400000)  {
            await db
                .delete(linksTable)
                .where(eq(linksTable.code, code));

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

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "dist" });
});

app.get("/code", (req, res) => {
    res.status(404);
});

app.get("/c/:code", (req, res) => {
    res.sendFile("code.html", { root: "dist" });
});

app.listen(port, () => {
    console.log(`Listen on port ${port}`);
});
