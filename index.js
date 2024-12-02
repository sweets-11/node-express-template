#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs-extra";
import { execSync } from "child_process";
import {
  ejsContent,
  envData,
  configData,
  appContent,
  connectMongo,
  serverContent,
} from "./es_modules.js";

async function main() {
  console.log("Welcome to Node-Express Template!");

  // Ask if the user wants to use CommonJS or ESM
  const { moduleType } = await inquirer.prompt({
    type: "list",
    name: "moduleType",
    message: "Do you want to use ES Module?",
    choices: ["Yes", "No"],
    default: "Yes",
  });
  // Ask which packages to install
  const { packages } = await inquirer.prompt({
    type: "input",
    name: "packages",
    message:
      "Enter the packages you want to install (comma or space-separated): like express,cors or mongoose dotenv",
    default: "express, dotenv",
  });

  const packageList = packages.split(/[\s,]+/).filter(Boolean);

  // Initialize the project directory
  console.log("Initializing project...");
  execSync("npm init -y", { stdio: "inherit" });

  // Add type: module if ESM is selected
  if (moduleType === "Yes") {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    packageJson.type = "module";
    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
    console.log('Added "type: module" to package.json');
  }

  // Install selected packages
  console.log("Installing packages...");
  execSync(`npm install ${packageList.join(" ")}`, { stdio: "inherit" });
  execSync(`npm install -D nodemon`, { stdio: "inherit" });

  // Create project folder structure inside "src"
  const isEjsInstalled = packageList.includes("ejs");

  // Define folder structure
  const folders = [
    "controllers",
    "config",
    "routes",
    "models",
    "middlewares",
    "utils",
    "services",
  ];

  // Add "views" if ejs is installed
  if (isEjsInstalled) {
    folders.push("views");
  }

  // Create the "src" directory and its subfolders
  console.log("Setting up folder structure inside src...");
  const srcDir = "src"; // Root src directory
  fs.ensureDirSync(srcDir);
  fs.writeFileSync(`${srcDir}/config.js`, configData(moduleType));

  folders.forEach((folder) => {
    const folderPath = `${srcDir}/${folder}`;
    fs.ensureDirSync(folderPath);
    if (folder === "views" && isEjsInstalled) {
      fs.writeFileSync(`${folderPath}/home.ejs`, ejsContent);
    }
    if (folder === "services" && packageList.includes("mongoose")) {
      fs.ensureDirSync(folderPath);

      fs.writeFileSync(
        `${folderPath}/connectMongo.js`,
        connectMongo(moduleType)
      );
    }
    if (folder === "config") {
      if (packageList.includes("mongoose")) {
        let addDataToEnv = `${envData}\nMONGO_URI="mongodb://127.0.0.1:27017/"`;
        fs.writeFileSync(`${folderPath}/config.env`, addDataToEnv);
      } else {
        fs.writeFileSync(`${folderPath}/config.env`, envData);
      }
    }
  });
  console.log("Folders created:", folders.join(", "));

  // Add a basic Express app file inside the src folder

  // Save the app file in src directory
  fs.writeFileSync(`${srcDir}/app.js`, appContent(moduleType, packageList));
  fs.writeFileSync(`${srcDir}/server.js`, serverContent(moduleType));

  console.log("Basic Express app created in src/server.js");

  // Add start and dev scripts to package.json
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  packageJson.scripts = {
    ...packageJson.scripts,
    start: "cd src && node server.js",
    dev: "cd src && nodemon server.js",
  };
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log('Added "start" and "dev" scripts to package.json');

  console.log("Setup complete! 🎉");
}

main().catch((err) => {
  console.error("Error:", err.message);
});
