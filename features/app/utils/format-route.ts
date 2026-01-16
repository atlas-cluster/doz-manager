export function formatRoute(route: string) {
  switch (route) {
    default:
      return 'Dashboard'
    case '/lecturers':
      return 'Dozenten'
    case '/courses':
      return 'Vorlesungen'
  }
}
