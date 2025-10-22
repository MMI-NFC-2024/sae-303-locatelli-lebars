import define1 from "./f3d342db2d382751@886.js";

function _1(md){return(
md`# SAE 303 (Groupe 9)`
)}

function _defi(Inputs){return(
Inputs.select(
  [null, "Santé et Territoire", "Tourisme en train", "Offre culturelle"],
  { label: "Défi" }
)
)}

function _3(htl){return(
htl.html`La découverte de proximité (POI et lieux culturels autour des gares) 🗺️`
)}

function _4(md){return(
md`# Défi : Tourisme en train

# Axe de communication : Zoom Régional 🔎

La Nouvelle-Aquitaine, une destination de proximité
Notre objectif : Après avoir constaté la richesse de l'offre culturelle sur l'ensemble du territoire, nous avons décidé de focaliser notre analyse sur la Nouvelle-Aquitaine.

Pourquoi ce choix ? C'est une région qui incarne la diversité du tourisme français (littoral, patrimoine historique, gastronomie, nature). Notre hypothèse est que le réseau de gares y offre un maillage suffisant pour explorer ces richesses sans voiture.

Notre histoire devient : "Découvrez les trésors cachés de la Nouvelle-Aquitaine, accessibles en quelques minutes de marche depuis la gare."`
)}

function _codes_na(){return(
[
  "16",
  "17",
  "19",
  "23",
  "24",
  "33",
  "40",
  "47",
  "64",
  "79",
  "86",
  "87"
]
)}

async function _gares_na(FileAttachment,codes_na)
{
  // 1. Fonction d'aide locale pour extraire le code département
  function getDeptCode(code_commune_num) {
    // .padStart(5, '0') gère les codes < 10000 (ex: 1001 -> "01001")
    return String(code_commune_num).padStart(5, "0").substring(0, 2);
  }

  // 2. Chargement du fichier CSV (il doit être uploadé)
  const gares = await FileAttachment("gares_nettoyees.csv").csv({
    typed: true
  });

  // 3. Filtrage et 'return' de la valeur pour la cellule 'gares_na'
  return gares.filter((d) => codes_na.includes(getDeptCode(d["Code commune"])));
}


function _7(gares_na){return(
gares_na.length
)}

async function _poi_na(FileAttachment)
{
  // 1. Chargement du fichier CSV (il doit être uploadé)
  const poi = await FileAttachment("basilic_nouvelle_aquitaine.csv").csv({
    typed: true
  });

  // 2. Filtrage "Musée" + "Monument" et 'return'
  return poi.filter(
    (d) => d.Sous_domaine === "Musée" || d.Sous_domaine === "Monument"
  );
}


function _9(poi_na){return(
poi_na.length
)}

async function _departements_na(codes_na)
{
  // 1. On charge le GeoJSON depuis internet
  const response = await fetch(
    "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson"
  );
  const departements_bruts = await response.json();

  // 2. On filtre les "features" (polygones)
  const filtered_features = departements_bruts.features.filter((d) =>
    codes_na.includes(d.properties.code)
  );

  // 3. On retourne un nouvel objet GeoJSON valide
  return {
    type: "FeatureCollection",
    features: filtered_features
  };
}


function _getDistance(){return(
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
)}

function _gares_enrichies_na(gares_na,poi_na,getDistance,rayon_km){return(
gares_na.map(gare => {
  let compteur = 0;
  let noms_poi_proches = []; // <-- ON AJOUTE UN TABLEAU VIDE
  
  // On compare chaque gare de NA avec chaque POI culturel de NA
  for (const poi of poi_na) {
    const distance = getDistance(
      gare.latitude, gare.longitude, 
      poi.Latitude, poi.Longitude
    );
    
    if (distance <= rayon_km) {
      compteur++;
      noms_poi_proches.push(poi.Nom); // <-- ON AJOUTE LE NOM À LA LISTE
    }
  }
  
  return {
    ...gare, // On garde les infos de la gare
    poi_proches: compteur, // On ajoute le compte
    liste_poi: noms_poi_proches // <-- ON AJOUTE LA LISTE DES NOMS
  };
})
)}

function _rayon_km(Inputs){return(
Inputs.range([0.5, 10], {
  step: 0.1,
  value: 1.0,
  label: "Rayon de marche (km)"
})
)}

function _formatTooltip(){return(
function formatTooltip(d) {
  // \n est un saut de ligne
  let tooltip = `${d.Nom}\nPOI à < 1km: ${d.poi_proches}`;

  if (d.poi_proches > 0) {
    tooltip += "\n---"; // Ajoute un séparateur

    // On ajoute les noms des POI (max 5 pour la lisibilité)
    tooltip += "\n" + d.liste_poi.slice(0, 5).join("\n");

    if (d.poi_proches > 5) {
      tooltip += "\n...et " + (d.poi_proches - 5) + " autres.";
    }
  }
  return tooltip;
}
)}

function _15(Plot,d3,departements_na,gares_enrichies_na,formatTooltip){return(
Plot.plot({
  projection: ({ width, height }) =>
    d3.geoConicConformal().fitSize([width, height], departements_na),

  r: {
    legend: true,
    label: "Nb. de POI à < 1km"
  },

  marks: [
    Plot.geo(departements_na, {
      fill: "#f0f0f0",
      stroke: "#999"
    }),
    Plot.dot(
      gares_enrichies_na.filter((d) => d.poi_proches > 0),
      {
        x: "longitude",
        y: "latitude",
        r: (d) => Math.sqrt(d.poi_proches),
        fill: "crimson",
        fillOpacity: 0.7,
        stroke: "black",
        strokeOpacity: 0.2,
        strokeWidth: 0.5,

        title: (d) => formatTooltip(d)
      }
    )
  ]
})
)}

function _top_20_gares_na(gares_enrichies_na,d3){return(
gares_enrichies_na
  .filter((d) => d.poi_proches > 0)
  .sort((a, b) => d3.descending(a.poi_proches, b.poi_proches))
  .slice(0, 20)
)}

function _17(Plot,d3,top_20_gares_na,formatTooltip){return(
Plot.plot({
  marginLeft: 150,
  y: {
    domain: d3.sort(top_20_gares_na, (d) => -d.poi_proches).map((d) => d.Nom),
    label: null
  },
  x: {
    label: "Nombre de Musées/Monuments à moins d'1 km",
    grid: true
  },

  marks: [
    Plot.barX(top_20_gares_na, {
      y: "Nom",
      x: "poi_proches",
      fill: "steelblue",

      title: (d) => formatTooltip(d)
    }),
    Plot.text(top_20_gares_na, {
      x: "poi_proches",
      y: "Nom",
      text: (d) => d.poi_proches,
      dx: -15,
      fill: "white"
    }),
    Plot.ruleX([0])
  ]
})
)}

function _18(md){return(
md`# suite
`
)}

async function _poi_datatourisme(FileAttachment){return(
(
  await FileAttachment("datatourisme.csv").csv({ typed: true })
).filter(
  (d) =>
    // On ne garde que les lignes qui ont des coordonnées ET un type
    d.Latitude && d.Longitude && d.Type && d["Sous-type"]
)
)}

function _20(__query,poi_datatourisme,invalidation){return(
__query(poi_datatourisme,{from:{table:"poi_datatourisme"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation,"poi_datatourisme")
)}

function _types_uniques(poi_datatourisme)
{
  const allTypes = new Set();
  for (const d of poi_datatourisme) {
    const types = d.Type.split(",");
    types.forEach((t) => allTypes.add(t.trim()));
  }
  return ["-- Tous les Types --", ...Array.from(allTypes).sort()];
}


function _sous_types_uniques(poi_datatourisme)
{
  const allSubTypes = new Set();
  for (const d of poi_datatourisme) {
    const subTypes = d["Sous-type"].split(",");
    subTypes.forEach((st) => allSubTypes.add(st.trim()));
  }
  return ["-- Tous les Sous-types --", ...Array.from(allSubTypes).sort()];
}


function _filtre_type(Inputs,types_uniques){return(
Inputs.select(types_uniques, {
  label: "Filtrer par Type :"
})
)}

function _filtre_sous_type(Inputs,sous_types_uniques){return(
Inputs.select(sous_types_uniques, {
  label: "Filtrer par Sous-type :"
})
)}

function _poi_filtres_na(poi_datatourisme,filtre_type,filtre_sous_type)
{
  return poi_datatourisme.filter((d) => {
    const type_choisi = filtre_type;
    const type_ok =
      type_choisi === "-- Tous les Types --" || d.Type.includes(type_choisi);

    const sous_type_choisi = filtre_sous_type;
    const sous_type_ok =
      sous_type_choisi === "-- Tous les Sous-types --" ||
      d["Sous-type"].includes(sous_type_choisi);

    return type_ok && sous_type_ok;
  });
}


function _26(Plot,d3,departements_na,poi_filtres_na){return(
Plot.plot({
  projection: ({ width, height }) =>
    d3.geoConicConformal().fitSize([width, height], departements_na),

  color: {
    legend: true,
    label: "Type de POI"
  },

  marks: [
    Plot.geo(departements_na, {
      fill: "#f0f0f0",
      stroke: "#999"
    }),

    Plot.dot(poi_filtres_na, {
      x: "Longitude",
      y: "Latitude",
      r: 2.5,
      fill: (d) => d.Type.split(",")[0],
      fillOpacity: 0.7,
      stroke: "black",
      strokeOpacity: 0.2,
      strokeWidth: 0.5,
      title: (d) => `${d.Nom}\nType: ${d.Type}\nSous-type: ${d["Sous-type"]}`
    })
  ]
})
)}

function _27(md){return(
md`# suite
`
)}

function _29(gares_na,departements_na,poi_datatourisme){return(
gares_na && departements_na && poi_datatourisme ? true : false
)}

function _gare_filtre(Inputs,gares_na){return(
Inputs.select(
  // On ajoute une option "Aucune" au début
  [
    { Nom: "-- Toutes les Gares --", latitude: null, longitude: null },
    ...gares_na
  ],
  { label: "Filtrer par proximité de la gare :", format: (d) => d.Nom }
)
)}

function _rayon_km_filtre(Inputs){return(
Inputs.range([0.5, 100], {
  label: "Dans un rayon de (km) :",
  step: 0.5,
  value: 2, // 2 km par défaut
  format: (d) => `${d} km`
})
)}

function _type_filtre(Inputs,types_uniques){return(
Inputs.select(types_uniques, {
  label: "Filtrer par Type de POI :"
})
)}

function _sous_type_filtre(Inputs,sous_types_uniques){return(
Inputs.select(sous_types_uniques, {
  label: "Filtrer par Sous-type de POI :"
})
)}

function _poi_filtres_combines(poi_datatourisme,gare_filtre,getDistance,rayon_km_filtre,type_filtre,sous_type_filtre)
{
  
  // On prend la liste complète
  let data_filtree = poi_datatourisme;
  
  // --- Filtre 1 : GARE + RAYON ---
  // Si une gare est sélectionnée (pas "Toutes les Gares")
  if (gare_filtre.longitude) {
    
    data_filtree = data_filtree.filter(poi => {
      // Calcul de la distance
      const distance = getDistance(
        gare_filtre.latitude, gare_filtre.longitude, 
        poi.Latitude, poi.Longitude
      );
      // On garde si la distance est dans le rayon
      return distance <= rayon_km_filtre;
    });
  }

  // --- Filtre 2 : TYPE ---
  // Si un type est choisi (pas "Tous les Types")
  if (type_filtre !== "-- Tous les Types --") {
    
    data_filtree = data_filtree.filter(poi => 
      poi.Type && poi.Type.includes(type_filtre)
    );
  }
  
  // --- Filtre 3 : SOUS-TYPE ---
  if (sous_type_filtre !== "-- Tous les Sous-types --") {
    
    data_filtree = data_filtree.filter(poi => 
      poi["Sous-type"] && poi["Sous-type"].includes(sous_type_filtre)
    );
  }
  
  // On retourne le résultat final
  return data_filtree;
}


function _35(Plot,d3,departements_na,poi_filtres_combines,gare_filtre){return(
Plot.plot({
  projection: ({ width, height }) =>
    d3.geoConicConformal().fitSize([width, height], departements_na),

  color: {
    legend: true,
    label: "Type de POI"
  },

  marks: [
    // Couche 1: Le fond de carte NA
    Plot.geo(departements_na, {
      fill: "#f0f0f0",
      stroke: "#999"
    }),

    // Couche 2: Les POI filtrés
    Plot.dot(poi_filtres_combines, {
      x: "Longitude",
      y: "Latitude",
      r: 2.5,
      // On colore par le premier type
      fill: (d) => d.Type.split(",")[0],
      fillOpacity: 0.7,
      stroke: "black",
      strokeOpacity: 0.2,
      strokeWidth: 0.5,
      title: (d) => `${d.Nom}\nType: ${d.Type}\nSous-type: ${d["Sous-type"]}`
    }),

    // Couche 3: La gare sélectionnée (si une est choisie)
    Plot.dot(
      // On ne met la gare que si elle est sélectionnée
      gare_filtre.longitude ? [gare_filtre] : [],
      {
        x: "longitude",
        y: "latitude",
        r: 8,
        fill: "black",
        stroke: "white"
      }
    )
  ]
})
)}

function _36(md){return(
md`# 8. Carte du Réseau Ferré de Nouvelle-Aquitaine
`
)}

async function _lignes_na_geojson(FileAttachment)
{
  // 1. Charger le CSV
  const lignes = await FileAttachment(
    "ligne-train-tracé - lignes-par-region-administrative.csv"
  ).csv({ delimiter: ";", typed: true }); // Utilisation de .dsv() pour être sûr

  // 2. Filtrer sur la région
  const lignes_na_filtrees = lignes.filter((d) => {
    if (!d.REGION) return false;
    // Votre filtre (AQUITAINE)
    return d.REGION.trim().toUpperCase() === "AQUITAINE";
  });

  // 3. Transformer en "Features" GeoJSON
  const features = lignes_na_filtrees
    .map((d) => {
      try {
        const geo = JSON.parse(d["Geo Shape"]);

        // On crée un "Feature" GeoJSON complet
        return {
          type: "Feature",
          properties: {
            // On garde les infos utiles pour le popup
            LIB_LIGNE: d.LIB_LIGNE,
            REGION: d.REGION
          },
          geometry: {
            type: "MultiLineString",
            coordinates: geo
          }
        };
      } catch (e) {
        return null;
      }
    })
    .filter((d) => d !== null);

  // 4. On retourne la "FeatureCollection" complète
  return {
    type: "FeatureCollection",
    features: features
  };
}


function _lignesParRegionAdministrative(__query,FileAttachment,invalidation){return(
__query(FileAttachment("ligne-train-tracé - lignes-par-region-administrative.csv"),{from:{table:"lignes-par-region-administrative"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _39(departements_na,gares_na){return(
departements_na && gares_na
  ? "Prêt à dessiner la carte (Fonds, Gares et Lignes OK)"
  : "Erreur: 'departements_na', 'gares_na' ou 'lignes_na' est manquant."
)}

function* _40(htl,L,lignes_na_geojson,gares_na)
{
  // --- 1. Création du conteneur et de la carte ---
  const container = yield htl.html`<div style="height: 600px;">`;
  const map = L.map(container);

  // --- 2. Ajout des LIGNES FERRÉES (Couche 1) ---
  const layer = L.geoJSON(lignes_na_geojson, {
    style: {
      color: "black",
      weight: 1.5,
      opacity: 0.8
    },
    onEachFeature: (feature, layer) => {
      if (feature.properties && feature.properties.LIB_LIGNE) {
        layer.bindPopup(feature.properties.LIB_LIGNE);
      }
    }
  }).addTo(map);

  // --- 3. AJOUT DES GARES (Couche 2) ---
  const gareIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [0, -32],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [30, 32]
  });

  const garesLayer = L.layerGroup().addTo(map);
  for (const gare of gares_na) {
    L.marker([gare.latitude, gare.longitude], { icon: gareIcon })
      .bindPopup(`<b>${gare.Nom}</b>`)
      .addTo(garesLayer);
  }

  // --- 4. Centrage et Fond de carte (AVEC SÉCURITÉ) ---
  const bounds = layer.getBounds();

  if (bounds.isValid()) {
    // Si les lignes sont trouvées, on zoome dessus
    map.fitBounds(bounds, { maxZoom: 10 });
  } else {
    // SINON (si 'lignes_na_geojson' est vide), on centre sur Bordeaux
    map.setView([44.8, -0.5], 9);
    console.warn("Aucune ligne ferrée n'a été trouvée, centrage manuel.");
  }

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      "© <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors"
  }).addTo(map);

  // 5. Retourner la carte
  yield container;
}


function _41(md){return(
md`# 9. Axe "Train + Vélo" : Corrélation Gares et Pistes Cyclables
`
)}

function _pistes_cyclables_na(FileAttachment){return(
FileAttachment(
  "traces_cyclables_nouvelle_aquitaine_final.geojson"
).json()
)}

function* _43(htl,L,pistes_cyclables_na,gares_na)
{
  // --- 1. Création du conteneur et de la carte ---
  // (Votre code qui fonctionne)
  const container = yield htl.html`<div style="height: 600px;">`;
  const map = L.map(container);

  // --- 2. Ajout des Pistes Cyclables (Votre couche) ---
  const layer = L.geoJSON(pistes_cyclables_na, {
    style: {
      color: "green", // Couleur des pistes
      weight: 2, // Épaisseur
      opacity: 0.7
    },
    onEachFeature: (feature, layer) => {
      if (feature.properties && feature.properties.ame_d) {
        layer.bindPopup(feature.properties.ame_d); // Info-bulle au clic
      }
    }
  }).addTo(map);

  // --- 3. AJOUT DES GARES (Notre nouvelle couche) ---
  const gareIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [0, -32],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [30, 32]
  });

  const garesLayer = L.layerGroup().addTo(map);
  for (const gare of gares_na) {
    // (Dépend de gares_na de l'étape 1.2)
    L.marker([gare.latitude, gare.longitude], { icon: gareIcon })
      .bindPopup(`<b>${gare.Nom}</b>`) // Info-bulle au clic
      .addTo(garesLayer);
  }

  // --- 4. Centrage et Fond de carte (Votre code) ---
  map.fitBounds(layer.getBounds(), { maxZoom: 10 }); // Zoom un peu plus proche
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      "© <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors"
  }).addTo(map);

  // 5. Retourner la carte
  yield container;
}


function _44(md){return(
md`# Simulateur de Trajet (Distance & CO2) (Hors-ligne)
`
)}

function _co2Factors(){return(
{
  TGV: 1.7,
  INTERCITES: 5.3,
  TER: 24.8,
  RER: 4.75,
  "Voiture (moyenne)": 120 // Facteur de comparaison
}
)}

function _gare_depart_sim(Inputs,gares_na){return(
Inputs.select(gares_na, {
  label: "Gare de départ :",
  format: (d) => d.Nom,
  // Valeur par défaut (ex: Bordeaux)
  value: gares_na.find(
    (g) => g.Nom.toUpperCase().trim() === "BORDEAUX SAINT-JEAN"
  )
})
)}

function _gare_arrivee_sim(Inputs,gares_na){return(
Inputs.select(gares_na, {
  label: "Gare d'arrivée :",
  format: (d) => d.Nom,
  // Valeur par défaut (ex: Bayonne)
  value: gares_na.find((g) => g.Nom.toUpperCase().trim() === "BAYONNE")
})
)}

function _resultats_trajet_offline(gare_depart_sim,gare_arrivee_sim,getDistance,co2Factors)
{
  // 1. Sécurité : si les gares sont identiques
  if (gare_depart_sim.Nom === gare_arrivee_sim.Nom) {
    return null;
  }

  // 2. Calculer la distance "à vol d'oiseau"
  const distance_km = getDistance(
    gare_depart_sim.latitude,
    gare_depart_sim.longitude,
    gare_arrivee_sim.latitude,
    gare_arrivee_sim.longitude
  );

  // 3. Calculer les estimations de CO2 pour chaque mode
  const estimations = Object.entries(co2Factors).map(([mode, facteur]) => {
    return {
      mode: mode,
      emission_g: distance_km * facteur
    };
  });

  // 4. Retourner les résultats
  return {
    distance: distance_km,
    estimations: estimations
  };
}


function _49(resultats_trajet_offline,htl,gare_depart_sim,gare_arrivee_sim)
{
  // Attend que la cellule 'resultats_trajet_offline' ait une valeur
  const resultats = resultats_trajet_offline;

  if (!resultats) {
    return htl.html`<div style="font-style: italic; padding: 10px; background: #f9f9f9;">
      Veuillez sélectionner deux gares différentes.
    </div>`;
  }

  // Si tout fonctionne
  return htl.html`
    <div style="font-family: sans-serif; padding: 15px; background: #eef; border-radius: 5px;">
      <h3 style="margin-top: 0;">Comparaison pour un trajet (distance à vol d'oiseau) :</h3>
      <div><b>De :</b> ${gare_depart_sim.Nom}</div>
      <div><b>À :</b> ${gare_arrivee_sim.Nom}</div>
      <div><b>Distance :</b> ${resultats.distance.toFixed(1)} km</div>
    </div>
  `;
}


function _donnees_graphique_co2(resultats_trajet_offline)
{
  // Si on n'a pas de résultats (état initial ou gares identiques)
  if (!resultats_trajet_offline) {
    return []; // Retourne un tableau vide
  }

  // Si on a des résultats, on trie les estimations
  const data = resultats_trajet_offline.estimations;

  // On trie par émission descendante (le plus polluant en haut)
  return data.sort((a, b) => b.emission_g - a.emission_g);
}


function _51(Plot,donnees_graphique_co2){return(
Plot.plot({
  marginLeft: 120, // Marge pour les noms

  x: {
    label: "Émission estimée (en grammes de CO₂)",
    grid: true
  },
  y: {
    label: null
  },

  marks: [
    Plot.barX(donnees_graphique_co2, {
      // On passe les données réactives ici
      y: "mode",
      x: "emission_g",
      fill: (d) => (d.mode.includes("Voiture") ? "crimson" : "steelblue"),
      title: (d) => `${d.mode}\n${d.emission_g.toFixed(1)} g CO₂`,

      // On trie les barres (axe Y) par le 'x' (emission_g)
      sort: { y: "x", reverse: true }
    }),

    Plot.text(donnees_graphique_co2, {
      // On passe les données réactives ici aussi
      x: "emission_g",
      y: "mode",
      text: (d) => d.emission_g.toFixed(0) + "g",
      dx: -20,
      fill: "white"
    }),

    Plot.ruleX([0])
  ]
})
)}

function _52(md){return(
md`# Enrichissement des Gares avec Horaires d'Ouverture
`
)}

async function _horaires_map(FileAttachment,d3)
{
  // 1. Charger le NOUVEAU CSV (séparateur virgule)
  const horaires_bruts = await FileAttachment("horaires-des-gares2.csv").csv({
    typed: true
  }); // <-- On utilise .csv() pour les virgules

  // 2. Normaliser les données
  const horaires_norm = horaires_bruts.map((d) => {
    // On convertit l'UIC en 'string' immédiatement (sécurité)
    const uic_brut = String(d.UIC); // <-- On utilise "UIC" (sans BOM)
    let uic_norm = uic_brut;

    // Enlever le "00" du début (ex: "0087..." -> "87...")
    if (uic_brut.startsWith("00")) {
      uic_norm = uic_brut.substring(2);
    }

    return {
      uic: uic_norm, // C'est maintenant un string nettoyé
      jour: d["Jour de la semaine"], // Nom de colonne de votre screenshot
      horaire: d["Horaire en jour normal"] || "Fermé" // Nom de colonne
    };
  });

  // 3. Regrouper les horaires par code UIC
  // On obtient une Map : "87..." => [ {jour: "Lundi", ...}, {jour: "Mardi", ...} ]
  return d3.group(horaires_norm, (d) => d.uic);
}


function* _54(htl,L,lignes_na_geojson,gares_na,horaires_map)
{
  // --- 1. Création du conteneur et de la carte ---
  const container = yield htl.html`<div style="height: 600px;">`;
  const map = L.map(container);
  
  // --- 2. Ajout des LIGNES FERRÉES (Couche 1) ---
  const layer = L.geoJSON(lignes_na_geojson, { // (De l'étape 11.1)
    style: { color: "black", weight: 1.5, opacity: 0.8 },
    onEachFeature: (feature, layer) => {
      if (feature.properties && feature.properties.LIB_LIGNE) {
        layer.bindPopup(feature.properties.LIB_LIGNE); 
      }
    }
  }).addTo(map);

  // --- 3. AJOUT DES GARES (Couche 2) (Enrichie) ---
  const gareIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [0, -32],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [30, 32],
  });

  const garesLayer = L.layerGroup().addTo(map);
  
  for (const gare of gares_na) { // (De l'étape 1.2)
    let popupContent = `<b>${gare.Nom}</b>`;
    
    // On force la clé UIC de la gare en 'string' pour la recherche
    const uic_cle = String(gare["Code(s) UIC"]);
    
    // On cherche dans notre 'horaires_map' (de l'étape 13.1)
    const horaires = horaires_map.get(uic_cle); 
    
    if (horaires) {
      popupContent += "<hr style='margin: 5px 0;'><i>Horaires d'ouverture :</i>";
      for (const h of horaires) {
        popupContent += `<br>${h.jour}: ${h.horaire}`;
      }
    } else {
      popupContent += "<br><i>Horaires non renseignés</i>";
    }
    
    L.marker([gare.latitude, gare.longitude], {icon: gareIcon})
      .bindPopup(popupContent)
      .addTo(garesLayer);
  }
  
  // --- 4. Centrage et Fond de carte ---
  const bounds = layer.getBounds();
  if (bounds.isValid()) {
    map.fitBounds(bounds, {maxZoom: 10}); 
  } else {
    map.setView([44.8, -0.5], 9); 
  }
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors"
  }).addTo(map);

  // 5. Retourner la carte
  yield container;
}


export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["gares_nettoyees.csv", {url: new URL("./files/591f086691e4e47ed8cd1974968f96c1d210b2be2202a01e44d89080122eb6ff0afba9ade9a0eed16f7998d9e0f363028ea90d5867841e9fd3663735ac714da5.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["basilic_nouvelle_aquitaine.csv", {url: new URL("./files/d55b2834114673870a9ee567b3362dfe9794db983434aeb57bc86585ab21d7290cc9fd61111124c464ecabf32972b709509bb362ac775f5eab5b0b98bf152e9d.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["datatourisme.csv", {url: new URL("./files/c4a4c59ce5e5d406e514698e049b57278a3c7a0efe92dd3794f3a36779725a4a03beda34fab96d79a23f28c28ba65fb4b07f1f0adb2a6f91e0fb80c6e58f8475.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["traces_cyclables_nouvelle_aquitaine_final.geojson", {url: new URL("./files/ffa1003a47980c68c45b6729b2e4700d0d426b878af62f8c6579158a3393af54463de2381a1ea066955a825824a8ef4d1ba02db19a2550048099ec86af5b9e10.geojson", import.meta.url), mimeType: "application/geo+json", toString}],
    ["ligne-train-tracé - lignes-par-region-administrative.csv", {url: new URL("./files/f69b2a3c4002dd15a80e749af2b0523f0ad4771a8dd913c66bcbaaa9d96065ab128104e783b64e86ea9f57b4feba9b9f417db702d4c6c966d8c1b7c8e022ff03.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["horaires-des-gares2.csv", {url: new URL("./files/2b2b7156c039a7d0629f31cc81d96b213e523ea7e16dbea8cc0ff7e9fa2d308fbcadbf1a417dc84fb461ce23be631d3cb2c6e3d2229cffdf1463d22aef5d0b10.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof defi")).define("viewof defi", ["Inputs"], _defi);
  main.variable(observer("defi")).define("defi", ["Generators", "viewof defi"], (G, _) => G.input(_));
  main.variable(observer()).define(["htl"], _3);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer("codes_na")).define("codes_na", _codes_na);
  main.variable(observer("gares_na")).define("gares_na", ["FileAttachment","codes_na"], _gares_na);
  main.variable(observer()).define(["gares_na"], _7);
  main.variable(observer("poi_na")).define("poi_na", ["FileAttachment"], _poi_na);
  main.variable(observer()).define(["poi_na"], _9);
  main.variable(observer("departements_na")).define("departements_na", ["codes_na"], _departements_na);
  main.variable(observer("getDistance")).define("getDistance", _getDistance);
  main.variable(observer("gares_enrichies_na")).define("gares_enrichies_na", ["gares_na","poi_na","getDistance","rayon_km"], _gares_enrichies_na);
  main.variable(observer("viewof rayon_km")).define("viewof rayon_km", ["Inputs"], _rayon_km);
  main.variable(observer("rayon_km")).define("rayon_km", ["Generators", "viewof rayon_km"], (G, _) => G.input(_));
  main.variable(observer("formatTooltip")).define("formatTooltip", _formatTooltip);
  main.variable(observer()).define(["Plot","d3","departements_na","gares_enrichies_na","formatTooltip"], _15);
  main.variable(observer("top_20_gares_na")).define("top_20_gares_na", ["gares_enrichies_na","d3"], _top_20_gares_na);
  main.variable(observer()).define(["Plot","d3","top_20_gares_na","formatTooltip"], _17);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer("poi_datatourisme")).define("poi_datatourisme", ["FileAttachment"], _poi_datatourisme);
  main.variable(observer()).define(["__query","poi_datatourisme","invalidation"], _20);
  main.variable(observer("types_uniques")).define("types_uniques", ["poi_datatourisme"], _types_uniques);
  main.variable(observer("sous_types_uniques")).define("sous_types_uniques", ["poi_datatourisme"], _sous_types_uniques);
  main.variable(observer("viewof filtre_type")).define("viewof filtre_type", ["Inputs","types_uniques"], _filtre_type);
  main.variable(observer("filtre_type")).define("filtre_type", ["Generators", "viewof filtre_type"], (G, _) => G.input(_));
  main.variable(observer("viewof filtre_sous_type")).define("viewof filtre_sous_type", ["Inputs","sous_types_uniques"], _filtre_sous_type);
  main.variable(observer("filtre_sous_type")).define("filtre_sous_type", ["Generators", "viewof filtre_sous_type"], (G, _) => G.input(_));
  main.variable(observer("poi_filtres_na")).define("poi_filtres_na", ["poi_datatourisme","filtre_type","filtre_sous_type"], _poi_filtres_na);
  main.variable(observer()).define(["Plot","d3","departements_na","poi_filtres_na"], _26);
  main.variable(observer()).define(["md"], _27);
  const child1 = runtime.module(define1);
  main.import("Plot", child1);
  main.variable(observer()).define(["gares_na","departements_na","poi_datatourisme"], _29);
  main.variable(observer("viewof gare_filtre")).define("viewof gare_filtre", ["Inputs","gares_na"], _gare_filtre);
  main.variable(observer("gare_filtre")).define("gare_filtre", ["Generators", "viewof gare_filtre"], (G, _) => G.input(_));
  main.variable(observer("viewof rayon_km_filtre")).define("viewof rayon_km_filtre", ["Inputs"], _rayon_km_filtre);
  main.variable(observer("rayon_km_filtre")).define("rayon_km_filtre", ["Generators", "viewof rayon_km_filtre"], (G, _) => G.input(_));
  main.variable(observer("viewof type_filtre")).define("viewof type_filtre", ["Inputs","types_uniques"], _type_filtre);
  main.variable(observer("type_filtre")).define("type_filtre", ["Generators", "viewof type_filtre"], (G, _) => G.input(_));
  main.variable(observer("viewof sous_type_filtre")).define("viewof sous_type_filtre", ["Inputs","sous_types_uniques"], _sous_type_filtre);
  main.variable(observer("sous_type_filtre")).define("sous_type_filtre", ["Generators", "viewof sous_type_filtre"], (G, _) => G.input(_));
  main.variable(observer("poi_filtres_combines")).define("poi_filtres_combines", ["poi_datatourisme","gare_filtre","getDistance","rayon_km_filtre","type_filtre","sous_type_filtre"], _poi_filtres_combines);
  main.variable(observer()).define(["Plot","d3","departements_na","poi_filtres_combines","gare_filtre"], _35);
  main.variable(observer()).define(["md"], _36);
  main.variable(observer("lignes_na_geojson")).define("lignes_na_geojson", ["FileAttachment"], _lignes_na_geojson);
  main.variable(observer("lignesParRegionAdministrative")).define("lignesParRegionAdministrative", ["__query","FileAttachment","invalidation"], _lignesParRegionAdministrative);
  main.variable(observer()).define(["departements_na","gares_na"], _39);
  main.variable(observer()).define(["htl","L","lignes_na_geojson","gares_na"], _40);
  main.variable(observer()).define(["md"], _41);
  main.variable(observer("pistes_cyclables_na")).define("pistes_cyclables_na", ["FileAttachment"], _pistes_cyclables_na);
  main.variable(observer()).define(["htl","L","pistes_cyclables_na","gares_na"], _43);
  main.variable(observer()).define(["md"], _44);
  main.variable(observer("co2Factors")).define("co2Factors", _co2Factors);
  main.variable(observer("viewof gare_depart_sim")).define("viewof gare_depart_sim", ["Inputs","gares_na"], _gare_depart_sim);
  main.variable(observer("gare_depart_sim")).define("gare_depart_sim", ["Generators", "viewof gare_depart_sim"], (G, _) => G.input(_));
  main.variable(observer("viewof gare_arrivee_sim")).define("viewof gare_arrivee_sim", ["Inputs","gares_na"], _gare_arrivee_sim);
  main.variable(observer("gare_arrivee_sim")).define("gare_arrivee_sim", ["Generators", "viewof gare_arrivee_sim"], (G, _) => G.input(_));
  main.variable(observer("resultats_trajet_offline")).define("resultats_trajet_offline", ["gare_depart_sim","gare_arrivee_sim","getDistance","co2Factors"], _resultats_trajet_offline);
  main.variable(observer()).define(["resultats_trajet_offline","htl","gare_depart_sim","gare_arrivee_sim"], _49);
  main.variable(observer("donnees_graphique_co2")).define("donnees_graphique_co2", ["resultats_trajet_offline"], _donnees_graphique_co2);
  main.variable(observer()).define(["Plot","donnees_graphique_co2"], _51);
  main.variable(observer()).define(["md"], _52);
  main.variable(observer("horaires_map")).define("horaires_map", ["FileAttachment","d3"], _horaires_map);
  main.variable(observer()).define(["htl","L","lignes_na_geojson","gares_na","horaires_map"], _54);
  return main;
}
