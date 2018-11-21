#!/usr/bin/env node
const bal = require('proxy-bal');
const service = require('./src/service');
const auth = bal.auth;
const balConfig =require('./project.config.json');

const clientID = balConfig.identity.appID;
const clientSecret = balConfig.identity.appSecret;

if (!balConfig.connection.hostIp.length) {
    console.error('No host specified for gateway.  Check the \'bal.config.json\' file.');
    process.exit(0);
}

if (!balConfig.identity.serviceName.length) {
    console.error('Service doesn\'t have a type.  Check the \'service.config.json\' file.');
    process.exit(0);
}

const access = bal.createAccess({
    gateway: {
        host: (process.env.ACS_GATEWAY_HOST || balConfig.connection.hostIp),
        app_port: (process.env.ACS_GATEWAY_PORT || ''),
        auth: new auth(clientID, clientSecret),
    },
});

access.on('connected', function () {
    access.registerService(service, {}, function (error, serviceInstance) {
        if (error) {
            console.error(error);
            return;
        }
        console.log('Service registered successfully with id: ' + serviceInstance.info.id);
        console.log('Service type: ' + serviceInstance.info.serviceType);
        console.log('Service version: ' + serviceInstance.info.serviceVersion);
        console.log('Service realm: ' + serviceInstance.info.serviceRealm);
    });
});

access.on('disconnected', function () {
    process.exit(0);
});

process.on('SIGTERM', function () {
    access.disconnect();
});

access.connect();
