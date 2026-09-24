// Datos de ejemplo — sustituibles por una API real
const TORNEO = {
  nombre: "Torneo Internacional de Ajedrez 2026",
  formato: "Blitz 5+3",
  rondasTotales: 9,
  rondaActual: 5,
  inicioRonda: "2026-09-23T18:00:00",
  calendario: {
    anio: 2026,
    mes: 8, // septiembre (0-indexado)
    diasEvento: [19, 20, 21, 22, 23, 24, 25],
    hoy: 23
  },
  jornadas: [
    { ronda: 1, fecha: "19 sep", hora: "17:00", estado: "jugada" },
    { ronda: 2, fecha: "20 sep", hora: "17:00", estado: "jugada" },
    { ronda: 3, fecha: "21 sep", hora: "17:00", estado: "jugada" },
    { ronda: 4, fecha: "22 sep", hora: "17:00", estado: "jugada" },
    { ronda: 5, fecha: "23 sep", hora: "18:00", estado: "en juego" },
    { ronda: 6, fecha: "24 sep", hora: "17:00", estado: "pendiente" },
    { ronda: 7, fecha: "25 sep", hora: "17:00", estado: "pendiente" },
    { ronda: 8, fecha: "26 sep", hora: "17:00", estado: "pendiente" },
    { ronda: 9, fecha: "27 sep", hora: "16:00", estado: "pendiente" }
  ],
  mesas: [
    {
      mesa: 1,
      blancas: { nombre: "A. Carlsen", elo: 2845, club: "Norway CC" },
      negras: { nombre: "D. Nakamura", elo: 2802, club: "USA Chess" },
      resultado: null
    },
    {
      mesa: 2,
      blancas: { nombre: "F. Caruana", elo: 2793, club: "Italy" },
      negras: { nombre: "A. Firouzja", elo: 2777, club: "France" },
      resultado: "½–½"
    },
    {
      mesa: 3,
      blancas: { nombre: "V. Anand", elo: 2750, club: "India" },
      negras: { nombre: "I. Gukesh", elo: 2746, club: "India" },
      resultado: "1–0"
    },
    {
      mesa: 4,
      blancas: { nombre: "L. Aronian", elo: 2742, club: "USA" },
      negras: { nombre: "W. So", elo: 2739, club: "USA" },
      resultado: null
    },
    {
      mesa: 5,
      blancas: { nombre: "R. Rapport", elo: 2715, club: "Hungary" },
      negras: { nombre: "Y. Predke", elo: 2680, club: "Kazakhstan" },
      resultado: null
    },
    {
      mesa: 6,
      blancas: { nombre: "M. Vachier-Lagrave", elo: 2721, club: "France" },
      negras: { nombre: "P. Keymer", elo: 2700, club: "Germany" },
      resultado: "0–1"
    }
  ],
  torneos: [
    { nombre: "Open Internacional Madrid", fecha: "may 2026", estado: "finalizado" },
    { nombre: "Memorial Capablanca", fecha: "jul 2026", estado: "finalizado" },
    { nombre: "Torneo Internacional 2026", fecha: "sep 2026", estado: "en curso" },
    { nombre: "Copa de Invierno", fecha: "dic 2026", estado: "inscripciones" }
  ]
};
