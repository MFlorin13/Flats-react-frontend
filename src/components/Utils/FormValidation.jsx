export const validateFlat = (flat) => {
    const errors = {};
    
    if (!flat.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!flat.city?.trim()) {
      errors.city = 'City is required';
    }
    
    if (!flat.streetName?.trim()) {
      errors.streetName = 'Street name is required';
    }
    
    if (!flat.streetNumber) {
      errors.streetNumber = 'Street number is required';
    }
    
    if (!flat.areaSize || flat.areaSize <= 0) {
      errors.areaSize = 'Area size must be greater than 0';
    }
    
    if (!flat.rentPrice || flat.rentPrice <= 0) {
      errors.rentPrice = 'Rent price must be greater than 0';
    }
    
    if (!flat.yearBuilt || flat.yearBuilt < 1800 || flat.yearBuilt > new Date().getFullYear()) {
      errors.yearBuilt = 'Please enter a valid year';
    }
    
    return errors;
  };
  