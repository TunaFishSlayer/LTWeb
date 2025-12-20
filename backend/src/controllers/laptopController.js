import LaptopService from "../services/laptopService.js";
import logger from "../utils/logger.js";

// PUBLIC - GET /api/laptops
export const getAllLaptops = async (req, res) => {
  try {
    const { laptops, pagination } = await LaptopService.getAllLaptops(req.query);

    return res.status(200).json({
      success: true,
      data: laptops,
      pagination
    });
  } catch (error) {
    logger.error("Error in getAllLaptops: " + error.message);
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// PUBLIC - GET /api/laptops/:id
export const getLaptopById = async (req, res) => {
  try {
    const laptop = await LaptopService.getLaptopById(req.params.id);
    return res.status(200).json({ success: true, data: laptop });
  } catch (error) {
    logger.error("Error in getLaptopById: " + error.message);
    const statusCode = error.message === "Laptop not found" ? 404 : 500;
    return res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ADMIN - POST /api/laptops
export const createLaptop = async (req, res) => {
  try {
    const laptop = await LaptopService.createLaptop(req.body);
    logger.info(`Laptop created by admin ${req.user.userId}`);
    return res.status(201).json({ success: true, data: laptop });
  } catch (error) {
    logger.error("Error in createLaptop: " + error.message);
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ADMIN - PUT /api/laptops/:id
export const updateLaptop = async (req, res) => {
  try {
    const laptop = await LaptopService.updateLaptop(req.params.id, req.body);
    logger.info(`Laptop ${req.params.id} updated by admin ${req.user.userId}`);
    return res.status(200).json({ success: true, data: laptop });
  } catch (error) {
    logger.error("Error in updateLaptop: " + error.message);
    const statusCode = error.message === "Laptop not found" ? 404 : 400;
    return res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ADMIN - DELETE /api/laptops/:id
export const deleteLaptop = async (req, res) => {
  try {
    await LaptopService.deleteLaptop(req.params.id);
    logger.info(`Laptop ${req.params.id} deleted by admin ${req.user.userId}`);
    return res.status(200).json({ 
      success: true, 
      message: "Laptop deleted" 
    });
  } catch (error) {
    logger.error("Error in deleteLaptop: " + error.message);
    const statusCode = error.message === "Laptop not found" ? 404 : 500;
    return res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getFeaturedLaptops = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const laptops = await LaptopService.getFeaturedLaptops(parseInt(limit));
    
    return res.status(200).json({
      success: true,
      data: laptops
    });
  } catch (error) {
    logger.error("Error in getFeaturedLaptops: " + error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number"
      });
    }
    
    const laptop = await LaptopService.updateStock(id, stock);
    
    logger.info(`Stock updated for laptop ${id} by admin ${req.user.userId}`);
    
    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: laptop
    });
  } catch (error) {
    logger.error("Error in updateStock: " + error.message);
    const statusCode = error.message === "Laptop not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};