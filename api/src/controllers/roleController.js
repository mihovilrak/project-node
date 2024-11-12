const roleModel = require('../models/roleModel');

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await roleModel.getRoles(req.pool);
    res.json(roles);
  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({ error: 'Failed to get roles' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const roleId = await roleModel.createRole(req.pool, req.body);
    res.status(201).json({ id: roleId });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    await roleModel.updateRole(req.pool, req.params.id, req.body);
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};