'use strict';

// Load modules

const Hoek      = require('hoek');
const Glob      = require('glob');
const Path      = require('path');
const Datastore = require('nedb');
let NeDB;

const cwd = process.cwd();

let internals = {};

internals.defaults = {
    autoload : true,
    models   : 'models/**.js'
};

module.exports = internals.K7NeDB = function K7NeDB(options) {
    options = Hoek.applyToDefaults(internals.defaults, options);

    this.settings = options;
    this.db       = {};
};

internals.K7NeDB.prototype.load = function load() {
    NeDB = new Datastore(this.settings);

    this.db = this.getModels();

    return this.db;
};

internals.K7NeDB.prototype.getModels = function () {
    let files = this.settings.models.reduce((arr, model) => {
        return arr.concat(Glob.sync(model, { nodir : true }));
    }, []);

    return files.reduce((db, model) => {
        let modelPath = Path.isAbsolute(model) ? model : Path.join(cwd, model);

        try {
            model               = require(modelPath);
            db[model.modelName] = model;
            return db;
        } catch (err) {
            console.log(err);
            console.warn(modelPath, 'is not a valid model');
        }
    }, {});
};

internals.K7NeDB.nedb = NeDB;

internals.K7NeDB.attributes = {
    pkg : require('../package.json')
};
