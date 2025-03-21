<template>
  <div class="importcourses">
    <h1>Import Course List</h1>
    <!-- The code is split into 3 different modies. Here the import modus begins -->
    <div v-if="modus === 'import'" :class="`modus-${modus} modus`">
      <main>
        <section class="block form-group">
          <label for="file" class="form-label"
            >Select a CSV file to import</label
          >
          <input
            class="form-control"
            type="file"
            accept=".csv"
            @change="fileSelected"
          />
        </section>
        <!-- This block will show up when the user selected an input file trough the form
                In this part the user can select the attributes from the CSV file that will be imported 
            -->
        <section class="block" v-if="importedStatus">
          The following rows were found in the CSV file. Please select the
          corresponding user attributes:
          <i
            >Each user must have a first name and a last name, or a combined
            field containing both. Additionally, an email address is required
            for every user.</i
          >
          <table class="select-attributes table">
            <thead>
              <tr>
                <th>Attribute from CSV file</th>
                <th>User Attribute</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="attribute in Object.keys(attributesinCSV)"
                :key="attribute"
              >
                <td>{{ attribute }}</td>
                <td>
                  <select
                    class="form-select"
                    v-model="attributesinCSV[attribute]"
                  >
                    <option selected value>-- select an attribute --</option>
                    <option
                      v-for="userAttribute in attributsOfUser"
                      :value="userAttribute"
                      :disabled="
                        checkIFAddingWouldResultInDuplicate(
                          userAttribute,
                          attribute
                        )
                      "
                    >
                      {{ userAttribute }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
      <footer class="button-group">
        <button
          v-if="importedStatus && checkifNeededAttributesAreSelected"
          class="btn classic-button"
          @click="importCourses"
        >
          Import users
        </button>
        <button class="btn classic-button" @click=closeOverlay>Cancel</button>
      </footer>
    </div>
    <!-- This block will show up when the user selected the import button and the import is in progress -->
    <div :class="`modus-${modus} modus`" v-if="modus == 'uploading'">
      <i>Loading, please wait...</i><br />
      <div class="spinner-border register-loading" role="status">
        <span class="sr-only"></span>
      </div>
    </div>
    <!-- This block will show up when the import is finished and the result is shown -->
    <div v-if="modus === 'result'" :class="`modus-${modus} modus`">
      <div class="block">
        <p>
          Imported {{ createdUsers.length }} users successfully.
          {{ notCreatedUsers.length }} users could not be imported due to
          errors.
        </p>
      </div>
      <!-- This block lists all users that were imported sucessfully -->
      <div class="block" v-if="createdUsers.length > 0">
        <table class="table caption-top">
          <caption>
            Imported users:
          </caption>
          <thead>
            <tr>
              <th v-for="(value, key) in createdUsers[0]" :key="key">
                {{ key }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(course, index) in createdUsers" :key="index">
              <td v-for="(value, key) in course" :key="key">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- This block lists all users that were not imported sucessfully -->
      <div class="block" v-if="notCreatedUsers.length > 0">
        <table class="table caption-top">
          <caption>
            Users that could not be imported:
          </caption>
          <thead>
            <tr>
              <th scope="col">first_name</th>
              <th scope="col">last_name</th>
              <th scope="col">Email</th>
              <th scope="col">Error</th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="table-danger"
              v-for="user in notCreatedUsers"
              :key="user.email"
            >
              <td>{{ user.first_name || "N/A" }}</td>
              <td>{{ user.last_name || "N/A" }}</td>
              <td>{{ user.email || "N/A" }}</td>
              <td>{{ user.error || "N/A" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- This block will show up when the import is finished and the user can import more users or cancel -->
      <footer class="button-group" v-if="modus === 'result'">
        <button class="btn classic-button" @click="cancel">
          Import more users
        </button>
        <button class="btn classic-button" @click="closeOverlay">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Papa from "papaparse";
import { Functions } from "appwrite";
import { client } from "../appwrite";

// use Message Store
import { useMessageStore } from "@/store/messages";
const messageStore = useMessageStore();

const functions = new Functions(client);

const importedStatus = ref(false);
const uploadedStatus = ref(false);

// This variable will be used to switch between the different modus
const modus = ref("import");

// The attributes are assigned to this variable. The key is the attribute from the CSV file and the value is the user attribute
const attributesinCSV = ref({});

/**
 * @function checkIFAddingWouldResultInDuplicate
 * @description Checks if a selected attribute is already mapped to another CSV attribute.
 * @param {string} keySelection - The selected user attribute.
 * @param {string} attribute - The current CSV attribute being mapped.
 * @returns {boolean} True if the attribute is already mapped, false otherwise.
 */
const checkIFAddingWouldResultInDuplicate = (keySelection, attribute) => {
  for (const key in attributesinCSV.value) {
    if (attributesinCSV.value[key] === keySelection && key !== attribute) {
      return true;
    }
  }
  return false;
};

const isloading = ref(false);
const createdUsers = ref([]);
const notCreatedUsers = ref([]);

// These are the attributes that are available in the CSV file and can be selected to import

const attributsOfUser = [
  "email",
  "first_name",
  "last_name",
  "first and last_name",
];
var importedCourses = [];

/**
 * @function parseCSV
 * @description Parses the selected CSV file and extracts its data.
 * @param {File} file - The CSV file to parse.
 * @returns {Promise<Array>} A promise that resolves with the parsed data.
 */
const parseCSV = (file) => {
  // PapaParse is a library that can parse CSV files
  // it does not support promises, so we need to wrap it in a promise
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        // When the parsing is complete, we check if there is any data in the file
        if (results.data.length > 0) {
          resolve(results.data);
        } else {
          reject("No data found in the file!");
        }
      },
    });
  });
};

/**
 * @function fileSelected
 * @description Handles the file selection event and parses the selected CSV file.
 * @param {Event} event - The file input change event.
 */
const fileSelected = async (event) => {
  //First reset all variables
  attributesinCSV.value = {};

  //Get the file from the event
  const file = event.target.files;
  // User can select multiple files, but we only need the first one
  const firstFile = file[0];
  try {
    if (!firstFile) throw new Error("No file selected!");
    const results = await parseCSV(firstFile);
    const firstRow = results[0];
    // Filter for every key in the first row
    for (const key in firstRow) {
      // Check if the key is not undefined, null or empty
      if (
        typeof firstRow[key] !== "undefined" &&
        firstRow[key] !== null &&
        firstRow[key] !== ""
      ) {
        // Add the key to the attributesinCSV object
        attributesinCSV.value[key] = "";
      }
    }
    importedCourses = results;
    importedStatus.value = true;
  } catch (error) {
    importedStatus.value = false;
    messageStore.showAlert(error.message, "danger");
  }
};

/**
 * @computed checkifNeededAttributesAreSelected
 * @description Validates if the required attributes are selected for import.
 * @returns {boolean} True if all required attributes are selected, false otherwise.
 */
const checkifNeededAttributesAreSelected = computed(() => {
  // we need to check if email is selected
  if (!Object.values(attributesinCSV.value).includes("email")) {
    return false;
  }
  // we need to check if first_name and last_name are selected or first and last_name
  if (
    !Object.values(attributesinCSV.value).includes("first_name") &&
    !Object.values(attributesinCSV.value).includes("first and last_name")
  ) {
    return false;
  }
  if (
    !Object.values(attributesinCSV.value).includes("last_name") &&
    !Object.values(attributesinCSV.value).includes("first and last_name")
  ) {
    return false;
  }
  // we need to check if first_name occures without last_name and vice versa
  if (
    Object.values(attributesinCSV.value).includes("first_name") &&
    !Object.values(attributesinCSV.value).includes("last_name")
  ) {
    return false;
  }
  if (
    Object.values(attributesinCSV.value).includes("last_name") &&
    !Object.values(attributesinCSV.value).includes("first_name")
  ) {
    return false;
  }
  return true;
});

/**
 * @function importCourses
 * @description Initiates the course import process by sending the data to the server.
 */
const importCourses = async () => {
  // double check ig needed attributes are selected
  if (!checkifNeededAttributesAreSelected.value) {
    messageStore.showAlert("Please select the required attributes!", "danger");
    return;
  }
  try {
    // check if cureses are imported
    if (importedCourses.length === 0)
      throw new Error("No courses found in the file!");
    const requestBody = {
      course: importedCourses,
      attributes: attributesinCSV.value,
    };
    //chage the modus to uploading. This will show the loading spinner
    modus.value = "uploading";
    console.log(requestBody);
    // Here we will create the request body with the data from the form
    // This will trigger the function that will import the courses
    const execution = await functions.createExecution(
      import.meta.env.VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ID, // functionId
      JSON.stringify(requestBody), // body (optional)
      true, // This is executed in the background otherwise the request would timeout
      import.meta.env.VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ENDPOINTIMPORTCSV, // path (optional)
      "POST",
      {
        "Content-Type": "application/json",
        Accept: "application/json",
      }
    );
    console.log(execution);
    const executionId = execution["$id"];
    // Here a realtime listener is added to the execution
    // otherwise the execution would break
    client.subscribe("executions." + executionId, (response) => {
      console.log("update on execution");
      try {
        const payload = response.payload;
        console.log(payload);
        if (payload.status === "completed") {
          let logs = JSON.parse(payload.logs);

          // users imported successfully
          // set status
          modus.value = "result";
          createdUsers.value = logs.created;
          notCreatedUsers.value = logs.notCreated;
        }
      } catch (error) {
        isloading.value = false;
        messageStore.showAlert(error.message, "danger");
        console.error(error);
      }
    });
  } catch (error) {
    isloading.value = false;
    messageStore.showAlert(error.message, "danger");
    console.error(error);
  }
};

/**
 * @function cancel
 * @description Resets the component state to allow importing more users.
 */
const cancel = () => {
  modus.value = "import";
  importedStatus.value = false;
  uploadedStatus.value = false;
  attributesinCSV.value = {};
  createdUsers.value = [];
  notCreatedUsers.value = [];
};

/**
 * @function closeOverlay
 * @description Emits an event to close the overlay and return to the account management page.
 */
const emit = defineEmits(['closeOverlay']);
function closeOverlay() {
  emit('closeOverlay');
}
</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;

#app,
body {
  height: 100vh !important;
}
main {
  height: calc(100% - 2em);
}
.importcourses {
    padding-bottom: 3em;
    .modus {
        height: 100%;
    }

  /* Height of the button */
  main {
    flex-grow: 1;
    height: calc(100% - 2.5em);
    grid-row: 2; // Place main content in the middle row
  }
}

footer {
    position: fixed;
    bottom: 12%;
    width: 100%;

  button {
    height: 2.5em;
    margin-right: 0.5em;
    padding: 0 2em 0 2em;
  }
}

.block {
  margin-top: 1em;
}

.select-attributes {
  td,
  th {
    vertical-align: middle;
  }
}

.modus-uploading {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;

  /* Center vertically */
  i {
    margin-bottom: 1em;
  }
}
</style>