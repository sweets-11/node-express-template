const ejsContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
</head>
<body>
    <h2>Hello world!</h2>
</body>
</html>`;

let envData = `ENVIRONMENT="development"  
PORT=4000`;

let configData = (moduleType) =>
  moduleType === "Yes"
    ? `
import { config } from "dotenv";

if (process.env.ENVIRONMENT === "development" || !process.env.ENVIRONMENT) {
    try {
        config({
            path: "./config/config.env",
        });
    } catch (error) {
        console.log("Error File Not Found : " + error);
    }
}

const configENV = {
    development: {
        PORT: process.env.PORT,
        ...(process.env.MONGO_URI ? { MONGO_URI: process.env.MONGO_URI } : {}),
    },
    staging: {
        PORT: process.env.PORT,
        ...(process.env.MONGO_URI ? { MONGO_URI: process.env.MONGO_URI } : {}),
    },
    production: {
        PORT: process.env.PORT,
        ...(process.env.MONGO_URI ? { MONGO_URI: process.env.MONGO_URI } : {}),
    },
};

export const appVersion = \`1.0.0 - \${process.env.ENVIRONMENT}\`;

export const getConfig = () => {
    return configENV[process.env.ENVIRONMENT] || configENV.development;
};
`
    : `
const { config } = require("dotenv");

if (process.env.ENVIRONMENT === "development" || !process.env.ENVIRONMENT) {
    try {
        config({
            path: "./config/config.env",
        });
    } catch (error) {
        console.log("Error File Not Found: " + error);
    }
}

const configENV = {
    development: {
        PORT: process.env.PORT,
        ...(process.env.MONGO_URI ? { MONGO_URI: process.env.MONGO_URI } : {}),
    },
    staging: {
        PORT: process.env.PORT,
        ...(process.env.MONGO_URI ? { MONGO_URI: process.env.MONGO_URI } : {}),
    },
    production: {
        PORT: process.env.PORT,
        ...(process.env.MONGO_URI ? { MONGO_URI: process.env.MONGO_URI } : {}),
    },
};

const appVersion = \`1.0.0 - \${process.env.ENVIRONMENT}\`;

const getConfig = () => {
    return configENV[process.env.ENVIRONMENT] || configENV.development;
};

module.exports = { appVersion, getConfig };
`;

const appContent = (moduleType, packageList) =>
  moduleType === "Yes"
    ? `import express, { urlencoded } from "express";
${packageList.includes("cors") ? `import cors from "cors";` : ""}
${packageList.includes("ejs") ? `import path from "path";` : ""}

${
  packageList.includes("cookie-parser")
    ? `import cookieParser from "cookie-parser";`
    : ""
}

export const app = express();

${packageList.includes("cors") ? `app.use(cors());` : ""}
${packageList.includes("cookie-parser") ? `app.use(cookieParser());` : ""}
app.use(
    express.urlencoded({
        extended: false,
        limit: 10000,
        parameterLimit: 2,
    })
);
app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        },
    })
);

${
  packageList.includes("ejs")
    ? `
app.set("view engine", "ejs");
app.set("views", path.resolve("views"));
app.get("/", (req, res) => {
    res.render("home");
});
`
    : ""
}
`
    : `
const express = require("express");
${packageList.includes("cors") ? `const cors = require("cors");` : ""}
${packageList.includes("ejs") ? `const path = require("path");` : ""}

${
  packageList.includes("cookie-parser")
    ? `const cookieParser = require("cookie-parser");`
    : ""
}

const app = express();

${packageList.includes("cors") ? `app.use(cors());` : ""}
${packageList.includes("cookie-parser") ? `app.use(cookieParser());` : ""}
app.use(
    express.urlencoded({
        extended: false,
        limit: 10000,
        parameterLimit: 2,
    })
);
app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        },
    })
);

${
  packageList.includes("ejs")
    ? `
app.set("view engine", "ejs");
app.set("views", path.resolve("views"));
app.get("/", (req, res) => {
    res.render("home");
});
`
    : ""
}

module.exports = { app };
`;

const connectMongo = (moduleType) =>
  moduleType === "Yes"
    ? `
import mongoose from "mongoose";

export const connectMongo = (URL, dbName = "testDB") => {
    mongoose
        .connect(URL, { dbName })
        .then((e) => {
            console.log(\`connected to \${e.connection.host}\`);
        })
        .catch((err) => {
            console.log(err);
        });
};
`
    : `
const mongoose = require("mongoose");

const connectMongo = (URL, dbName = "testDB") => {
    mongoose
        .connect(URL, { dbName })
        .then((e) => {
            console.log(\`connected to \${e.connection.host}\`);
        })
        .catch((err) => {
            console.log(err);
        });
};

module.exports = { connectMongo };
`;

const serverContent = (moduleType) =>
  moduleType === "Yes"
    ? `
import { app } from "./app.js";
import { connectMongo } from "./services/connectMongo.js";
import { getConfig } from "./config.js";

const config = getConfig();
connectMongo(config.MONGO_URI);

app.listen(config.PORT, () => {
    console.log("Server is running on PORT " + \`http://localhost:\${config.PORT}\`);
});
`
    : `
const { app } = require("./app.js");
const { connectMongo } = require("./services/connectMongo.js");
const { getConfig } = require("./config.js");

const config = getConfig();
connectMongo(config.MONGO_URI);

app.listen(config.PORT, () => {
    console.log("Server is running on PORT " + \`http://localhost:\${config.PORT}\`);
});
`;

export {
  ejsContent,
  envData,
  configData,
  appContent,
  connectMongo,
  serverContent,
};
