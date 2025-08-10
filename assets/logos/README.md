# Voertuig Logo's

Deze directory bevat alle logo's voor voertuigmerken en modellen.

## Hoe logo's toevoegen:

1. **Plaats je logo bestand** in deze directory (bijv. `bmw-3-serie.png`)
2. **Voeg het toe aan de code** in `src/screens/SettingsScreen.js`:

```javascript
const vehicleLogos = {
  'BMW 3 Serie': require('../assets/logos/bmw-3-serie.png'),
  'Mercedes C-Klasse': require('../assets/logos/mercedes-c-klasse.png'),
  // Voeg hier meer logo's toe...
};
```

## Bestandsformaten:
- **PNG** (aanbevolen voor logo's met transparantie)
- **JPG/JPEG** (voor foto's)
- **SVG** (niet ondersteund in React Native, gebruik PNG)

## Aanbevolen afmetingen:
- **40x40 pixels** (zoals gebruikt in de app)
- **80x80 pixels** (voor retina displays)
- **120x120 pixels** (voor toekomstige uitbreidingen)

## Naamgeving:
Gebruik duidelijke, consistente namen:
- `bmw-3-serie.png`
- `mercedes-c-klasse.png`
- `audi-a4.png`
- `volkswagen-golf.png`

## Belangrijk:
- De handelsbenaming in de code moet **exact** overeenkomen met de handelsbenaming van het voertuig
- Logo's worden automatisch getoond wanneer een voertuig wordt toegevoegd met een overeenkomende handelsbenaming
