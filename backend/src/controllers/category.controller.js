const { Category } = require("../models");
const factory = require("./handlerFactory");

const base = factory(Category, { searchable: false });

exports.getAll = base.getAll;
exports.getOne = base.getOne;
exports.create = base.createOne;
exports.update = base.updateOne;
exports.remove = base.deleteOne;
