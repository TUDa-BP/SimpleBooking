export async function restoreTimeQuota(startTime, endTime, userId, databases){
    console.log("restore time quota");
    try{  
      const user = await databases.getDocument(process.env.DB_ID,process.env.USER_ID, userId);
      console.log("USER: ", userId);
  
      const maxTimeQuota = user.maxTimeQuota.max_value;
      const userTimeQuota = user.time_quota;
      console.log("user time quota: ", userTimeQuota)
      console.log("max time quota: ", maxTimeQuota)
  
      let timeDelta = new Date(startTime) - new Date(endTime);
      timeDelta = userTimeQuota + Math.floor(timeDelta / (1000 * 60))
      const newTimeQuota = {
        // Compute the minutes that are restored by the deletion
        time_quota: Math.min(timeDelta, maxTimeQuota)
      }
  
      await databases.updateDocument(
        process.env.DB_ID, // databaseId
        process.env.USER_ID, // collectionId
        userId, // documentId
        newTimeQuota, // data (optional)
      );
      console.log("timeDelta (min): ", timeDelta)
      console.log("new time quota (min): ", newTimeQuota)
    } catch (error) {
      console.error("Error restoring time quota:", error);
    }
  }