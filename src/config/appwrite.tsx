import { Client, Account } from "appwrite";

export const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("66b4805e0036939d4c4e"); // Replace with your project ID

export const account = new Account(client);
export { ID } from "appwrite";
