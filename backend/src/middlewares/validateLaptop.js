export const validateLaptopCreate = (req, res, next) => {
  const { name, brand, price, originalPrice, image, specs, stock } = req.body;

  // Required fields check
  if (!name || !brand || !price || !originalPrice || !image) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, brand, price, originalPrice, image"
    });
  }

  // Validate specs
  if (!specs || !specs.processor || !specs.ram || !specs.storage || 
      !specs.graphics || !specs.display) {
    return res.status(400).json({
      success: false,
      message: "Missing required specs: processor, ram, storage, graphics, display"
    });
  }

  // Validate prices
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a positive number"
    });
  }

  if (typeof originalPrice !== 'number' || originalPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: "Original price must be a positive number"
    });
  }

  // Validate stock
  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative number"
    });
  }

  // Validate rating if provided
  if (req.body.rating !== undefined) {
    if (typeof req.body.rating !== 'number' || req.body.rating < 0 || req.body.rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5"
      });
    }
  }

  next();
};

export const validateLaptopUpdate = (req, res, next) => {
  const { price, originalPrice, stock, rating } = req.body;

  // If prices are being updated, validate them
  if (price !== undefined) {
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number"
      });
    }
  }

  if (originalPrice !== undefined) {
    if (typeof originalPrice !== 'number' || originalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Original price must be a positive number"
      });
    }
  }

  // Validate price relationship if both are provided
  if (price !== undefined && originalPrice !== undefined && price > originalPrice) {
    return res.status(400).json({
      success: false,
      message: "Price cannot be greater than original price"
    });
  }

  // Validate stock
  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative number"
    });
  }

  // Validate rating
  if (rating !== undefined) {
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5"
      });
    }
  }

  next();
};

export const validateLaptopId = (req, res, next) => {
  const { id } = req.params;
  
  // MongoDB ObjectId validation (24 hex characters)
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid laptop ID format"
    });
  }
  
  next();
};