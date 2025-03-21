import { Client, Users, Databases, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const databases = new Databases(client);

  try {
    const storageLocations = await databases.listDocuments(process.env.DB_ID, process.env.STORAGELOCATION_ID);
    const storageLocationsToDelete = storageLocations.documents.filter(location => !location.hardware || location.hardware.length === 0);

    
    for (const storageLocation of storageLocationsToDelete) {
      await databases.deleteDocument(process.env.DB_ID, process.env.STORAGELOCATION_ID, storageLocation.$id);
      log(`Deleted storage location with ID: ${storageLocation.$id}`);
    }

    log(`Total of deleted storage locations: ${storageLocationsToDelete.length}`);

    return res.json({
      success: true,
      message: `Storage locations deleted successfully!`,
      num_deletions: storageLocationsToDelete.length
    });
  } catch (err) {
    error("Could not delete storage locations: " + err.message);

    return res.json({
      success: false,
      text: "Deletion of storage locations failed!"
    });
  }

};
