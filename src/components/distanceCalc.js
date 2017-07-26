const deg2rad = (deg) => deg * (Math.PI / 180)

const distanceCalc = (lat1, lon1, lat2, lon2) => {
  const latitude = Number(lat1);
  const longitude = Number(lon1);
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - latitude);  // deg2rad below
  const dLon = deg2rad(lon2 - longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export default distanceCalc