/**
 * Utilities for geospatial operations
 */

// Calculate distance between two points using the Haversine formula
exports.getDistance = (lon1, lat1, lon2, lat2) => {
  // Convert degrees to radians
  const toRad = (value) => (value * Math.PI) / 180;
  
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
};

// Format coordinates as GeoJSON point
exports.formatGeoJsonPoint = (longitude, latitude) => {
  return {
    type: 'Point',
    coordinates: [parseFloat(longitude), parseFloat(latitude)]
  };
};

// Convert distance from km to miles
exports.kmToMiles = (km) => {
  return km * 0.621371;
};

// Convert distance from miles to km
exports.milesToKm = (miles) => {
  return miles * 1.60934;
};