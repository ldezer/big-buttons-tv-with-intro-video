"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var drizzle_kit_1 = require("drizzle-kit");
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is required to run drizzle commands");
}
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: "./drizzle/schema.ts",
    out: "./drizzle",
    dialect: "mysql",
    dbCredentials: {
        url: connectionString,
    },
});
