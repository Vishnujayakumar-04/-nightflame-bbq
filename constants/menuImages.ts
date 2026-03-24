// Local menu item image mapping
// Maps item names (lowercase, normalized) to local require() images

const imageMap: Record<string, any> = {
    // Single Items (BBQ / Wings)
    'chicken lollipop': require('../assets/Menu/single/chicken_lollipop.png'),
    'chicken tikka': require('../assets/Menu/single/chicken_tikka.png'),
    'chicken wings': require('../assets/Menu/single/chicken_wings.png'),
    'grilled drumstick': require('../assets/Menu/single/grilled_drumstick.png'),
    'grilled thigh': require('../assets/Menu/single/grilled_thigh.png'),

    // Combo Items
    'family combo': require('../assets/Menu/combo/family_combo.png'),
    'grill duo combo': require('../assets/Menu/combo/grill_duo_combo.png'),
    'grill mix combo': require('../assets/Menu/combo/grill_mix_combo.png'),
    'mega grill combo': require('../assets/Menu/combo/mega_grill_combo.png'),
    'mini party combo': require('../assets/Menu/combo/mini_party_combo.png'),
    'wings lollipop combo': require('../assets/Menu/combo/wings_lollipop_combo.png'),

    // Alternate name variations (common ways the owner might name them)
    'wings & lollipop combo': require('../assets/Menu/combo/wings_lollipop_combo.png'),
    'grill duo': require('../assets/Menu/combo/grill_duo_combo.png'),
    'grill mix': require('../assets/Menu/combo/grill_mix_combo.png'),
    'mega grill': require('../assets/Menu/combo/mega_grill_combo.png'),
    'mini party': require('../assets/Menu/combo/mini_party_combo.png'),
    'family pack': require('../assets/Menu/combo/family_combo.png'),
    'drumstick': require('../assets/Menu/single/grilled_drumstick.png'),
    'lollipop': require('../assets/Menu/single/chicken_lollipop.png'),
    'bbq wings 6 pec': require('../assets/Menu/single/chicken_wings.png'),
    'bbq wings 6 pcs': require('../assets/Menu/single/chicken_wings.png'),
    'bbq wings': require('../assets/Menu/single/chicken_wings.png'),
    'wings 6 pec': require('../assets/Menu/single/chicken_wings.png'),
    'wings 6 pcs': require('../assets/Menu/single/chicken_wings.png'),
};

/**
 * Get the local image for a menu item by name.
 * Returns the require() image source or null if no match.
 */
export function getMenuItemImage(itemName: string): any | null {
    const normalized = itemName.toLowerCase().trim();

    // Direct match
    if (imageMap[normalized]) return imageMap[normalized];

    // Partial match: check if any key is contained in the item name
    for (const key of Object.keys(imageMap)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return imageMap[key];
        }
    }

    return null;
}
