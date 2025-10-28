import express from "express";
import { db } from "../db/db.js";
const router = express.Router();

/**
 * stub for countries
 * vgsales has no country field, so I will replace this with trends based query in later phase2...?
 */
const COUNTRIES_BY_REGION = {
  NA: ["United States", "Canada", "Mexico"],
  EU: ["United Kingdom", "Germany", "France", "Spain", "Italy"],
  JP: ["Japan"],
  OTHER: ["Australia", "Brazil", "South Korea"]
};


export default  router;

