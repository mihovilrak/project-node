const roleModel = require('../models/roleModel');

exports.getRoles = async (req, res, pool) => {
  try {
    const result = await roleModel.roles(pool);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
        error: 'Internal server error'
    });
  }
};