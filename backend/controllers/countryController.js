const Country = require('../models/Country');

// Get all countries
exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get country by ID
exports.getCountryById = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new country
exports.createCountry = async (req, res) => {
  try {
    const newCountry = new Country(req.body);
    const savedCountry = await newCountry.save();
    res.status(201).json(savedCountry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update country
exports.updateCountry = async (req, res) => {
  try {
    const updatedCountry = await Country.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCountry) {
      return res.status(404).json({ message: 'Country not found' });
    }
    res.status(200).json(updatedCountry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete country
exports.deleteCountry = async (req, res) => {
  try {
    const deletedCountry = await Country.findByIdAndDelete(req.params.id);
    if (!deletedCountry) {
      return res.status(404).json({ message: 'Country not found' });
    }
    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};