import { Client, Databases, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const database = new Databases(client);

  try {
    // Get all students
    const users = await database.listDocuments(
      process.env.DB_ID,
      process.env.USER_ID,
      [
        Query.contains("role", "student")
      ]
    );

    // Update of time_quota attribute
    for (const user of users.documents) {
      console.log(booking)
      await database.updateDocument(
        process.env.DB_ID,
        process.env.USER_ID,
        user.$id,
        { time_quota: user.maxTimeQuota.max_value }
      );
    }

    return res.json({
      success: true,
      message: "Time quota successfully set to its max. value",
      updatedCount: users.documents.length,
    });
  } catch (error) {
    console.error("Error reseting time quota:", error);
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
