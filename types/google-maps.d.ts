// Minimal Google Maps type declarations to avoid TypeScript errors
// Full types: npm install @types/google.maps

declare namespace google {
  namespace maps {
    function importLibrary(name: string): Promise<any>
    class Map {
      constructor(element: HTMLElement, options: object)
    }
    interface MapsLibrary { Map: typeof google.maps.Map }
    interface MarkerLibrary { AdvancedMarkerElement: any }
    namespace marker {
      class AdvancedMarkerElement {
        constructor(options: object)
        map: google.maps.Map | null
      }
    }
  }
}
