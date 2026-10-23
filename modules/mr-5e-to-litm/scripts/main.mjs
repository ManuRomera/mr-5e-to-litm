import {ID,MIGHTS,MIGHT_NAMES,ABILITIES,normalizeSource,makeDraft,validateDraft,compileActor} from "./core.mjs";
const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;
const DIR="modules/"+ID;
const safe=(s)=>String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/&/g,"&amp;");
function saveJSON(name,object){
 const txt=JSON.stringify(object,null,2);
 if(typeof saveDataToFile==="function")return saveDataToFile(txt,"application/json",name);
 const blob=new Blob([txt],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function slug(s){return String(s??"personaje").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").toLowerCase();}
class Converter extends HandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={
  id:"mr-5e-to-litm-window",
  classes:["mr-5e-to-litm"],tag:"section",
  window:{title:"MR · Conversor 5E → Legend in the Mist",resizable:true,icon:"fa-solid fa-book"},
  position:{width:1050,height:770}
 };
 static PARTS={main:{template:DIR+"/templates/converter.hbs",scrollable:[".mr-scroll"]}};
 constructor(options={}){super(options);this.draft=null;this.notice="";this.manualOpen=false;}
 async _prepareContext(options){
  const ctx=await super._prepareContext(options);
  const isDnd=game.system.id==="dnd5e";
  const isLitm=game.system.id==="mist-engine-fvtt";
  const actors=isDnd?game.actors.filter(a=>a.type==="character"&&a.testUserPermission(game.user,"OBSERVER")).map(a=>({id:a.id,name:a.name})):[];
  const themeRows=(this.draft?.themes??[]).map((t,i)=>({
   ...t,index:i,slotLabel:["1 · Clase / identidad","2 · Pueblo / cultura","3 · Rasgo personal","4 · Magia / trasfondo"][i],
   isSpell:t.category==="spell",
   powerRows:t.power.map((name,j)=>({name,index:j})),
   mightChoices:MIGHTS.map(m=>({id:m,name:MIGHT_NAMES[m],selected:t.might===m}))
  }));
  return {...ctx,isDnd,isLitm,isOther:!isDnd&&!isLitm,actors,hasDraft:!!this.draft,notice:this.notice,
   manualOpen:this.manualOpen,character:this.draft?.character,
   themes:themeRows,diagnostics:this.draft?.character.warnings??[],
   problems:this.draft?validateDraft(this.draft):[],
   backpack:this.draft?.backpack??"",notes:this.draft?.notes??"",
   includePortrait:!!this.draft?.includePortrait,features:this.draft?.character.features??[],
   spells:this.draft?.character.spells??[],
   equipment:this.draft?.character.equipment??[],
   classes:this.draft?.character.classes??[]
  };
 }
 _onRender(context,options){
  super._onRender(context,options);
  this.element.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",event=>this._act(event,el.dataset.action)));
  this.element.querySelectorAll("[data-field]").forEach(el=>el.addEventListener("change",()=>this._edit(el)));
  this.element.querySelector("#mr-file")?.addEventListener("change",event=>this._file(event));
 }
 async _file(event){
  const f=event.currentTarget.files?.[0];if(!f)return;
  try{if(f.size>12*1024*1024)throw Error("El JSON excede los 12 MB.");
   this._load(await f.text());
  }catch(e){this._error(e);}
 }
 _load(txt){
  const source=normalizeSource(txt);
  this.draft=source.draft??makeDraft(source);
  this.manualOpen=false;
  this.notice="Importación realizada. Revisa las cuatro tarjetas: las Gestas y debilidades no se generan sin tu criterio.";
  this.render();
 }
 _edit(el){
  if(!this.draft)return;
  const field=el.dataset.field;
  if(field==="backpack"||field==="notes")this.draft[field]=el.value;
  else if(field==="portrait")this.draft.includePortrait=el.checked;
  else {
   const i=Number(el.dataset.index);const t=this.draft.themes[i];if(!t)return;
   if(field==="power")t.power[Number(el.dataset.powerIndex)]=el.value.trim();
   else if(["title","might","weakness","quest","story"].includes(field))t[field]=el.value.trim();
  }
  this.notice="Cambios incorporados al borrador. Comprueba los avisos antes de crear la ficha.";
  this.render();
 }
 async _act(event,action){
  event.preventDefault();
  try{
   if(action==="show-manual"){this.manualOpen=!this.manualOpen;this.render();return;}
   if(action==="load-paste"){
    const raw=this.element.querySelector("#mr-json-paste")?.value?.trim();
    if(!raw)throw Error("Introduce primero el JSON en el campo correspondiente.");
    this._load(raw);return;
   }
   if(action==="load-manual"){
    const root=this.element;
    const obj={name:root.querySelector("#mr-name")?.value,level:Number(root.querySelector("#mr-level")?.value||1),
      class:root.querySelector("#mr-class")?.value,race:root.querySelector("#mr-race")?.value,
      background:root.querySelector("#mr-background")?.value,biography:root.querySelector("#mr-bio")?.value,
      spells:root.querySelector("#mr-spells")?.value.split(/[\n,;]/).map(s=>({name:s.trim()})).filter(s=>s.name),
      equipment:root.querySelector("#mr-equipment")?.value.split(/[\n,;]/).map(s=>({name:s.trim()})).filter(s=>s.name)};
    if(!obj.name?.trim())throw Error("Indica el nombre del personaje.");
    this.draft=makeDraft(normalizeSource(obj));this.manualOpen=false;
    this.notice="Personaje manual creado. Completa el rasgo, etiquetas, debilidades y Gestas.";this.render();return;
   }
   if(action==="export-dnd"){
    if(game.system.id!=="dnd5e")throw Error("Abre esta función en un mundo D&D 5e.");
    const id=this.element.querySelector("#mr-actor-select")?.value;
    const actor=game.actors.get(id);
    if(!actor || actor.type!=="character" || !actor.testUserPermission(game.user,"OBSERVER"))throw Error("Selecciona un personaje al que tengas acceso.");
    saveJSON("MR-5E-"+slug(actor.name)+".json",{format:"mr-5e-to-litm-export",version:1,source:{system:game.system.id,version:game.system.version},actor:actor.toObject()});
    this.notice="Personaje exportado. Importa su JSON en el mundo Legend in the Mist.";this.render();return;
   }
   if(action==="clear"){this.draft=null;this.notice="";this.render();return;}
   if(!this.draft)throw Error("Importa primero un personaje.");
   if(action==="save-draft"){saveJSON("MR-borrador-"+slug(this.draft.character.name)+".json",this.draft);return;}
   if(action==="save-actor"){const actor=compileActor(this.draft);saveJSON("MR-LitM-"+slug(actor.name)+".json",actor);this.notice="Actor JSON exportado para revisión.";this.render();return;}
   if(action==="create-actor"){
    if(game.system.id!=="mist-engine-fvtt")throw Error("Solo se crean fichas LitM en mundos con el sistema oficial.");
    if(!game.user.isGM)throw Error("El Narrador debe crear los actores en el mundo.");
    const actorData=compileActor(this.draft);
    const name=safe(actorData.name);
    const proceed=await foundry.applications.api.DialogV2.confirm({
     window:{title:"Confirmar creación de héroe"},
     content:"<p>¿Crear la ficha de <strong>"+name+"</strong>?</p><p>Se creará un actor nuevo; los originales no se modificarán.</p>",
     yes:{label:"Crear héroe"},no:{label:"Cancelar"}
    });
    if(!proceed)return;
    const actor=await Actor.create(actorData);
    if(!actor)throw Error("Foundry no ha podido crear la ficha.");
    this.notice="Nuevo héroe creado: "+actor.name;ui.notifications.info(this.notice);
    actor.sheet.render(true);this.render();return;
   }
  }catch(e){this._error(e);}
 }
 _error(e){this.notice=String(e?.message||e);ui.notifications.warn(this.notice);console.error(ID,e);this.render();}
}
Hooks.once("init",()=>{
 game.settings.registerMenu(ID,"converter",{
  name:"MR · Conversor de personajes D&D 5e → LitM",
  label:"Abrir conversor",hint:"Exporta personajes de 5e o crea héroes Legend in the Mist a partir de JSON.",
  icon:"fa-solid fa-right-left",type:Converter,restricted:false
 });
});
Hooks.once("ready",()=>{
 if(!["dnd5e","mist-engine-fvtt"].includes(game.system.id))ui.notifications.warn("MR 5E → LitM: este mundo no utiliza un sistema compatible.");
 game.modules.get(ID).api={open:()=>new Converter().render(true),normalizeSource,makeDraft,compileActor};
});
