export const applyFilters = (flats, filters, searchQuery) => {
    let result = [...flats];
  
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(flat => 
        flat.name.toLowerCase().includes(query) ||
        flat.city.toLowerCase().includes(query) ||
        flat.streetName.toLowerCase().includes(query)
      );
    }
  
    if (filters.city) {
      result = result.filter(flat => 
        flat.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
  
    if (filters.minPrice) {
      result = result.filter(flat => 
        flat.rentPrice >= Number(filters.minPrice)
      );
    }
  
    if (filters.maxPrice) {
      result = result.filter(flat => 
        flat.rentPrice <= Number(filters.maxPrice)
      );
    }
  
    if (filters.minArea) {
      result = result.filter(flat => 
        flat.areaSize >= Number(filters.minArea)
      );
    }
  
    if (filters.maxArea) {
      result = result.filter(flat => 
        flat.areaSize <= Number(filters.maxArea)
      );
    }
  
    return result;
  };
  
  export const sortFlats = (flats, key, direction) => {
    return [...flats].sort((a, b) => {
      if (key === 'city') {
        return direction === 'asc' 
          ? a.city.localeCompare(b.city)
          : b.city.localeCompare(a.city);
      }
      return direction === 'asc' 
        ? a[key] - b[key]
        : b[key] - a[key];
    });
  };