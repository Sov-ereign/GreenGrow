import Vapi from "@vapi-ai/web";
const API_KEY = import.meta.env.VITE_VAPI_API_KEY;
export const vapi = new Vapi(API_KEY as string);
