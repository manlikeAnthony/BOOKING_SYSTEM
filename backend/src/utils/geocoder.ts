import NodeGeocoder, { Options } from "node-geocoder";

export interface GeocodedResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

const getGeocoder = () => {
  const options: Options = {
    provider: "mapquest",
    apiKey: process.env.MAPQUEST_API_KEY!,
    formatter: null,
  };

  if (!process.env.MAPQUEST_API_KEY) {
    throw new Error("MAPQUEST_API_KEY is missing");
  }

  return NodeGeocoder(options);
};

export const geocodeAddress = async (
  address: string,
): Promise<GeocodedResult> => {
  try {
    const geocoder = getGeocoder();

    console.log("Geocoding address:", address);

    const res = await geocoder.geocode(address);

    console.dir(res, { depth: null });

    if (!res || res.length === 0) {
      throw new Error("Unable to geocode address");
    }

    const geo = res[0];

    if (!geo.latitude || !geo.longitude) {
      throw new Error("Geocoder returned invalid coordinates");
    }

    return {
      lat: geo.latitude,
      lng: geo.longitude,
      formattedAddress: geo.formattedAddress || address,
    };
  } catch (error) {
    console.error("Geocoding failed:", error);

    throw error;
  }
};