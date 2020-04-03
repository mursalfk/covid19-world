import React from "react";
import Helmet from "react-helmet";

import { promiseToFlyTo, geoJsonToMarkers, clearMapLayers } from "lib/map";
import { trackerLocationsToGeoJson } from "lib/coronavirus";
import { useCoronavirusTracker } from "hooks";

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";

const LOCATION = {
  lat: 0,
  lng: 0
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;

const IndexPage = () => {
  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {
    if (!map || locations.length === 0) return;

    clearMapLayers({
      map,
      excludeByName: ["Mapbox"]
    });

    const locationsGeoJson = trackerLocationsToGeoJson(locations);

    const locationsGeoJsonLayers = geoJsonToMarkers(locationsGeoJson, {
      featureToHtml: ({ properties = {} } = {}) => {
        const {
          country,
          latest = {},
          country_population: population,
          last_updated
        } = properties;
        const { confirmed, deaths, recovered } = latest;
        const rate = confirmed / population;

        let confirmedString = `${confirmed}`;

        if (confirmed > 1000) {
          confirmedString = `${confirmedString.slice(0, -3)}k+`;
        }

        return `
          <span class="icon-marker">
            <span class="icon-marker-tooltip">
              <h2>${country}</h2>
              <ul>
                <li><strong>Confirmed:</strong> ${confirmed}</li>
                <li><strong>Deaths:</strong> ${deaths}</li>
                <li><strong>Recovered:</strong> ${recovered}</li>
                <li><strong>Population:</strong> ${population}</li>
                <li><strong>Last Update:</strong> ${last_updated}</li>
              </ul>
            </span>
            ${confirmedString}
          </span>
        `;
      }
    });

    const bounds = locationsGeoJsonLayers.getBounds();

    locationsGeoJsonLayers.addTo(map);

    map.fitBounds(bounds);
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: "Mapbox",
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings} />

      <Container type="content" className="text-center home-start"></Container>
    </Layout>
  );
};

export default IndexPage;
