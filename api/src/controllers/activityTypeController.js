const activityTypeModel = require('../models/activityTypeModel');

exports.getActivityTypes = async (req, res, pool) => {
  try {
    const activityTypes = await activityTypeModel.getActivityTypes(pool);
    res.status(200).json(activityTypes);
  } catch (error) {
    console.error('Error fetching activity types:', error);
    res.status(500).json({ error: 'Failed to fetch activity types' });
  }
};

exports.createActivityType = async (req, res, pool) => {
  try {
    const { name, description, color, icon } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const activityType = await activityTypeModel.createActivityType(
      pool,
      name,
      description,
      color,
      icon,
      userId
    );
    res.status(201).json(activityType);
  } catch (error) {
    console.error('Error creating activity type:', error);
    res.status(500).json({ error: 'Failed to create activity type' });
  }
};

exports.updateActivityType = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon } = req.body;
    
    const activityType = await activityTypeModel.updateActivityType(
      pool,
      id,
      name,
      description,
      color,
      icon
    );

    if (!activityType) {
      return res.status(404).json({ error: 'Activity type not found' });
    }

    res.status(200).json(activityType);
  } catch (error) {
    console.error('Error updating activity type:', error);
    res.status(500).json({ error: 'Failed to update activity type' });
  }
};

exports.deleteActivityType = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const result = await activityTypeModel.deleteActivityType(pool, id);
    
    if (!result) {
      return res.status(404).json({ error: 'Activity type not found' });
    }
    
    res.status(200).json({ message: 'Activity type deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity type:', error);
    res.status(500).json({ error: 'Failed to delete activity type' });
  }
}; 