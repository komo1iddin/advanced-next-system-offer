import { City, Province } from './location-service';

export interface LocationRow {
  id: string;
  type: 'province' | 'city';
  name: string;
  provinceName?: string;
  provinceId?: string;
  active: boolean;
}

/**
 * Process provinces and cities into a combined array for the table view
 */
export function processLocationsForTable(provinces: Province[], cities: City[]): LocationRow[] {
  const locationRows: LocationRow[] = [];
  
  // First add all provinces
  provinces.forEach(province => {
    locationRows.push({
      id: province._id,
      type: 'province',
      name: province.name,
      active: province.active
    });
    
    // Then add cities that belong to this province
    const provinceCities = cities.filter(city => city.provinceId?._id === province._id);
    provinceCities.forEach(city => {
      locationRows.push({
        id: city._id,
        type: 'city',
        name: city.name,
        provinceName: province.name,
        provinceId: province._id,
        active: city.active
      });
    });
  });
  
  return locationRows;
} 