const util = require('util');
const bal = require('proxy-bal');
const ops = require('../config/service.ops.config.json');
const config = require('../project.config.json');

function Service(access, options) {
    Service.super_.call(this,
        access,
        {
            serviceType: config.identity.serviceName,
            description: config.identity.description,
            serviceRealm: config.identity.realm,
            serviceVersion: config.identity.version,
            ops: ops,
        },
        options);
};

util.inherits(Service, bal.Service);

module.exports = function (access, options) {
    return new Service(access, options);
};

Service.prototype.getDataFromAttributes = function (req, operationContext) {
    const message = {
        serviceType: 'avid.acs.attributes',
        serviceRealm: 'global',
        serviceVersion: '3',
        op: 'fetch',
        paramSet: {
            name: req.paramSet.name
        }
    };

    const options = {
        timeout: 2000
    };

    this.bus.advancedQuery(message, options, function (reply) {
        if (reply.errorSet) {
            operationContext.reply({
                resultSet: {
                    // type your return fields here
                    message: "Searched object does not exist",
                    status: 404,
                    body: {
                    }
                }
            })
        } else {
            operationContext.reply({
                resultSet: {
                    message: "Object is found",
                    status: 200,
                    body: {
                        name: reply.resultSet.name,
                        value: reply.resultSet.value
                    }
                }
            })
        }
    }, function () {
        this.logger.info("Timeout occurred");
    }, function (error) {
        this.logger.info("Error occurred. Error message: " + err.errorMessage);
    });
};

Service.prototype.postDataToAttributes = function (req, operationContext) {
    const message = {
        serviceType: 'avid.acs.attributes',
        serviceRealm: 'global',
        serviceVersion: '3',
        op: 'store',
        paramSet: {
            name: req.paramSet.name,
            value: req.paramSet.value
        }
    };

    const options = {
        timeout: 2000
    };

    this.bus.advancedQuery(message, options, function (reply) {
        if (reply.errorSet) {
            operationContext.reply({
                resultSet: {
                    message: "Object was not created",
                    status: 400 + "Bad Request",
                    body: {
                    }
                }
            })
        } else {
            operationContext.reply({
                resultSet: {
                    message: "Object saved",
                    status: 200,
                    body: {
                        name: req.paramSet.name,
                        value: req.paramSet.value
                    }
                }
            })
        }
    }, function () {
        this.logger.info("Timeout occurred");
    }, function (error) {
        this.logger.info("Error occurred. Error message: " + err.errorMessage);
    });
};

Service.prototype.deleteDataFromAttributes = function (req, operationContext) {
    const message = {
        serviceType: 'avid.acs.attributes',
        serviceRealm: 'global',
        serviceVersion: '3',
        op: 'delete',
        paramSet: {
            names: req.paramSet.names,
        }
    };

    const options = {
        timeout: 2000
    };

    this.bus.advancedQuery(message, options, function (reply) {
        if (reply.errorSet) {
            operationContext.reply({
                resultSet: {
                    // type your return fields here
                    message: "Searched object does not exist",
                    status: 404,
                    body: {
                    }
                }
            })
        }
        else {
            operationContext.reply({
                resultSet: {
                    message: "Objects removed",
                    status: 200,
                    body: {
                        names: req.paramSet.names,
                        value: req.paramSet.value
                    }
                }
            })
        }
    }, function () {
        this.logger.info("Timeout occurred");
    }, function (error) {
        this.logger.info("Error occurred. Error message: " + err.errorMessage);
    });
};

Service.prototype.updateDataInAttributes = function (req, operationContext) {
    self = this;
    const message = {
        serviceType: 'avid.acs.attributes',
        serviceRealm: 'global',
        serviceVersion: '3',
        op: 'fetch',
        paramSet: {
            name: req.paramSet.name
        }
    };

    const options = {
        timeout: 2000
    };

    this.bus.advancedQuery(message, options, function (reply) {
        if (reply.errorSet) {
            operationContext.reply({
                resultSet: {
                    // type your return fields here
                    message: "Searched object does not exist",
                    status: 404,
                    body: {
                    }
                }
            })
        } else {
            self.postDataToAttributes(req, operationContext);
            operationContext.reply({
                resultSet: {
                    message: "Object is updated",
                    status: 200,
                    body: {
                        name: reply.resultSet.name,
                        value: req.paramSet.value
                    }
                }
            })
        }
    }, function () {
        this.logger.info("Timeout occurred");
    }, function (error) {
        this.logger.info("Error occurred. Error message: " + err.errorMessage);
    });
};
