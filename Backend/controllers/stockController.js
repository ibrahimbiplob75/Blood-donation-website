const BloodStock = require('../models/BloodStock');
const Transaction = require('../models/Transaction');

// @desc    Get all blood stock
// @route   GET /api/stock
// @access  Private
exports.getAllStock = async (req, res) => {
  try {
    const stock = await BloodStock.find();
    
    // Format the response as an object with blood groups as keys
    const stockData = {};
    stock.forEach(item => {
      stockData[item.bloodGroup] = item.units;
    });

    res.status(200).json({
      success: true,
      stock: stockData,
      data: stock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock by blood group
// @route   GET /api/stock/:bloodGroup
// @access  Private
exports.getStockByBloodGroup = async (req, res) => {
  try {
    const stock = await BloodStock.findOne({ bloodGroup: req.params.bloodGroup });
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found for this blood group' });
    }

    res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update blood stock
// @route   PUT /api/stock/:bloodGroup
// @access  Private/Admin
exports.updateStock = async (req, res) => {
  try {
    const { units, action } = req.body; // action: 'add' or 'remove'
    
    let stock = await BloodStock.findOne({ bloodGroup: req.params.bloodGroup });
    
    if (!stock) {
      // Create new stock entry if doesn't exist
      stock = await BloodStock.create({
        bloodGroup: req.params.bloodGroup,
        units: action === 'add' ? units : 0,
      });
    } else {
      if (action === 'add') {
        stock.units += units;
      } else if (action === 'remove') {
        if (stock.units < units) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        stock.units -= units;
      }
      await stock.save();
    }

    res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check low stock
// @route   GET /api/stock/low
// @access  Private/Admin
exports.getLowStock = async (req, res) => {
  try {
    const allStock = await BloodStock.find();
    const lowStock = allStock.filter(item => item.isLowStock());

    res.status(200).json({
      success: true,
      count: lowStock.length,
      data: lowStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
