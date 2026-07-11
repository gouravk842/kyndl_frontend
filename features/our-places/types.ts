/**
 * The persisted Our Places document — what the customization panel edits and the
 * backend stores in `Creation.content` (validated by
 * `experiences/types/our_places.py`). Distinct from `config.ts`, which holds the
 * static *sample* map shown on the public experience.
 *
 * A place's photo is a media reference (`{ fileId }`) pointing at an uploaded
 * `files.StoredFile`; the backend resolves it to a presigned URL in the
 * creation's `assets` map on read.
 */
import type { PlaceCategory, PlaceMood } from "./config";

export type TileStyleKey = "positron" | "voyager";

export interface MediaRef {
  fileId: string;
}

export interface PlaceDoc {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string;
  category: PlaceCategory;
  mood: PlaceMood;
  title: string;
  memory: string;
  photo?: MediaRef;
}

export interface OurPlacesMapConfig {
  title: string;
  subtitle: string;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  tileStyle: TileStyleKey;
}

export interface OurPlacesDoc {
  map: OurPlacesMapConfig;
  places: PlaceDoc[];
}
