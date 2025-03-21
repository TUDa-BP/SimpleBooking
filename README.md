<h1 align="center">
  <br>
  <a href="https://github.com/TUDa-BP/SimpleBooking/">
  <img src="./public/TestLogo.png" alt="Simple Booking" width="250"></a>
  <br>
  Simple Booking Tool
  <br>
</h1>

<h4 align="center">A user-friendly setup for booking rooms, workstations & equipment,<br> adapted for institutes <a href="https://www.tu-darmstadt.de/" target="_blank">TU Darmstadt</a>.</h4>

<p align="center">
    <a href="https://nodejs.org/">
        <img src="https://img.shields.io/badge/node.js-v22.11.0-blue?logo=node.js&logoColor=white" alt="npm     v22.11.0">
    </a>
    <a href="https://vuejs.org/">
        <img src="https://img.shields.io/badge/Vue.js-v3.5.13-1EAEDB?logo=vue.js&logoColor=white" alt="Vue. js v3.5.13">
    </a>
    <a href="https://vite.dev/">
        <img src="https://img.shields.io/badge/Vite-v5.4.14-brightgreen?logo=vite&logoColor=white"  alt="Vite v5.4.14">
    </a>
    <a href="https://pinia.vuejs.org/">
        <img src="https://img.shields.io/badge/Pinia-v2.3.1-yellow?logo=pinia&logoColor=white" alt="Pinia   v2.3.1">
    </a>
    <a href="https://www.npmjs.com/">
        <img src="https://img.shields.io/badge/npm package-v10.9.0-CB3837?logo=npm&logoColor=white"     alt="npm v10.9.0">
    </a>
    <a href="https://getbootstrap.com/">
        <img src="https://img.shields.io/badge/Bootstrap-v5.2.10-563D7C?logo=bootstrap&logoColor=white"     alt="Bootstrap v5.2.10">
    </a>
    <a href="https://appwrite.io/">
        <img src="https://img.shields.io/badge/Appwrite-v0.16.0-000000?logo=appwrite&logoColor=white"   alt="Appwrite v0.16.0">
    </a>
</p>


<p align="center">
  <a href="#key-key-features">Key Features</a> •
    <a href="#computer-tech-stack">Tech Stack</a> •
  <a href="#wrench-how-to-setup">How To Setup</a> •
  <a href="#page_facing_up-wiki">Wiki</a> •
  <a href="#copyright-license">License</a>
</p>

<h5 align="center">
This project was developed as part of the ‘Bachelor Practical’ course at TU Darmstadt.
</h5>

## :key: Key Features

* Easy Booking Setup
* Intuitive User Experience
* Single-Page Application
* Tailored Authorization Based on User Roles
* Cross Browser

## :computer: Tech Stack

<details>
      <summary>Front End</summary>
      <ul>
        <li><a href="https://nodejs.org/en/download/">Node.js</a></li>
        <li><a href="https://vuejs.org/">Vue</a></li>   
        <li><a href="https://vite.dev/">Vite</a></li>
        <li><a href="https://pinia.vuejs.org/">Pinia</a></li>
      </ul>
</details>

<details>
      <summary>Back End</summary>
      <ul>
        <li><a href="https://appwrite.io/">Appwrite</a></li>  
      </ul>
</details>

## :wrench: How To Setup

> **Note**
> For this project to work properly you will have to set up an appwrite databases corresponding to the database structure given in the [wiki](./wiki/home.md).

To set up this project you will need to install <a href="https://nodejs.org/en/download/">Node.js</a> & <a href="https://vuejs.org/">Vue</a>.
This project uses env-variables, the necessary entries can be foud [here](#gear-env-variables).

<div style="display: flex; justify-content: space-between;">
  <div style="width: 48%;">
   
  <img src="https://img.shields.io/static/v1?label=&message=git&logo=git&style=flat-square" alt="Git Logo"> **Option 1**
1. Clone this repository
    ```bash
    $ git clone https://github.com/TUDa-BP/SimpleBooking.git
    ```
2. Install dependencies
    ```bash
    $ npm install
    ```
3. Set the env variables & adjust the config files of the cloud functions
4. Run the project
    ```bash
    $ npm run build
    ```
  </div>
  <div style="width: 48%;">

<img src="https://img.shields.io/static/v1?label=&message=docker&logo=docker&style=flat-square" alt="Docker Logo"> **Option 2**
1. Clone this repository
    ```bash
    $ git clone https://github.com/TUDa-BP/SimpleBooking.git
    ```
2. Set the env variables & adjust the config files of the cloud functions
3. Build the docker image
    ```shell
    $ sudo docker build -t simple_booking
    ```
4. Run the docker image:
    ```shell
    $ sudo docker run -p 8081:80 simple_booking
    ```
  </div>
</div>


#### :gear: Env Variables

The following list includes all the environment variables in use. Some can be adjusted as needed, others must remain as specified. More information can be found in the [wiki](#page_facing_up-wiki).\
Additionally, an example configuration file that can be modified is provided within the repository.

| Key                                                          |  Fix Value |
| ------------------------------------------------------------ | --- |
| `VITE_CLOUDFUNCTION_REGISTER_ID`                            |  ✔️   |
| `VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ID`                   | ✔️   |
| `VITE_CLOUDFUNCTION_PLACEBOOKING_ID`                        | ✔️   |
| `VITE_CLOUDFUNCTION_HARDWAREBOOKING_ID`                     | ✔️   |
| `VITE_CLOUDFUNCTION_ROOMBOOKING_ID`                         | ✔️   |
| `VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ID`               | ✔️   |
| `VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ID`                      | ✔️   |
| `VITE_CLOUDFUNCTION_HWMANAGEMENT_ID`                        | ✔️   |
| `VITE_CLOUDFUNCTION_REGISTER_ENDPOINTREGISTER`              | ✔️   |
| `VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ENDPOINTIMPORTCSV`    | ✔️   |
| `VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ENDPOINTUPDATEACCOUNT`| ✔️   |
| `VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ENDPOINTDELETEACCOUNT`| ✔️   |
| `VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ENDPOINTCREATEACCOUNT`| ✔️   |
| `VITE_CLOUDFUNCTION_PLACEBOOKING_ENDPOINTBOOKPLACE`         | ✔️   |
| `VITE_CLOUDFUNCTION_HARDWAREBOOKING_ENDPOINTBOOKHARDWARE`   | ✔️   |
| `VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ENDPOINTDELETEPLACEBOOKING` | ✔️   |
| `VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ENDPOINTDELETEHWBOOKING` | ✔️   |
| `VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ENDPOINTDELETEROOMBOOKING` | ✔️   |
| `VITE_CLOUDFUNCTION_ROOMBOOKING_ENDPOINTBOOKROOM`           | ✔️   |
| `VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ENDPOINTTOGGLEPLACE`     | ✔️   |
| `VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ENDPOINTTOGGLEROOM`      | ✔️   |
| `VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ENDPOINTDELETEPLACE`     | ✔️   |
| `VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ENDPOINTDELETEROOM`      | ✔️   |
| `VITE_CLOUDFUNCTION_HWMANAGEMENT_ENDPOINTTOGGLEHW`          | ✔️   |
| `VITE_CLOUDFUNCTION_HWMANAGEMENT_ENDPOINTDELETEHW`          | ✔️   |
| `VITE_RESET_LINK`                                           | ✔️   |
| `VITE_BACKEND_URL`                                           | ❌   |
| `VITE_PROJECT_ID`                                           | ❌   |
| `VITE_DB_ID`                                                | ❌   |
| `VITE_DB_USER_ID`                                           | ❌   |
| `VITE_DB_ROOMBOOKING_ID`                                    | ❌   |
| `VITE_DB_PLACEBOOKING_ID`                                   | ❌   |
| `VITE_DB_HWBOOKING_ID`                                      | ❌   |
| `VITE_DB_PLACE_ID`                                          | ❌   |
| `VIDE_DB_ROOM_ID`                                           | ❌   |
| `VITE_DB_FEATURE_ID`                                        | ❌   |
| `VITE_DB_HW_ID`                                             | ❌   |
| `VITE_DB_STORAGELOCATION_ID`                                | ❌   |
| `VITE_DB_TIME_QUOTA_ID`                                     | ❌   |
| `VITE_DB_TIME_QUOTA_DOC_ID`                                 | ❌   |
| `VITE_STORAGE_USERELIGIBILITY_ID`                           | ❌   |
| `VITE_TIMESLOT_SIZE`                                        | ❌   |
| `VITE_BEGIN_BOOKINGTIME`                                    | ❌   |
| `VITE_END_BOOKINGTIME`                                      | ❌   |



#### :arrow_forward: Run Tests


To run the unit tests run the following command in the shell:
```bash
$ npm run test:unit
```
## :page_facing_up: Wiki

The [wiki](https://github.com/TUDa-BP/SimpleBooking/wiki) contains the following aspects:
- general information
  - naming convention
  - tools in use
- project structure
  - file & folder structure
  - env variables & their purpose
- database structure
- cloud functions
  - variables to set in appwrite
- testing
- use cases

## :copyright: License

<p>This project is licensed under the <a href="/LICENSE">MIT License</a>.</p> 
<p>Third-party libraries in use are governed by the following licenses:  <a href="/THIRD_PARTY_LICENSES.txt">view licenses</a>.</p>
