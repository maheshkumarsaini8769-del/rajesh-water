import {
  FaBagShopping,
  FaBottleDroplet,
  FaBottleWater,
  FaCartShopping,
  FaCircleCheck,
  FaClock,
  FaDroplet,
  FaGlassWater,
  FaHandHoldingHeart,
  FaHandshake,
  FaHeart,
  FaHouse,
  FaLeaf,
  FaLocationDot,
  FaMotorcycle,
  FaPhone,
  FaShop,
  FaStar,
  FaTruck,
  FaTruckFast,
  FaTruckRampBox,
  FaUtensils,
  FaWineBottle,
  FaWhatsapp,
} from 'react-icons/fa6'

/** Curated, safe icon list for admin-controlled icons (logo & contact cards). */
export const ICON_OPTIONS = [
  { key: 'FaBottleWater', label: 'Bottle', Icon: FaBottleWater },
  { key: 'FaBottleDroplet', label: 'Bottle Drop', Icon: FaBottleDroplet },
  { key: 'FaGlassWater', label: 'Glass', Icon: FaGlassWater },
  { key: 'FaWineBottle', label: 'Wine Bottle', Icon: FaWineBottle },
  { key: 'FaTruckFast', label: 'Fast Truck', Icon: FaTruckFast },
  { key: 'FaTruck', label: 'Truck', Icon: FaTruck },
  { key: 'FaTruckRampBox', label: 'Delivery Box', Icon: FaTruckRampBox },
  { key: 'FaMotorcycle', label: 'Motorcycle', Icon: FaMotorcycle },
  { key: 'FaLocationDot', label: 'Location', Icon: FaLocationDot },
  { key: 'FaClock', label: 'Clock', Icon: FaClock },
  { key: 'FaCartShopping', label: 'Cart', Icon: FaCartShopping },
  { key: 'FaBagShopping', label: 'Bag', Icon: FaBagShopping },
  { key: 'FaWhatsapp', label: 'WhatsApp', Icon: FaWhatsapp },
  { key: 'FaPhone', label: 'Phone', Icon: FaPhone },
  { key: 'FaDroplet', label: 'Drop', Icon: FaDroplet },
  { key: 'FaHouse', label: 'House', Icon: FaHouse },
  { key: 'FaBuilding', label: 'Building', Icon: FaHouse },
  { key: 'FaShop', label: 'Shop', Icon: FaShop },
  { key: 'FaHandHoldingHeart', label: 'Heart Hand', Icon: FaHandHoldingHeart },
  { key: 'FaHandshake', label: 'Handshake', Icon: FaHandshake },
  { key: 'FaHeart', label: 'Heart', Icon: FaHeart },
  { key: 'FaStar', label: 'Star', Icon: FaStar },
  { key: 'FaLeaf', label: 'Leaf', Icon: FaLeaf },
  { key: 'FaUtensils', label: 'Utensils', Icon: FaUtensils },
]

const byKey = Object.fromEntries(ICON_OPTIONS.map((o) => [o.key, o]))

export function getIcon(key) {
  return byKey[key]?.Icon ?? FaBottleWater
}