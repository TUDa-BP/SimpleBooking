import { Client, Users, Databases } from 'node-appwrite';

async function deleteBookings(roomBookings, placeBookings, hardwareBookings, databases){
    // delete all related room bookings
    for(const booking of roomBookings){
      await databases.deleteDocument(
        process.env.DB_ID, 
        process.env.ROOMBOOKING_ID, 
        booking.$id
      )
    }
  // delete all related place Bookings
  for(const booking of placeBookings){
    await databases.deleteDocument(
      process.env.DB_ID, 
      process.env.PLACEBOOKING_ID, 
      booking.$id
    )
  }
  // delete all related hardware bookings
  for(const booking of hardwareBookings){
    await databases.deleteDocument(
      process.env.DB_ID, 
      process.env.HWBOOKING_ID, 
      booking.$id
    )
  }
}

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const users = new Users(client);
  const databases = new Databases(client);

  try {
    // Set the filtering date
    const today2YearsAgo = new Date();
    today2YearsAgo.setMilliseconds(0);
    today2YearsAgo.setSeconds(0);
    today2YearsAgo.setMinutes(0);
    today2YearsAgo.setFullYear(today2YearsAgo.getFullYear() - 2);

    console.log(`cut-off date: ${today2YearsAgo.toLocaleDateString()}`);

    // Get list of all users
    const response = await users.list();
    // Filter
    const filteredList = response.users.filter( 
      user =>  
      // Was created 2 years ago & never accessed
      (!user.accessedAt && new Date(user.$createdAt) < today2YearsAgo)
      // Last usage was 2 years ago
      ||  new Date(user.accessedAt) < today2YearsAgo 
    )

    for (const user of filteredList){
      await deleteBookings(user.roomBooking, user.placeBooking, user.hardwareBooking, databases)
      log(`User ${user.$id} will be deleted.`)
      // Delete user form user collection
      await databases.deleteDocument(
        process.env.DB_ID, 
        process.env.USER_ID, 
        user.$id
      )
      // Delete user from 'Auth'
      await users.delete(user.$id)
    }

    log(`Total of deleted users: ${filteredList.length}`);

    return res.json({
      success: true,
      text: "Users deleted successfully!",
      num_deletions: filteredList.length
    })
  } catch(err) {
    error("Could not delete users: " + err.message);

    return res.json({
      success: false,
      text: "Deletion of users failed!"
    })
  }
};
