import dotenv from "dotenv";
dotenv.config();

export function Random(len: number) {
  const options = process.env.RANDOM_STRING;
  if (!options) {
    console.warn("RANDOM_STRING is not defined in environment variables. Returning empty string.");
    return "";
  }
  const length = options.length;
  let result = "";
  for (let i = 0; i < len; i++) {
    result += options[Math.floor(Math.random() * length)];
  }
  return result;
}
