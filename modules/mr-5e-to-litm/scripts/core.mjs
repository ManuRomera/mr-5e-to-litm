/**
 * MR · 5E → Legend in the Mist
 * Motor independiente de Foundry. No reproduce tablas ni textos del suplemento.
 * Las etiquetas son propuestas a revisar, nunca equivalencias mecánicas automáticas.
 */
export const ID = "mr-5e-to-litm";
export const MIGHTS = ["origin", "adventure", "greatness"];
export const MIGHT_NAMES = {origin:"Origen",adventure:"Aventura",greatness:"Grandeza"};
const CLASSES = {
  barbarian:"Bárbaro", bard:"Bardo", cleric:"Clérigo", druid:"Druida",
  fighter:"Guerrero", monk:"Monje", paladin:"Paladín", ranger:"Explorador",
  rogue:"Pícaro", sorcerer:"Hechicero", warlock:"Brujo", wizard:"Mago"
};
const ALIASES = {barbaro:"barbarian",bardo:"bard",clerigo:"cleric",druida:"druid",guerrero:"fighter",monje:"monk",paladin:"paladin",explorador:"ranger",picaro:"rogue",hechicero:"sorcerer",brujo:"warlock",mago:"wizard"};
export const ABILITIES = {str:"Fuerza",dex:"Destreza",con:"Constitución",int:"Inteligencia",wis:"Sabiduría",cha:"Carisma"};
const withoutTags = (s) => String(s ?? "").replace(/<[^>]*>/g, "").trim();
const clean = (s) => withoutTags(s).slice(0, 4000);
const norm = (s) => String(s ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const validLevel = (v) => Math.max(1, Math.min(20, Number.parseInt(v,10) || 1));
const arr = (v) => Array.isArray(v) ? v : [];
const unique = (xs) => [...new Set(xs.filter(Boolean))];
function className(value) {
 const key = norm(value);
 return {key:ALIASES[key] || key, name: CLASSES[key] || CLASSES[ALIASES[key]] || clean(value)};
}
function itemName(i) {return clean(i?.name || i?.definition?.name || i?.label);}
function readClasses(actor, data) {
 const classes = arr(actor.items).filter(i=>i.type==="class").map(i=>({name:itemName(i),level:validLevel(i.system?.levels ?? i.data?.levels)}));
 if (classes.length) return classes;
 if (Array.isArray(data.classes)) return data.classes.map(i=>({name:itemName(i),level:validLevel(i.level ?? i.system?.levels)})).filter(i=>i.name);
 if (data.classes && typeof data.classes==="object") return Object.values(data.classes).map(i=>({name:itemName(i),level:validLevel(i.levels ?? i.level)})).filter(i=>i.name);
 const name=clean(data.details?.class || data.class || actor.class || actor.characterClass);
 return name ? [{name,level:validLevel(data.details?.level || actor.level || 1)}] : [];
}
export function normalizeSource(input) {
 let obj=typeof input==="string" ? JSON.parse(input) : input;
 if (!obj || typeof obj!=="object" || Array.isArray(obj)) throw Error("El JSON debe contener un objeto de personaje.");
 if (obj.format==="mr-5e-to-litm-draft") return {draft:obj};
 if (obj.format==="mr-5e-to-litm-export" && obj.actor) obj=obj.actor;
 if (obj.data?.character) obj=obj.data.character;
 if (obj.character && typeof obj.character==="object" && !obj.system) obj=obj.character;
 const data = obj.system || obj.data?.data || obj.data || {};
 const allItems = arr(obj.items);
 const sourceDdb = Array.isArray(obj.classes) && obj.classes.some(x=>x?.definition);
 const level = validLevel(data.details?.level || data.details?.xp?.level || obj.level || arr(obj.classes).reduce((a,c)=>a+(Number(c.level)||0),0));
 const classes = readClasses(obj, data).map(x=>({...className(x.name),level:x.level}));
 const spells=unique([...allItems.filter(i=>i.type==="spell").map(itemName), ...arr(obj.spells).map(itemName)]);
 const features=unique([...allItems.filter(i=>["feat","feature","subclass"].includes(i.type)).map(itemName),...arr(obj.features).map(itemName)]);
 const equipment=unique([...allItems.filter(i=>["weapon","equipment","tool","consumable","loot","container"].includes(i.type)).map(itemName),...arr(obj.equipment).map(itemName)]);
 const abilities={};
 for(const key of Object.keys(ABILITIES)){
   let v=data.abilities?.[key] || obj.abilities?.[key] || obj.stats?.[key] || obj.attributes?.[key];
   if (typeof v==="object") v=v?.value ?? v?.score;
   abilities[key]=Number(v) || 10;
 }
 const race = clean(data.details?.race || data.details?.species || data.traits?.race || obj.race?.fullName || obj.race?.definition?.name || obj.race || obj.species || "Sin determinar");
 const background = clean(data.details?.background || obj.background?.definition?.name || obj.background?.name || obj.background || "");
 const biography=clean(data.details?.biography?.value || data.details?.biography?.public || obj.biography || obj.description || "");
 const warnings=[];
 if (!classes.length) warnings.push("No se pudo determinar la clase; introduce su tema manualmente.");
 if (sourceDdb) warnings.push("Origen D&D Beyond: campos aproximados. Revisa con atención las clases, dotes y conjuros.");
 if (classes.length>1) warnings.push("Multiclase: los temas se eligen por relevancia narrativa y cada clase conserva su nivel para calcular Poderío.");
 if (level>2) warnings.push("Nivel experimentado: la guía contempla ajustes opcionales de etiquetas acordados con el Narrador; no se generan automáticamente.");
 if (spells.length) warnings.push("Los conjuros requieren revisar su efecto narrativo y su Poderío; no se han convertido las reglas de combate automáticamente.");
 warnings.push("La referencia del suplemento emplea D&D 5e de 2014. Verifica cualquier opción de reglas de 2024.");
 return {name:clean(obj.name || obj.characterName || "Personaje sin nombre").slice(0,140),level,classes,race,background,abilities,spells,features,equipment,biography,image:clean(obj.img || obj.image || ""),warnings,source:sourceDdb?"D&D Beyond":obj.system?"Foundry D&D 5e":"JSON"};
}
export function mightFromLevel(n) {return n>=14?"greatness":n>=6?"adventure":"origin";}
export function makeDraft(source) {
 const c = source?.draft ? source.draft.character : source;
 const class1 = c.classes[0] || {name:"Clase por determinar",level:c.level};
 const ranked=Object.entries(c.abilities).sort((a,b)=>b[1]-a[1]);
 const top=ranked[0]?.[0] || "str";
 const prompts = [
  {id:"class",category:"class",title:class1.name,kind:"Clase y vocación",might:mightFromLevel(class1.level),power:[c.features[0]||"",c.features[1]||""]},
  {id:"people",category:"people",title:c.race,kind:"Pueblo y cultura",might:"origin",power:["",""]},
  {id:"trait",category:"trait",title:ABILITIES[top]||"Rasgo personal",kind:"Capacidad destacada",might:"origin",power:["",""]},
  c.spells.length ? {id:"magic",category:"spell",title:"Magia de "+class1.name,kind:"Magia",might:mightFromLevel(class1.level),power:[c.spells[0]||"",c.spells[1]||"",c.spells[2]||""]}
  : {id:"background",category:"background",title:c.background || "Mi pasado",kind:"Trasfondo",might:"origin",power:["",""]}
 ];
 return {format:"mr-5e-to-litm-draft",version:2,character:c,themes:prompts.map(t=>({...t,weakness:"",quest:"",story:""})),backpack:c.equipment[0]||"",notes:"",includePortrait:false};
}
export function validateDraft(draft) {
 const issues=[];
 if (!draft || !Array.isArray(draft.themes) || draft.themes.length!==4) return ["Se requieren exactamente cuatro libros de tema."];
 draft.themes.forEach((t,i)=>{
  const n=i+1;
  if (!clean(t.title)) issues.push("Tema "+n+": falta título.");
  if (!MIGHTS.includes(t.might)) issues.push("Tema "+n+": el Poderío es inválido.");
  if (!clean(t.weakness)) issues.push("Tema "+n+": falta etiqueta de debilidad.");
  if (!clean(t.quest)) issues.push("Tema "+n+": falta Gesta.");
  const count=t.category==="spell"?3:2;
  if (arr(t.power).length!==count || arr(t.power).some(x=>!clean(x))) issues.push("Tema "+n+": debes completar "+count+" etiquetas de poder.");
 });
 return issues;
}
export function compileActor(draft) {
 const issues=validateDraft(draft);
 if(issues.length)throw Error(issues.join("\n"));
 const c=draft.character;
 const items=draft.themes.map(t=>({
  name:clean(t.title),type:"themebook",
  system:{type:"litm-"+t.might,color:"litm-"+t.might,quest:clean(t.quest),
   story:clean(t.story)||"Adaptación narrativa de "+t.kind,
   powertags:(t.category==="spell"?t.power:[t.title,...t.power]).map(x=>({name:clean(x)})),
   weaknesstags:[{name:clean(t.weakness)}],options:{isStoryTheme:false}}
 }));
 if(clean(draft.backpack))items.push({name:"Mochila",type:"backpack",system:{items:[{name:clean(draft.backpack)}]}});
 const sourceSummary="Origen: "+c.source+". "+c.classes.map(x=>x.name+" "+x.level).join(", ")+". Revisar con el Narrador.";
 const actor={name:c.name,type:"litm-character",system:{biography:[c.biography,clean(draft.notes)].filter(Boolean).join("\n\n"),notes:sourceSummary,shortDescription:"Adaptado desde D&D 5e · Nivel "+c.level},items,flags:{[ID]:{source:"dnd5e",version:"0.1.0",sourceName:c.name,level:c.level}}};
 if(draft.includePortrait && /^([a-zA-Z0-9_./%() -]+)$/.test(c.image) && !c.image.includes("..")) actor.img=c.image;
 return actor;
}
