# Topology Mobile

This application demonstrates how to build a patient-facing healthcare app that can securely connect to Epic and other EMR systems through the [SMARTerFHIR toolkit](https://github.com/TopologyHealth/SMARTerFHIR).

## Key Features

- OAuth2 Authentication with Epic and other EMR systems
- Patient data retrieval and display
- View patient health information including:
- Conditions and Practitioners
  - Health goals
  - Diagnostics
  - Upcoming appointments
  - Health metrics
  - Medications

### Application Content

The following screenshots showcase the key features of the Topology Mobile application powered by the SMARTerFHIR toolkit.

| ![Initial login screen](images/login.png) | ![Epic login screen](images/epic-login.png) | ![Authorization screen](images/allow-access.png) |
| :---------------------------------------: | :-----------------------------------------: | :----------------------------------------------: |
|                Epic Login                 |              Application Login              |               OAuth2 Authorization               |

| ![Patient dashboard](images/home-screen.png) | ![Alternative dashboard view](images/alternative-home.png) | ![Health metrics and medications](images/medications-health-metrics.png) |
| :------------------------------------------: | :--------------------------------------------------------: | :----------------------------------------------------------------------: |
|              Patient Dashboard               |                Dashboard (Alternative View)                |                       Health Metrics & Medications                       |

### About Topology Health

Topology Health has a set of tools for faster and easier EMR/EHR integration. https://github.com/TopologyHealth

## Get started

### Prerequisites

- [Expo CLI](https://docs.expo.dev/)
- npm or yarn
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Install

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### Configuring Epic OAuth2

1. Create a account on https://fhir.epic.com/Developer/

2. Inside your developer view, create a new App

   1. Create two new client applications, one for web and one for native.
   2. Set the Redirect URI to `http://localhost:8081` for the web client and something like `exp://192.168.???.???:8081` for the native client.
      - Run `npm start`, run the app on your device with Expo Go, and check the "Redirect URL: ..." log message in the terminal to get the IP address to use.
   3. After creating the two new client applications, copy the client ID from both.

3. Copy the `.env.local.example` file to `.env`

   ```bash
   cp .env.local.example .env
   ```

4. Fill in the values in the `.env` file:

   ```bash
   EXPO_PUBLIC_MEDPLUM_WEB_CLIENT_ID=your_web_client_id
   EXPO_PUBLIC_MEDPLUM_NATIVE_CLIENT_ID=your_native_client_id
   ```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## License

This project is licensed under the MIT License - see the `LICENSE.txt` file for details.

## Commercial Support

[![alt text](https://avatars2.githubusercontent.com/u/5529080?s=80&v=4 "Vinta Logo")](https://www.vintasoftware.com/)

This is an open-source project maintained by [Vinta Software](https://www.vinta.com.br/). We are always looking for exciting work! If you need any commercial support, feel free to get in touch: contact@vinta.com.br
