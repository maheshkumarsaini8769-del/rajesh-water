import { getBottleImages } from '../utils/imageConfig'

export const products = [
  {
    id: 'bottle-200ml',
    label: '200 ML',
    shortLabel: '200 ML',
    price: 1,
    boxSize: 78,
    minBoxes: 4,
    unit: 'per bottle',
    images: getBottleImages('bottle200', 0),
  },
  {
    id: 'bottle-500ml',
    label: '500 ML',
    shortLabel: '500 ML',
    price: 25,
    unit: 'per bottle',
    images: getBottleImages('bottle500', 1),
  },
  {
    id: 'bottle-1l',
    label: '1 LITRE',
    shortLabel: '1 LITRE',
    price: 45,
    unit: 'per bottle',
    images: getBottleImages('bottle1l', 2),
  },
  {
    id: 'bottle-2l',
    label: '2 LITRE',
    shortLabel: '2 LITRE',
    price: 80,
    unit: 'per bottle',
    images: getBottleImages('bottle2l', 3),
  },
]

export const getProduct = (id) => products.find((p) => p.id === id)