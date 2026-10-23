// ---- Datos editables del proyecto ----

// CAMBIA estos datos por los reales de tu equipo (se muestran en el pie de página)
export const CONTACT = {
  email: 'ecocanjehuancayo@gmail.com',
  whatsapp: '51953316562', // formato internacional, sin + ni espacios
  whatsappLabel: '953 316 562',
  place: 'Mercado Modelo de Huancayo, Junín',
}

export const ROLES = {
  comerciante: {
    label: 'Comerciante del mercado',
    short: 'Comerciante',
    hint: 'Tengo un puesto dentro del Mercado Modelo.',
    stallLabel: 'Rubro y número de puesto (ej. Frutas, puesto 24)',
  },
  vendedor: {
    label: 'Vendedor ambulante',
    short: 'Vendedor ambulante',
    hint: 'Vendo en los alrededores del mercado.',
    stallLabel: '¿Qué vendes? (ej. Jugos, comida)',
  },
  comprador: {
    label: 'Comprador frecuente',
    short: 'Comprador',
    hint: 'Compro en el mercado y quiero sumar puntos con mi familia.',
    stallLabel: null,
  },
  admin: { label: 'Operador EcoCanje', short: 'Operador', hint: '', stallLabel: null },
}

export const STEPS = [
  ['Separa', 'Aparta tus residuos aprovechables mientras trabajas: orgánicos por un lado, reciclables por otro.'],
  ['Entrega', 'Llévalos al punto EcoCanje con tu código de socio.'],
  ['Acumula', 'Se pesan y se te asignan EcoPuntos según el tipo y la cantidad.'],
  ['Canjea', 'Cambia tus puntos por productos de limpieza y de uso diario.'],
  ['Valoriza', 'Tus residuos entran a cadenas de aprovechamiento: reciclaje y compost.'],
]

export const GUIDE = [
  {
    title: 'Residuos orgánicos',
    yes: ['Cáscaras y restos de frutas', 'Hojas y restos de verduras', 'Frutas y verduras que ya no se pueden vender'],
    no: ['Carne, huesos y comida cocida', 'Aceites y grasas', 'Bolsas plásticas mezcladas con los restos'],
  },
  {
    title: 'Cartón',
    yes: ['Cajas limpias y secas', 'Aplastadas y atadas para ocupar menos espacio'],
    no: ['Cartón mojado o con grasa', 'Cartón con restos de comida'],
  },
  {
    title: 'Botellas PET',
    yes: ['Botellas de bebidas vacías', 'Enjuagadas y aplastadas'],
    no: ['Envases con líquido o restos adentro'],
  },
  {
    title: 'Latas',
    yes: ['Latas de bebidas y de conservas, vacías', 'Enjuagadas'],
    no: ['Latas de aerosol', 'Latas muy oxidadas'],
  },
  {
    title: 'Plásticos valorizables',
    yes: ['Bolsas y envases limpios y secos', 'Baldes y bidones plásticos'],
    no: ['Plásticos con grasa o restos', 'Tecnopor'],
  },
]

export const TIPS = [
  'Pon dos recipientes en tu puesto: uno para orgánicos y otro para reciclables.',
  'Separa en el momento. Es más rápido que ordenar todo al final del día.',
  'Aplasta cajas y botellas: ocupan menos espacio y se pesan igual.',
  'Si tienes dudas, llévalo igual: en el punto EcoCanje te dicen si se acepta.',
]

// Horarios referenciales del piloto: ajústalos a lo que defina tu equipo
export const SCHEDULE = [
  {
    title: 'Recepción de residuos en el punto EcoCanje',
    days: 'Lunes a sábado',
    hours: '6:30 a. m. a 9:00 a. m. y 3:00 p. m. a 5:00 p. m.',
    note: 'Lleva tus residuos ya separados y tu código de socio.',
  },
  {
    title: 'Entrega de premios',
    days: 'Viernes',
    hours: '4:00 p. m. a 6:00 p. m.',
    note: 'Muestra tu código de socio para recoger tu canje.',
  },
  {
    title: 'Recojo de materiales por recicladores aliados',
    days: 'Martes, jueves y sábado',
    hours: '11:00 a. m.',
    note: 'Los materiales acumulados salen hacia las cadenas de reciclaje.',
  },
]

export const KG_PER_TREE_CO2 = 21 // kg de CO2 que absorbe un árbol al año (referencial)

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })

export const num = (n, d = 1) =>
  Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits: d })
