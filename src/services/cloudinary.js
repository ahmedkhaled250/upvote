import cloudinary from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __direName = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__direName, "../../config/.env") });
cloudinary.v2.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});
export default cloudinary.v2;
