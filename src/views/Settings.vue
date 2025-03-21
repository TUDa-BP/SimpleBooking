<template>
    <div class="settings-page">

        <Sidebar :isSidebarVisible="isSidebarVisible" @toggleSidebar="toggleSidebar" />
        <div :class="['content', { 'content-expanded': !isSidebarVisible }]">
            <header>
                <h1>Settings</h1>
            </header>
            <div class="card mb-3" v-if="user !== null && user.hardware_eligibility === false">
                <div class="card-body">
                    <h5 class="card-title">Activate Hardware Eligibility</h5>
                    <p>How to get access to hardware booking:</p>
                    <ol>
                        <li>Download File</li>
                        <li>Edit & Sign</li>
                        <li>E-mail It Back</li>
                    </ol>
                    <a class="btn classic-button" :href="hardwareEligibilityFileURL" download>Download File</a>
                </div>
            </div>
            <div v-if="user !== null">
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Personal Data</h5>
                        <div class="mb-3">
                            <label for="firstName" class="form-label">First-name:</label>
                            <input type="text" class="form-control" id="firstName" v-model="user.first_name" disabled />
                        </div>
                        <div class="mb-3">
                            <label for="lastName" class="form-label">Last-name:</label>
                            <input type="text" class="form-control" id="lastName" v-model="user.last_name" disabled />
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">E-mail:</label>
                            <input type="email" class="form-control" id="email" v-model="user.email" disabled />
                        </div>
                        <div class="mb-3">
                            <label class="form-label" style="margin-right: 3px">Role:</label>
                            <span class="fw-bold" style="color: #6f42c1"> {{ user.role }}</span>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Hardware Eligibility</label>
                            <span>: </span>
                            <i v-if="user.hardware_eligibility" class="bi bi-check-circle text-success"></i>
                            <i v-else class="bi bi-x-circle text-danger"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <hr class="solid center">
            <h3 style="color: #6610f2 !important;">Personal Settings</h3>

            <div class="card mb-3" v-if="user !== null">
                <div class="card-body">
                    <h5 class="card-title
                    ">Change E-mail</h5>
                    <div class="mb-3">
                        <!--<label for="newEmail" class="form-label">New E-mail:</label>-->
                        <input type="email" class="form-control" id="newEmail" placeholder="New E-mail" v-model="newEmail" />

                    </div>
                    <div class="mb-3">
                        <!--<label for="passwordNeeded" class="form-label">Confirmation: </label>-->
                        <input type="password" class="form-control" id="passwordNeeded" placeholder="Confirm with Password"
                            v-model="passwordNeededForUpdate" />

                    </div>
                    <button @click="changeEmail" class="btn classic-button">Change E-mail</button>
                </div>
            </div>
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title
                    ">Change Password</h5>
                    <div class="mb-3">
                        <!--<label for="currentPassword" class="form-label">Current Password:</label>-->
                        <input v-model="currentPassword" type="password" class="form-control" placeholder="Current Password" id="currentPassword" />
                    </div>
                    <div class="mb-3">
                        <!--<label for="newPassword" class="form-label">New Password:</label>-->
                        <input type="password" v-model="newPassword" class="form-control" placeholder="New Password" id="newPassword" />
                    </div>
                    <button @click="changePassword" class="btn classic-button">Change Password</button>
                </div>
            </div>
            <template v-if="userStore.isAdmin">
                <hr class="solid center">
                <h3 style="color: #6610f2 !important;">General Settings</h3>
            </template>
            <div v-if="user != null && hardwareEligibilityFileMeta != null && isAdmin">
                <div class="mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Hardware Eligibility</h5>
                            <p class="card-text"><strong>File:</strong> {{ hardwareEligibilityFileMeta.name }}</p>
                            <p class="card-text"><strong>Size:</strong> {{ (hardwareEligibilityFileMeta.sizeOriginal /
                                (1024 * 1024)).toFixed(2) }} MB</p>
                            <p class="card-text"><strong>Uploaded On:</strong> {{ new
                                Date(hardwareEligibilityFileMeta.$createdAt).toLocaleString() }}</p>
                            <label for="formFile" class="form-label mt-3">Upload File</label>
                            <input class="form-control mb-3" type="file" id="formFile" accept="application/pdf"
                                @change="handleFileUpload" />
                            <button v-if="userHasSelectedFile != null && !uploading" class="btn classic-button"
                                @click="uploadFile">Upload</button>
                            <div v-if="uploading" class="spinner-border text-dark" role="status">
                                <span class="visually-hidden"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="user !== null && (isAdmin || isPhD) && timeQuotaObject != null">
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Change Max. Time Quota</h5>
                        <div class="mb-3">
                            <div class="mb-3">
                                <label for="timeQuota" class="form-label">Time Quota</label>
                                <span>: </span>
                                <input type="number" class="form-control d-inline-block w-25" id="days"
                                    v-model="timeQuotaObject.days" @change="changedTimeQuota = true" />
                                <span> d :</span>
                                <input type="number" class="form-control d-inline-block w-25" id="hours"
                                    v-model="timeQuotaObject.hours" @change="changedTimeQuota = true" />
                                <span> h :</span>
                                <input type="number" class="form-control d-inline-block w-25" id="minutes"
                                    v-model="timeQuotaObject.minutes" @change="changedTimeQuota = true" />
                                <span> min</span>
                            </div>
                            <button v-if="changedTimeQuota" @click="updateDefaultTimeQuota"
                                class="btn classic-button">Update</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { storage } from "../appwrite";
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import { useUserStore } from '@/store/user';
import { useMessageStore } from "@/store/messages";

const hardwareEligibilityFILEId = "00000000000";

const uploading = ref(false);

const isSidebarVisible = ref(true);
const userStore = useUserStore();
const messageStore = useMessageStore();

const user = computed(() => userStore.user);
const isAdmin = computed(() => userStore.isAdmin);
const isPhD = computed(() => userStore.isPhD);
const timeQuotaObject = ref(null);

const changedTimeQuota = ref(false);


const hardwareEligibilityFileURL = ref(null);
const hardwareEligibilityFileMeta = ref(null);

const userHasSelectedFile = ref(null);
const currentPassword = ref("");
const newPassword = ref("");
const newEmail = ref(null);
const passwordNeededForUpdate = ref(null);

/**
 * This onMounted lifecycle hook performs the following actions:
 * 1. Checks if the user is null and fetches the user data if necessary.
 * 2. Retrieves the hardware eligibility file metadata and URL from the storage.
 * 3. Logs the file URL to the console.
 * 4. Fetches the default time quota from the database and processes it into a time quota object.
 * 5. Handles any errors by showing an alert message with the error details.
 *
 * @async
 * @function onMounted
 * @returns {Promise<void>}
 */
onMounted(async () => {
    try {
        if (user.value === null) {
            await userStore.fetchUser();
        }
        const filedata = await storage.getFile(import.meta.env.VITE_STORAGE_USERELIGIBILITY_ID, hardwareEligibilityFILEId);
        hardwareEligibilityFileMeta.value = filedata;
        const file = storage.getFileDownload(
            import.meta.env.VITE_STORAGE_USERELIGIBILITY_ID,
            hardwareEligibilityFILEId
        );
        hardwareEligibilityFileURL.value = file;
        console.log(file);


        //get time quota from DB
        await userStore.getDeafultTimeQuota();
        timeQuotaObject.value = timeQuotaSplitIntoMinutesHoursDays(userStore.default_time_quota);


    } catch (error) {
        messageStore.showAlert(error.message, "danger");
    }
});

/**
 * Splits a given time quota (in minutes) into days, hours, and minutes.
 *
 * @param {number} timeQuota - The total time quota in minutes.
 * @returns {Object} An object containing the split time quota:
 *                   - {number} days - The number of days.
 *                   - {number} hours - The number of hours.
 *                   - {number} minutes - The number of minutes.
 */
const timeQuotaSplitIntoMinutesHoursDays = function (timeQuota) {
    const days = Math.floor(timeQuota / (24 * 60));
    const hours = Math.floor((timeQuota % (24 * 60)) / 60);
    const minutes = (timeQuota % 60);
    return { days, hours, minutes };
};

/**
 * Toggles the visibility of the sidebar.
 */
function toggleSidebar() {
    isSidebarVisible.value = !isSidebarVisible.value;
}

async function handleFileUpload(event) {
    userHasSelectedFile.value = event.target.files[0];
}
/**
 * Uploads a file to the storage.
 * 
 * This function performs the following steps:
 * 1. Checks if a file has been selected by the user.
 * 2. Validates that the file size does not exceed 5MB.
 * 3. Deletes the existing file from storage if it exists.
 * 4. Uploads the new file to the storage.
 * 5. Displays a success message upon successful upload.
 * 6. Updates the file metadata and download URL.
 * 
 * If any error occurs during the process, an error message is displayed.
 * 
 * @throws {Error} If no file is selected or if the file size exceeds 5MB.
 */

async function uploadFile() {
    try {
        if (userHasSelectedFile.value === null) throw new Error("No file selected");

        //check file size should not exceed 5MB
        if (userHasSelectedFile.value.size > 5 * 1024 * 1024) {
            throw new Error("File size should not exceed 5MB");
        }


        // check if file already exists
        if (hardwareEligibilityFileURL.value !== null) {
            await storage.deleteFile(
                import.meta.env.VITE_STORAGE_USERELIGIBILITY_ID,
                hardwareEligibilityFILEId
            );
        }
        console.log(userHasSelectedFile.value);
        uploading.value = true;
        const fileupload = await storage.createFile(
            import.meta.env.VITE_STORAGE_USERELIGIBILITY_ID,
            hardwareEligibilityFILEId,
            userHasSelectedFile.value
        );
        console.log(fileupload);
        uploading.value = false;
        messageStore.showAlert("Hardware eligibility file uploaded", "success");

        //update the file meta data
        hardwareEligibilityFileMeta.value = await storage.getFile(
            import.meta.env.VITE_STORAGE_USERELIGIBILITY_ID,
            hardwareEligibilityFILEId
        );
        hardwareEligibilityFileURL.value = storage.getFileDownload(
            import.meta.env.VITE_STORAGE_USERELIGIBILITY_ID,
            hardwareEligibilityFILEId
        );
    } catch (error) {
        messageStore.showAlert(error.message, "danger");
    }
}
/**
 * Asynchronously changes the user's password.
 * 
 * This function checks if the current password and new password fields are filled.
 * If either field is empty, it throws an error prompting the user to fill in all fields.
 * If both fields are filled, it attempts to change the password using the userStore.
 * Upon successful password change, it shows a success alert.
 * If an error occurs during the process, it shows an error alert with the error message.
 * 
 * @throws {Error} If either the current password or new password field is empty.
 */
async function changePassword() {
    try {
        if (currentPassword.value === "" || newPassword.value === "") {
            throw new Error("Please fill in all fields");
        }
        await userStore.changePassword(currentPassword.value, newPassword.value);
        messageStore.showAlert("Password changed", "success");
    } catch (error) {
        messageStore.showAlert(error.message, "danger");
    }
}
/**
 * Changes the user's email address.
 * 
 * This function performs the following steps:
 * 1. Validates that the new email and password fields are not empty.
 * 2. Calls the `changeEmail` method from the `userStore` to update the email.
 * 3. Displays a success message upon successful email change.
 * 
 * If any error occurs during the process, an error message is displayed.
 * 
 * @throws {Error} If any of the fields are empty.
 */
async function changeEmail() {
    try {
        if (newEmail.value === "" || passwordNeededForUpdate.value === "") {
            throw new Error("Please fill in all fields");
        }
        await userStore.changeEmail(newEmail.value, passwordNeededForUpdate.value);
        messageStore.showAlert("E-mail changed", "success");
    } catch (error) {
        messageStore.showAlert(error.message, "danger");
    }
}

/**
 * Updates the default time quota for the user.
 * 
 * This function calculates the total time quota in minutes based on the values
 * provided in the `timeQuotaObject` and updates the user's default time quota
 * using the `userStore`. If the update is successful, a success alert is shown.
 * If an error occurs, an error alert is shown with the error message.
 * 
 * @async
 * @function updateDefaultTimeQuota
 * @returns {Promise<void>} A promise that resolves when the time quota is updated.
 */
async function updateDefaultTimeQuota() {
    try {
        const time_quota_in_minutes = timeQuotaObject.value.days * 24 * 60 + timeQuotaObject.value.hours * 60 + timeQuotaObject.value.minutes;
        await userStore.setDefaultTimeQuota(time_quota_in_minutes);
        messageStore.showAlert("Time quota updated", "success");
    } catch (error) {
        messageStore.showAlert(error.message, "danger");
    }
}

</script>

<style scoped>
@import "../style/frames.scss";
@import "../style/button.scss";

header {
    margin-top: 20px;
}

.settings-page {
    display: flex;
}

.settings-content {
    flex-grow: 1;
    padding: 20px;
}
</style>