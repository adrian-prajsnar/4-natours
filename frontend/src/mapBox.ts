import { ILocation } from '../../backend/src/models/tourModel'

export const displayMap = (locations: ILocation[]): void => {
  const mapElement = document.getElementById('map')
  if (!mapElement) return

  window.mapboxgl.accessToken =
    'pk.eyJ1IjoiYWRyaWFuLXByYWpzbmFyIiwiYSI6ImNtZG44Mnc2cjFtcWcyaXJ6azlmc2w0djgifQ.jH1yD4KTB7Dl1wcF1Uz7LA'

  const map = new window.mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/adrian-prajsnar/cmdn8huh6006b01qsbs449hld/draft',
    scrollZoom: false,
  })

  const bounds = new window.mapboxgl.LngLatBounds()

  locations.forEach(loc => {
    const el = document.createElement('div')
    el.className = 'marker'

    new window.mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map)

    new window.mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(
        `<p>Day ${loc.day?.toString() ?? '-'}: ${loc.description ?? '-'}</p>`
      )
      .addTo(map)

    bounds.extend(loc.coordinates)
  })

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  })
}
