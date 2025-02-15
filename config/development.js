export default {
    appEnv: process.env.NODE_ENV,
    application: {
        port: process.env.PORT,
        token: process.env.TOKEN,
        isMaintenance: false,
        maintenanceMessage: "Scheduled maintenance activity is going on, we will be available soon.",
        versionNumbers: process.env.VERSIONS.split(", "),
    },
};