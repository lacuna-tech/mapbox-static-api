export module '@lacuna/mapbox-static-url' {

  // array of array of array of numbers,... lng, lat
  // declare type CoordinatesArray = Array<Array<Array<number>>>

  // declare class GeoHashCompress {
  //   constructor(compressedHashes: string[], maxPrecision: number = 7, minPrecision: number = 1);
  //   contains(long: number, lat: number): boolean;
  //   containsHash(hash: string): boolean;
  //   set: Set<string>;
  //   maxPrecision: number;
  //   minPrecision: number;
  //   toGeoJson(): any;
  // }

  declare type DrawableGeography = {
    color: string;
    geography_id: string;
    geography_json: any;
  }

  declare type GetStaticUrlOptions = {
    mapboxToken: string;
    decimalPrecision: number;
    minimumDistance?: number;
    maximumPoints?: number;
  }

  declare const getStaticUrl = (geographies: Array<DrawableGeography>, options: GetStaticUrlOptions) => Array<string>
}