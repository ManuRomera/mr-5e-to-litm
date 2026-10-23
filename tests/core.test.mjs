import test from "node:test";
import assert from "node:assert/strict";
import {normalizeSource,mightFromLevel,makeDraft,validateDraft,compileActor,MIGHTS} from "../modules/mr-5e-to-litm/scripts/core.mjs";

const example={
 name:"Clara",type:"character",system:{
 details:{level:4,race:"Semielfa",background:"Noble",biography:{value:"Leal a su familia"}},
 abilities:{str:{value:8},dex:{value:14},con:{value:12},int:{value:12},wis:{value:10},cha:{value:18}}
 },
 items:[
  {type:"class",name:"Bard",system:{levels:4}},
  {type:"feat",name:"Bardic Inspiration"},
  {type:"spell",name:"Healing Word"},
  {type:"weapon",name:"Dagger"}
 ]};
test("Poderío por nivel de clase",()=>{
 assert.equal(mightFromLevel(1),"origin");
 assert.equal(mightFromLevel(5),"origin");
 assert.equal(mightFromLevel(6),"adventure");
 assert.equal(mightFromLevel(13),"adventure");
 assert.equal(mightFromLevel(14),"greatness");
 assert.equal(mightFromLevel(20),"greatness");
 assert.equal(MIGHTS.length,3);
});
test("Importación JSON nativo de Foundry D&D 5e",()=>{
 const c=normalizeSource(JSON.stringify(example));
 assert.equal(c.name,"Clara");assert.equal(c.level,4);
 assert.equal(c.classes[0].name,"Bardo");
 assert.equal(c.classes[0].level,4);
 assert.equal(c.abilities.cha,18);
 assert.deepEqual(c.spells,["Healing Word"]);
 assert.deepEqual(c.features,["Bardic Inspiration"]);
 assert.deepEqual(c.equipment,["Dagger"]);
});
test("Exportación MR envuelta y vuelta a importar",()=>{
 const wrapped={format:"mr-5e-to-litm-export",version:1,actor:example};
 assert.deepEqual(normalizeSource(wrapped).spells,["Healing Word"]);
});
test("Detecta la necesidad de completar las Gestas",()=>{
 const draft=makeDraft(normalizeSource(example));
 assert.equal(draft.themes.length,4);
 assert.equal(draft.themes[0].title,"Bardo");
 assert.equal(draft.themes[2].title,"Carisma");
 assert.equal(draft.themes[3].category,"spell");
 assert.ok(validateDraft(draft).some(x=>x.includes("Gesta")));
});
test("Creación de actor nativo LitM después de la revisión",()=>{
 const draft=makeDraft(normalizeSource(example));
 draft.themes.forEach((t,i)=>{
  t.weakness="Debilidad "+(i+1);t.quest="Objetivo "+(i+1);
  t.power=t.power.map((p,j)=>p||"Etiqueta "+i+"-"+j);
 });
 assert.deepEqual(validateDraft(draft),[]);
 const a=compileActor(draft);
 assert.equal(a.type,"litm-character");
 assert.equal(a.items.filter(x=>x.type==="themebook").length,4);
 assert.equal(a.items.find(x=>x.type==="themebook").system.powertags.length,3);
 assert.ok(a.items.some(x=>x.type==="backpack"));
 assert.equal(a.flags["mr-5e-to-litm"].source,"dnd5e");
 assert.equal(a.system.biography,"Leal a su familia");
});
test("Multiclase mantiene niveles por clase",()=>{
 const data=structuredClone(example);
 data.items.unshift({type:"class",name:"Warlock",system:{levels:2}});
 data.system.details.level=6;
 const d=makeDraft(normalizeSource(data));
 assert.equal(d.character.classes.length,2);
 assert.equal(d.themes[0].might,"origin");
 assert.ok(d.character.warnings.some(w=>w.includes("Multiclase")));
});
test("Importación manual básica",()=>{
 const d=makeDraft(normalizeSource({name:"Tomás",class:"Guerrero",race:"Humano",level:3,equipment:[{name:"Espada"}]}));
 assert.equal(d.character.name,"Tomás");
 assert.equal(d.themes[0].title,"Guerrero");
 assert.equal(d.themes[3].category,"background");
});
test("Rechaza actores con etiquetas incompletas",()=>{
 const draft=makeDraft(normalizeSource(example));
 assert.throws(()=>compileActor(draft),/Gesta|debilidad/);
});
