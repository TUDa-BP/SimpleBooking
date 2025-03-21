import { Client, Storage, Account, Databases, Functions } from "appwrite";

export const client = new Client();
client.setEndpoint(import.meta.env.VITE_BACKEND_URL).setProject(import.meta.env.VITE_PROJECT_ID);

export const account = new Account(client);
export const storage = new Storage(client);
export const databases = new Databases(client); 
export const functions = new Functions(client);
