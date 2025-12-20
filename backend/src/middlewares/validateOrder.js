export const validateOrderCreate = (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Items array is required and cannot be empty"
    });
  }

  for (const item of items) {
    // Validate laptopId format (MongoDB ObjectId)
    if (!item.laptopId || !/^[0-9a-fA-F]{24}$/.test(item.laptopId)) {
      return res.status(400).json({
        success: false,
        message: "Each item must have a valid laptopId"
      });
    }

    // Validate quantity
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Each item must have a quantity greater than 0"
      });
    }

    // Validate quantity is an integer
    if (!Number.isInteger(item.quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number"
      });
    }
  }

  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required"
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
    });
  }

  next();
};

export const validateOrderId = (req, res, next) => {
  const { id } = req.params;

  // MongoDB ObjectId validation (24 hex characters)
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID format"
    });
  }

  next();
};