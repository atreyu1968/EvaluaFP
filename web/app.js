'use strict';
const S = {page:'inicio', modules:[], moduleId:null, moduleDetails:null, exams:[], examId:null,
  examModuleId:null, examDetails:null, submissions:[], subId:null, subDetails:null,
  uploadExamId:null, uploadStudentId:null, queue:[], pageIndex:0, proposal:null, aiSettings:null, busy:false};
const E = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const V = v=>v==null?'No indicada':String(v)+' %';
const $ = sel=>document.querySelector(sel);
const $all = sel=>[...document.querySelectorAll(sel)];
const token=$('meta[name="app-token"]').content;
function startIntro(){
 const overlay=$('#intro-overlay');if(!overlay)return;
 let remaining=10;let timer=null;
 function dismiss(){if(timer)clearInterval(timer);overlay.hidden=true;}
 $('#dismiss-intro')?.addEventListener('click',dismiss);
 timer=setInterval(()=>{remaining=Math.max(0,remaining-1);const el=$('#intro-count');if(el)el.textContent=String(remaining);if(!remaining)dismiss();},1000);
}
/** Solicita crear uno o varios alumnos, sin dar de alta ninguno hasta confirmar. */
function promptNewStudents(moduleId,codes=[]){
 return new Promise(resolve=>{
  const dialog=$('#students-dialog'),form=$('#students-create-form');
  const fields=$('#students-dialog-fields'),err=$('#students-dialog-error');
  const values=codes.length?codes:[''];
  $('#students-dialog-title').textContent=codes.length?'Alumnos no registrados: '+codes.length:'Crear alumno';
  $('#students-dialog-help').textContent=codes.length?
    'Estos códigos aparecen en el ZIP pero no en el módulo. Escriba el nombre y apellidos de cada alumno para continuar con la importación. No se ha guardado ningún examen todavía.':
    'Introduzca el código y el nombre del alumno. Se incorporará al módulo actual.';
  $('#save-students').textContent=codes.length?'Crear alumnos y continuar':'Guardar alumno';
  err.hidden=true;err.textContent='';
  fields.innerHTML=values.map((code,i)=>`<div class="student-field-grid">
    <div class="field"><label for="new-code-${i}">Código</label><input id="new-code-${i}" data-student-code required maxlength="60" pattern="[A-Za-z0-9][A-Za-z0-9_.-]*" value="${E(code)}" ${codes.length?'readonly':''}></div>
    <div class="field"><label for="new-name-${i}">Nombre y apellidos</label><input id="new-name-${i}" data-student-name required maxlength="160" autocomplete="off" placeholder="Nombre y apellidos"></div>
  </div>`).join('');
  let settled=false;
  const finish=value=>{if(settled)return;settled=true;form.removeEventListener('submit',submit);$('#cancel-students').removeEventListener('click',cancel);dialog.removeEventListener('cancel',onCancel);if(dialog.open)dialog.close();resolve(value);};
  const cancel=()=>finish(null),onCancel=(ev)=>{ev.preventDefault();finish(null)};
  const submit=async ev=>{
    ev.preventDefault();ev.stopPropagation();
    if(!form.reportValidity())return;
    const codes=[...fields.querySelectorAll('[data-student-code]')];
    const names=[...fields.querySelectorAll('[data-student-name]')];
    const students=codes.map((input,i)=>({code:input.value.trim(),name:names[i].value.trim()}));
    const btn=$('#save-students');btn.disabled=true;err.hidden=true;
    try{
      const result=await API('/api/students/bulk','POST',{module_id:Number(moduleId),students});
      finish(result.created);
    }catch(e){err.textContent=e.message;err.hidden=false;}finally{btn.disabled=false;}
  };
  form.addEventListener('submit',submit);
  $('#cancel-students').addEventListener('click',cancel);
  dialog.addEventListener('cancel',onCancel);
  dialog.showModal();fields.querySelector('[data-student-name]')?.focus();
 });
}

async function API(path, method='GET', payload=null){
 const opts={method,headers:{'X-App-Token':token}};
 if(payload instanceof FormData) opts.body=payload;
 else if(payload!==null){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(payload);}
 let res;
 try {res=await fetch(path,opts);} catch(e){throw Error('Sin comunicación con el servicio local: '+e.message)}
 const body=await res.json();
 if(!res.ok){const err=Error(body.error||'Error HTTP '+res.status);err.code=body.code;err.module_id=body.module_id;err.missing_students=body.missing_students;throw err;}
 return body;
}
function toast(text,err=false){let el=document.createElement('div');el.className='toast'+(err?' error':'');el.textContent=text;$('#toast').append(el);setTimeout(()=>el.remove(),7200);}
function setLoading(text){$('#main').innerHTML='<div class="loading">'+E(text||'Cargando…')+'</div>';}
async function busy(work,ok){
 if(S.busy)return;
 S.busy=true;let original=document.body.style.cursor;document.body.style.cursor='progress';
 try{const result=await work();if(ok)toast(ok);return result;}
 catch(e){console.error(e);toast(e.message||'Error no identificado',true);return null;}
 finally{S.busy=false;document.body.style.cursor=original;}
}
function titles(){return {inicio:'Panel de control',programaciones:'Programaciones didácticas',examenes:'Exámenes y rúbricas',
 entregas:'Registro de entregas',correcciones:'Visor y correcciones',evaluacion:'Evaluación del módulo',ajustes:'Configuración local e IA'};}
async function page(name){
 S.page=name;$('#page-title').textContent=titles()[name]||name;
 $all('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===name));
 setLoading();
 try{
 if(name==='inicio')await viewHome();
 if(name==='programaciones')await viewPrograms();
 if(name==='examenes')await viewExams();
 if(name==='entregas')await viewUploads();
 if(name==='correcciones')await viewCorrections();
 if(name==='ajustes')await viewSettings();
 if(name==='evaluacion')await viewEvaluation();
 }catch(ex){console.error(ex);$('#main').innerHTML='<div class="hint danger-note">'+E(ex.message)+'</div>';}
}
async function listModules(){S.modules=await API('/api/modules');return S.modules;}
async function listExams(){S.exams=await API('/api/exams');return S.exams;}
async function listSubs(){S.submissions=await API('/api/submissions');return S.submissions;}
function opt(items,sel,fn){return items.map(i=>`<option value="${E(i.id)}" ${String(i.id)===String(sel)?'selected':''}>${E(fn(i))}</option>`).join('');}
function empty(msg){return `<div class="empty">${E(msg)}</div>`;}
function labelStatus(status){const map={received:'Recibido',transcribed:'Transcrito',proposed:'Pendiente de validación',validated:'Validado'};
 return `<span class="status ${E(status)}">${E(map[status]||status)}</span>`;}
function intro(text){return `<p class="lead">${E(text)}</p>`;}
async function viewHome(){
 const [stats]=await Promise.all([API('/api/dashboard'),listModules(),listExams(),listSubs()]);
 const items=[['Módulos',stats.modules,'▤'],['Criterios de evaluación',stats.criteria,'◎'],['Exámenes',stats.exams,'✎'],['Entregas',stats.submissions,'▧'],['Páginas almacenadas',stats.pages,'▦'],['Correcciones',stats.corrections,'☑']];
 $('#main').innerHTML=`${intro('Cree exámenes alineados con la programación, digitalice respuestas manuscritas y valide calificaciones documentadas.')}
 <div class="cards">${items.map(i=>`<div class="stat"><span class="sym">${i[2]}</span><div class="number">${i[1]}</div><small>${i[0]}</small></div>`).join('')}</div>
 <div class="grid2"><section class="card"><h2>Flujo de trabajo</h2>
 <div class="itemlist"><div class="item">① Importar programación y confirmar RA / CE / pesos</div>
 <div class="item">② Generar preguntas y rúbricas por criterio</div><div class="item">③ Subir PDF o fotos multipágina en orden</div>
 <div class="item">④ Transcribir, corregir y validar la nota</div><div class="item">⑤ Consultar originales e imprimir informe</div></div>
 <div class="actions"><button class="btn" data-page="programaciones">Empezar con una programación</button></div></section>
 <section class="card"><h2>Últimas entregas</h2>${S.submissions.length?`<div class="itemlist">${S.submissions.slice(0,6).map(s=>`<div class="item"><div><div class="title">${E(s.student_name)}</div><div class="detail">${E(s.exam_title)} · ${s.page_count} página(s)</div></div><button class="btn secondary smallbtn" data-action="open-sub" data-id="${s.id}">Revisar</button></div>`).join('')}</div>`:empty('Todavía no se han recibido exámenes.')}
 <p class="hint">Los originales se guardan en el disco local. La IA solo interviene cuando el docente solicita el análisis y autoriza el envío al proveedor elegido.</p></section></div>`;
}
async function viewPrograms(){
 await listModules();
 if(S.moduleId && !S.modules.some(x=>x.id===Number(S.moduleId)))S.moduleId=null;
 if(!S.moduleId && S.modules.length) S.moduleId=S.modules[0].id;
 S.moduleDetails=S.moduleId?await API('/api/modules/'+S.moduleId):null;
 const d=S.moduleDetails;
 $('#main').innerHTML=`${intro('Importe la programación en PDF, DOCX o texto. La IA propone RA, criterios y ponderaciones; el docente confirma o corrige los datos antes de generar exámenes.')}
 <div class="panel"><h2>Nuevo módulo formativo</h2><form id="create-module" class="formgrid">
 <div class="field"><label>Curso académico</label><input required name="academic_year" value="2026-2027" placeholder="2026-2027"></div>
 <div class="field"><label>Ciclo formativo</label><input required name="cycle" placeholder="CFGM Gestión Administrativa"></div>
 <div class="field"><label>Módulo profesional</label><input required name="name" placeholder="Técnica Contable"></div>
 <div class="field"><label>Grupo</label><input name="group_name" placeholder="1.º A"></div>
 <button class="btn" type="submit">Crear módulo</button></form></div>
 ${S.modules.length?`<div class="panel"><div class="formrow"><div class="field grow"><label>Trabajar con el módulo</label><select id="module-select">${opt(S.modules,S.moduleId,m=>m.name+' · '+m.academic_year)}</select></div></div></div>`:empty('Cree el primer módulo para comenzar.')}
 ${d?renderModule(d):''}`;
}
function renderModule(d){const {module:m,outcomes,criteria,students,programmings,materials}=d;
 const rs=outcomes.map(r=>`<div class="item"><div class="grow"><div class="title">${E(r.code)} · ${E(r.description)}</div>
 <div class="detail">Ponderación del RA sobre el módulo: <b>${V(r.weight)}</b></div></div>
 <div class="right"><button class="btn secondary smallbtn" data-action="edit-outcome" data-id="${r.id}">Editar RA</button></div></div>
 ${criteria.filter(c=>c.outcome_id===r.id).map(c=>`<div class="item" style="margin-left:17px;background:#fafdff"><div class="grow"><div class="title">${E(c.code)}</div><div class="detail">${E(c.description)}</div>
 <div class="detail">Peso dentro del RA: <b>${V(c.weight)}</b></div></div><button class="btn mutedbtn smallbtn" data-action="edit-criterion" data-id="${c.id}">Editar CE</button></div>`).join('')}`).join('');
 const proposal=S.proposal?`<div class="panel"><h2>Propuesta de extracción pendiente de revisión</h2><div class="hint warning">Revise todos los pesos y descripciones. Un valor null significa que no hay una ponderación inequívoca. El análisis no modifica automáticamente los CE existentes.</div>
 ${S.proposal.warnings?.length?`<p class="small">Advertencias: ${S.proposal.warnings.map(E).join(' · ')}</p>`:''}
 <form id="apply-proposal"><div class="field"><label>Resultados y criterios propuestos (JSON editable)</label><textarea rows="15" name="outcomes_json">${E(JSON.stringify(S.proposal.outcomes,null,2))}</textarea></div>
 <div class="actions"><button class="btn" type="submit">Confirmar e importar RA/CE</button><button type="button" class="btn secondary" data-action="discard-proposal">Descartar</button></div></form></div>`:'';
 return `<div class="grid2"><section class="panel"><h2>Programaciones originales</h2>
 <form id="upload-program"><input type="hidden" name="module_id" value="${m.id}">
 <div class="field"><label>PDF, DOCX, TXT o Markdown</label><input required name="document" type="file" accept=".pdf,.docx,.txt,.md"></div><div class="actions"><button class="btn" type="submit">Guardar original y extraer texto</button></div></form>
 ${programmings.length?`<div class="section-title">Documentos guardados</div><div class="itemlist">${programmings.map(p=>`<div class="item"><div><b>${E(p.filename)}</b><div class="small">${p.text_length} caracteres de texto extraído</div></div><button class="btn secondary smallbtn" data-action="analyze-program" data-id="${p.id}">Analizar con IA</button></div>`).join('')}</div>`:empty('No hay programación cargada.')}
 </section><section class="panel"><h2>Material didáctico asociado a la programación</h2>
 <p class="small">Suba apuntes, unidades didácticas o libros de texto en PDF, DOCX, TXT o MD. Se conserva cada original y se extrae texto por página (PDF) o bloque (otros formatos). Si hay material activo, <strong>la IA solo podrá generar preguntas con pasajes de ese material</strong> y se guardará la referencia exacta de cada pregunta.</p>
 ${programmings.length?`<form id="upload-material"><input type="hidden" name="module_id" value="${m.id}">
 <div class="field"><label>Programación a la que se asocia</label><select name="programming_id">${opt(programmings,programmings[0].id,p=>p.filename)}</select></div>
 <div class="field"><label>Archivos de material (se admiten varios)</label><input required name="documents" type="file" multiple accept=".pdf,.docx,.txt,.md"></div>
 <div class="actions"><button class="btn" type="submit">Incorporar a la biblioteca local</button></div></form>`:empty('Primero debe subir una programación para poder asociar los materiales.')}
 ${materials.length?`<div class="section-title">Biblioteca documental (${materials.length} archivo/s)</div><div class="itemlist">${materials.map(x=>`<div class="item"><div class="grow"><b>${E(x.filename)}</b><div class="small">Programación #${x.programming_id} · ${x.unit_count} páginas/bloques · ${x.chunk_count} pasajes · original guardado</div></div><div class="actions"><a class="btn smallbtn mutedbtn" href="/api/materials/${x.id}/original">Original</a><button type="button" class="btn smallbtn ${x.active?'secondary':'mutedbtn'}" data-action="toggle-material" data-id="${x.id}" data-active="${x.active?1:0}">${x.active?'Activo · desactivar':'Inactivo · activar'}</button></div></div>`).join('')}</div>`:empty('Todavía no hay materiales de consulta.')}
 <p class="hint">Los PDF escaneados sin capa de texto deben procesarse con OCR antes de subirlos. No se envía el libro completo a la IA: únicamente los pasajes necesarios para redactar preguntas.</p>
 </section><section class="panel"><h2>Alumnado del módulo</h2><form id="create-student" class="formrow"><input type="hidden" name="module_id" value="${m.id}">
 <div class="field grow"><label>Código identificador</label><input name="code" required placeholder="ALU001"></div>
 <div class="field grow"><label>Nombre y apellidos</label><input name="name" required placeholder="Nombre del alumno/a"></div>
 <button class="btn" type="submit">Añadir</button></form><p class="small">Se recomienda utilizar códigos no identificativos en los nombres de archivos y cargas ZIP.</p>
 ${students.length?`<div class="itemlist">${students.map(s=>`<div class="item"><b>${E(s.name)}</b><span class="badge">${E(s.code)}</span></div>`).join('')}</div>`:empty('Aún no se ha registrado alumnado.')}</section></div>
 ${proposal}
 <section class="panel"><div class="subhead"><h2>Resultados de aprendizaje y criterios de evaluación</h2><span class="badge">${outcomes.length} RA · ${criteria.length} CE</span></div>
 ${rs||empty('No hay RA o criterios. Impórtelos con IA o añádalos manualmente.')}
 <div class="grid2" style="margin-top:19px"><form id="create-outcome"><h3>Añadir RA manualmente</h3><div class="formgrid">
 <div class="field"><label>Código RA</label><input required name="code" placeholder="RA1"></div>
 <div class="field"><label>Peso RA (%)</label><input name="weight" type="number" min="0" max="100" step=".01" placeholder="No indicado"></div></div>
 <div class="field"><label>Descripción del RA</label><textarea required name="description"></textarea></div>
 <button type="submit" class="btn secondary">Guardar RA</button></form>
 <form id="create-criterion"><h3>Añadir CE manualmente</h3>
 <div class="field"><label>Resultado al que pertenece</label><select required name="outcome_id">${opt(outcomes,'',r=>r.code)}</select></div>
 <div class="formgrid"><div class="field"><label>Código CE</label><input required name="code" placeholder="RA1.a"></div>
 <div class="field"><label>Peso dentro del RA (%)</label><input type="number" step=".01" min="0" max="100" name="weight" placeholder="No indicado"></div></div>
 <div class="field"><label>Descripción del criterio</label><textarea required name="description"></textarea></div>
 <button class="btn secondary" type="submit" ${!outcomes.length?'disabled':''}>Guardar CE</button></form></div></section>`;
}
async function viewExams(){
 await Promise.all([listModules(),listExams()]);
 if(!S.examModuleId&&S.modules.length)S.examModuleId=S.modules[0].id;
 const d=S.examModuleId?await API('/api/modules/'+S.examModuleId):null;
 const selected=S.examId?await API('/api/exams/'+S.examId).catch(()=>null):null;
 S.examDetails=selected;
 $('#main').innerHTML=`${intro('Seleccione los CE o todos los CE de los RA que desea evaluar. Los puntos de cada pregunta se asignarán de forma proporcional al peso del RA y del criterio en la programación.')}
 <section class="panel"><h2>Generar nuevo examen con IA</h2>${S.modules.length?`<form id="generate-exam">
 <div class="formgrid"><div class="field"><label>Módulo</label><select id="exam-module" name="module_id">${opt(S.modules,S.examModuleId,m=>m.name+' · '+m.academic_year)}</select></div>
 <div class="field"><label>Título</label><input required name="title" placeholder="Prueba de la unidad 2"></div>
 <div class="field"><label>Tipo</label><select name="kind"><option value="desarrollo">Desarrollo</option><option value="test">Tipo test</option><option value="mixto">Mixto</option><option value="problemas">Solo problemas prácticos</option></select></div>
 <div class="field"><label>Programación de referencia</label><select name="programming_id">${opt(d?.programmings||[],d?.programmings?.[0]?.id,p=>p.filename)}</select></div>
 <div class="field"><label>Dificultad</label><select name="difficulty"><option value="bajo">Baja · conceptos y aplicación directa</option><option value="medio" selected>Media · aplicación habitual</option><option value="alto">Alta · análisis y casos complejos</option></select></div>
 <div class="field"><label>Modelos distintos</label><input type="number" name="model_count" min="1" max="6" value="1" required></div>
 <div class="field"><label>Preguntas</label><input type="number" name="question_count" min="1" max="30" value="5" required></div>
 <div class="field"><label>Número de problemas prácticos</label><input type="number" name="problem_count" min="0" max="30" value="0" required><small>Si selecciona «Solo problemas prácticos», serán todas las preguntas. En otros tipos, sustituye ese número de preguntas por problemas.</small></div>
 <div class="field"><label>Centro educativo</label><input name="center_name" maxlength="140" placeholder="Nombre del centro"></div>
 <div class="field"><label>Fecha del examen</label><input type="date" name="exam_date"></div>
 <div class="field"><label>Duración (minutos)</label><input name="duration_minutes" type="number" min="10" max="480" value="60"></div>
 <div class="field"><label>Puntos totales</label><input type="number" name="total_points" min="1" max="100" step=".01" value="10" required></div></div>
 <div class="hint"><strong>Descarga:</strong> tras generar los modelos podrá descargar cada PDF con su encabezado y el ZIP de todos los modelos. Los problemas llevan datos, apartados, solución desarrollada y espacio de operaciones. <strong>Las respuestas y rúbricas solo figuran en el PDF del docente.</strong></div>
 <div class="hint"><strong>Banco ampliado:</strong> se solicitará a la IA un mínimo del triple de preguntas de cada modelo, manteniendo las ponderaciones de cada CE. Los modelos A, B, C… recibirán preguntas diferentes y no repetirán enunciados. Se conservará el banco completo en SQLite. <strong>Cuantos más modelos y preguntas, mayor uso de la API.</strong></div>
 <div class="field"><label>Instrucciones adicionales (opcional)</label><textarea name="instructions" placeholder="Nivel de dificultad, contenidos específicos, calculadora permitida..."></textarea></div>
 <div class="hint">${(d?.materials||[]).some(x=>x.active)?'<strong>Generación obligatoriamente fundamentada:</strong> hay materiales didácticos activos. Cada pregunta incluirá una cita literal verificada y el documento/página o bloque de origen. Antes de contactar con la IA se solicitará autorización para enviar fragmentos al proveedor.':'No hay material didáctico activo. La IA formulará las preguntas a partir de los CE seleccionados.'}</div>
 <div class="section-title">Resultados de aprendizaje / criterios seleccionados</div>
 ${d&&d.criteria.length?d.outcomes.map(r=>`<div><label class="checkbox-card"><input type="checkbox" data-ra="${r.id}" class="ra-checkbox"><span><strong>${E(r.code)} · ${E(r.description)}</strong><span class="small">Peso del RA: ${V(r.weight)} · seleccionar todos sus criterios</span></span></label>
 ${d.criteria.filter(c=>c.outcome_id===r.id).map(c=>`<label class="checkbox-card" style="margin-left:16px"><input type="checkbox" name="criteria_ids" value="${c.id}" data-parent="${r.id}"><span><strong>${E(c.code)} · ${E(c.description)}</strong><span class="small">Peso del CE: ${V(c.weight)} · RA: ${V(c.outcome_weight)}</span></span></label>`).join('')}</div>`).join(''):empty('Este módulo no tiene criterios. Complete antes la programación.')}
 <div class="actions"><button type="submit" class="btn" ${!d?.criteria?.length?'disabled':''}>Generar examen y rúbrica</button></div></form>`:empty('Cree un módulo en Programaciones.')}</section>
 <section class="panel"><details><summary><strong>Alternativa: crear un examen manual sin utilizar la API de IA</strong></summary>
 <p class="small">Puede preparar una o varias preguntas en formato JSON. Es útil para comprobar el visor, la subida multipágina y la validación sin contratar una API. El identificador del CE debe existir en el módulo seleccionado.</p>
 <form id="manual-exam"><div class="formgrid"><div class="field"><label>Módulo</label><select name="module_id">${opt(S.modules,S.examModuleId,x=>x.name)}</select></div>
 <div class="field"><label>Título</label><input name="title" required placeholder="Examen redactado por el docente"></div>
 <div class="field"><label>Centro educativo</label><input name="center_name" placeholder="Nombre del centro"></div>
 <div class="field"><label>Duración (minutos)</label><input name="duration_minutes" type="number" min="10" max="480" value="60"></div></div>
 <div class="field"><label>Preguntas, puntuaciones y rúbricas (lista JSON)</label><textarea name="questions_json" rows="10" required>${E(JSON.stringify(d?.criteria?.length?[{
   criterion_id:d.criteria[0].id,kind:'desarrollo',prompt:'Desarrolle la respuesta a la cuestión propuesta.',points:10,
   ideal_answer:'Describa aquí la respuesta modelo antes de utilizar el examen.',rubric:[{criterion:'Exactitud de los contenidos',weight_pct:100}]
 }]:[],null,2))}</textarea></div>
 <div class="actions"><button class="btn secondary" type="submit" ${!d?.criteria?.length?'disabled':''}>Guardar examen manual</button></div></form></details></section>
 <section class="panel"><div class="subhead"><h2>Exámenes disponibles</h2><span class="badge">${S.exams.length} exámenes</span></div>
 ${S.exams.length?`<div class="itemlist">${S.exams.map(e=>`<div class="item"><div><div class="title">${E(e.title)}</div><div class="detail">${E(e.module_name)} · ${e.question_count} preguntas · ${e.total_points} puntos · ${E(e.difficulty)} · modelo ${E(e.variant_label)} · ${e.submissions_count} entregas${e.bank_size?` · Banco ${e.bank_size} preguntas`:''}</div></div>
 <div class="right">${e.batch_id?`<button class="btn mutedbtn smallbtn" data-action="view-bank" data-id="${e.batch_id}">Banco</button>`:''}<button class="btn secondary smallbtn" data-action="open-exam" data-id="${e.id}">Ver preguntas</button><a class="btn mutedbtn smallbtn" href="/api/exams/${e.id}/pdf">PDF modelo ${E(e.variant_label)}</a>${e.batch_id?`<a class="btn mutedbtn smallbtn" href="/api/exam-batches/${e.batch_id}/pdf.zip">ZIP modelos</a><a class="btn mutedbtn smallbtn" href="/api/exam-batches/${e.batch_id}/soluciones.zip">ZIP solucionarios (docente)</a>`:''}</div></div>`).join('')}</div>`:empty('Todavía no hay exámenes.')}</section>
 ${selected?renderExam(selected):''}`;
}
function renderExam(e){return `<section class="panel"><div class="subhead"><h2>Examen: ${E(e.exam.title)} <span class="badge">${E(e.exam.difficulty)} · Modelo ${E(e.exam.variant_label)}</span></h2><div class="right"><a class="btn secondary" href="/api/exams/${e.exam.id}/pdf">Descargar PDF alumnado</a><a class="btn mutedbtn" href="/api/exams/${e.exam.id}/soluciones.pdf">PDF soluciones y rúbrica</a></div></div>
 ${e.questions.map(q=>`<div class="answer"><h3>${q.kind==='problema'?'Problema práctico':'Pregunta'} ${q.number} · ${E(q.criterion_code)} · ${q.points} puntos</h3><p>${E(q.prompt)}</p>
 ${q.kind==='test'?`<p class="small">${q.options.map(E).join('<br>')}</p><div class="badge green">Respuesta: ${E(q.correct_option)}</div>`:`<p class="small"><strong>Respuesta modelo:</strong> ${E(q.ideal_answer)}</p>`}
 ${(q.source_refs||[]).map(s=>`<div class="hint"><strong>Fuente documental verificada:</strong> ${E(s.filename)} · ${E(s.location_kind)} ${E(s.location_number)}<p class="small">Pasaje utilizado: «${E(s.evidence)}»</p><a class="btn smallbtn mutedbtn" href="/api/materials/${s.material_id}/original">Consultar documento original</a></div>`).join('')}
 <div class="section-title">Rúbrica</div>${q.rubric.map(r=>`<p class="rubric-item">${E(r.criterion)} · ${r.weight_pct}% de la pregunta</p>`).join('')}</div>`).join('')}</section>`;}
async function viewUploads(){
 await Promise.all([listExams(),listSubs()]);
 if(!S.uploadExamId&&S.exams.length)S.uploadExamId=S.exams[0].id;
 const exam=S.exams.find(e=>e.id===Number(S.uploadExamId));
 const d=exam?await API('/api/modules/'+exam.module_id):null;
 $('#main').innerHTML=`${intro('Seleccione un examen y un alumno. Las páginas se conservarán en el mismo orden de selección. Cada PDF aporta sus páginas interiores de forma consecutiva; puede alternar fotografías y PDF.')}
 <section class="panel"><h2>Importar un examen manuscrito multipágina</h2>
 ${S.exams.length?`<form id="upload-submission"><div class="formgrid"><div class="field"><label>Examen</label><select id="upload-exam" name="exam_id">${opt(S.exams,S.uploadExamId,x=>x.title+' · '+x.module_name)}</select></div>
 <div class="field"><label>Alumno/a</label><div class="student-select-controls"><select name="student_id" required>${opt(d?.students||[],S.uploadStudentId||'',x=>x.name+' ('+x.code+')')}</select>
 <button type="button" class="btn secondary smallbtn" data-action="create-upload-student" data-module-id="${exam.module_id}">+ Crear alumno</button></div>
 ${!d?.students?.length?'<small class="small">No hay alumnos registrados. Pulse «Crear alumno» para continuar.</small>':''}</div></div>
 <div class="grid2" style="margin-top:14px"><div class="field"><label>Seleccionar varios archivos (PDF, JPEG, PNG, WEBP, BMP)</label>
 <input type="file" id="upload-pages" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,image/*,application/pdf"></div>
 <div class="field"><label>Añadir fotografía desde móvil</label><input type="file" id="upload-camera" capture="environment" accept="image/*"></div></div>
 <div class="hint">Los PDF se descomponen en páginas numeradas y las fotografías se almacenan en su secuencia. No se modifica el archivo original. Use los controles para corregir el orden antes de enviar.</div>
 <div class="section-title">Cola de archivos en orden de lectura · ${S.queue.length} elemento(s)</div>
 ${S.queue.length?`<ol class="filequeue">${S.queue.map((f,i)=>`<li><span class="filename">${E(f.name)} <span class="small">(${Math.ceil(f.size/1024)} KB)</span></span><div class="actions" style="margin:0"><button type="button" class="btn smallbtn mutedbtn" data-action="queue-up" data-index="${i}" ${!i?'disabled':''}>↑</button><button type="button" class="btn smallbtn mutedbtn" data-action="queue-down" data-index="${i}" ${i===S.queue.length-1?'disabled':''}>↓</button><button type="button" class="btn smallbtn danger" data-action="queue-remove" data-index="${i}">×</button></div></li>`).join('')}</ol>`:empty('No se han seleccionado archivos.')}
 <div class="actions"><button type="submit" class="btn" ${!S.queue.length||!d?.students?.length?'disabled':''}>Guardar entrega y originales</button></div></form>`:empty('Genere primero un examen.')}</section>
 <section class="panel"><h2>Importación masiva de distintos alumnos mediante ZIP</h2><p class="small">Cree un ZIP con una carpeta por código de alumno, por ejemplo ALU001/001.jpg, ALU001/002.jpg, ALU002/001.pdf. Los archivos de cada carpeta se ordenan por nombre numérico. Si falta algún alumno, la aplicación mostrará un formulario para registrarlo antes de importar el ZIP. Los códigos deben coincidir exactamente.</p>
 <form id="upload-batch"><div class="formrow"><div class="field grow"><label>Examen</label><select name="exam_id">${opt(S.exams,S.uploadExamId,x=>x.title)}</select></div><div class="field grow"><label>ZIP de varios alumnos</label><input name="archive" type="file" accept=".zip" required></div><button class="btn secondary" type="submit" ${!S.exams.length?'disabled':''}>Importar lote</button></div></form></section>
 <section class="panel"><h2>Entregas archivadas</h2>${S.submissions.length?`<div class="itemlist">${S.submissions.map(s=>`<div class="item"><div><div class="title">${E(s.student_name)} · ${E(s.student_code)}</div><div class="detail">${E(s.exam_title)} · ${s.page_count} páginas · ${E(s.created_at)}</div></div><div class="right">${labelStatus(s.status)}<button class="btn smallbtn secondary" data-action="open-sub" data-id="${s.id}">Ver original</button></div></div>`).join('')}</div>`:empty('Todavía no hay entregas.')}</section>`;
}
async function viewCorrections(){
 await listSubs();
 S.gradebook=await API('/api/gradebook');
 if(S.subId&&!S.submissions.some(x=>x.id===Number(S.subId)))S.subId=null;
 if(!S.subId&&S.submissions.length)S.subId=S.submissions[0].id;
 S.subDetails=S.subId?await API('/api/submissions/'+S.subId):null;
 $('#main').innerHTML=`${intro('El visor enlaza cada pregunta con sus páginas originales y la transcripción. La nota de la IA es provisional: puede corregir la lectura manuscrita, modificar la calificación y documentar la validación.')}
 ${S.submissions.length?`<section class="panel"><div class="formrow"><div class="field grow"><label>Entrega a revisar</label><select id="review-select">${opt(S.submissions,S.subId,x=>x.student_name+' — '+x.exam_title+' ('+x.status+')')}</select></div>
 ${S.subDetails?labelStatus(S.subDetails.submission.status):''}</div></section>`:empty('No hay entregas. Suba un examen en la sección Entregas escaneadas.')}
 ${S.subDetails?renderReview(S.subDetails):''}
 ${renderGradebook(S.gradebook)}`;
}
function renderGradebook(book){
 const rows=book?.exams||[];
 return `<section class="panel"><div class="subhead"><h2>Registro consolidado de evaluaciones</h2><button class="btn secondary" data-action="export-gradebook">Exportar CSV</button></div>
 <p class="small">Se muestran notas finales únicamente cuando todas las preguntas del examen están validadas. El desglose por CE reúne las preguntas de exámenes validados, sin sustituir el cálculo de la evaluación global definido por la programación didáctica.</p>
 ${rows.length?`<div class="table-wrap"><table><thead><tr><th>Curso</th><th>Módulo</th><th>Alumno/a</th><th>Examen</th><th>Validación</th><th>Nota / 10</th></tr></thead>
 <tbody>${rows.map(r=>`<tr><td>${E(r.academic_year)}</td><td>${E(r.module_name)}</td><td>${E(r.student_name)} <span class="small">${E(r.student_code)}</span></td><td>${E(r.exam_title)}</td><td>${labelStatus(r.status)}<div class="small">${r.validated_questions}/${r.question_count} preguntas</div></td><td><strong>${r.out_of_ten??'Pendiente'}</strong></td></tr>`).join('')}</tbody></table></div>`:empty('No hay evaluaciones registradas.')}
 ${(book?.criteria||[]).length?`<details style="margin-top:17px"><summary>Ver desglose de puntos por RA y CE (${book.criteria.length} registros)</summary><div class="table-wrap"><table><thead><tr><th>Alumno/a</th><th>Módulo</th><th>RA</th><th>CE</th><th>Puntos</th><th>Preguntas evaluadas</th></tr></thead><tbody>
 ${book.criteria.map(r=>`<tr><td>${E(r.student_name)}</td><td>${E(r.module_name)}</td><td>${E(r.outcome_code)}</td><td>${E(r.criterion_code)}</td><td>${r.scored} / ${r.maximum}</td><td>${r.evaluated_questions}</td></tr>`).join('')}</tbody></table></div></details>`:''}</section>`;
}

function renderReview(item){
 const {submission:s,pages,corrections,unassigned,sources}=item;
 const cur=pages[S.pageIndex]||pages[0];
 return `<div class="viewer-layout"><section class="panel viewer-panel"><div class="subhead"><h2>Original escaneado</h2><span class="badge">${pages.length} páginas</span></div>
 <p class="small">${E(s.student_name)} · ${E(s.exam_title)}</p>
 ${cur?`<div class="pagepreview"><img id="large-page" src="/api/pages/${cur.id}/image" alt="Página ${cur.page_number} del examen" title="Pulse para ampliar"></div>
 <div class="thumbnails">${pages.map((p,i)=>`<button type="button" class="thumb ${i===S.pageIndex?'selected':''}" data-action="select-page" data-index="${i}"><img src="/api/pages/${p.id}/image" loading="lazy" alt="Miniatura ${p.page_number}"><small>p. ${p.page_number}</small></button>`).join('')}</div>`:empty('No se han registrado páginas.')}
 <h3>Archivos originales conservados</h3><div class="itemlist">${sources.map(f=>`<div class="item"><div><b>${E(f.original_name)}</b><div class="small">${f.page_count} página(s) · SHA-256: ${E(f.sha256.slice(0,15))}…</div></div><a class="btn smallbtn secondary" href="/api/source/${f.id}">Original</a></div>`).join('')}</div>
 <div class="actions"><a class="btn secondary" target="_blank" href="/print/report/${s.id}">Informe imprimible</a><button type="button" class="btn mutedbtn" data-action="show-audit" data-id="${s.id}">Auditoría</button></div><div id="audit-info"></div></section>
 <section class="panel"><div class="subhead"><h2>Corrección por preguntas</h2>${labelStatus(s.status)}</div>
 <div class="hint">La transcripción se hace página a página teniendo a la vista la anterior. Una respuesta que continúa en la siguiente hoja debe mantener el mismo número de pregunta; cualquier texto sin asignación se mostrará abajo.</div>
 <div class="actions"><button class="btn" data-action="transcribe" data-id="${s.id}">${s.current_run_id?'Volver a transcribir con IA':'Transcribir manuscritos con IA'}</button>
 <button class="btn secondary" data-action="grade" data-id="${s.id}" ${!s.current_run_id?'disabled':''}>Corregir con IA y rúbricas</button></div>
 <p class="small">La transcripción y corrección requieren conexión con la API seleccionada. Repetir un análisis puede generar costes adicionales y reiniciar la revisión del examen.</p>
 ${corrections.map(r=>`<article class="answer"><h3>Pregunta ${r.number} · ${E(r.outcome_code)} / ${E(r.criterion_code)}</h3>
 <p>${E(r.prompt)}</p><div class="two-score"><span>Máximo: <strong>${r.points} puntos</strong></span>
 <span>IA: <strong>${r.ai_score===null?'Sin corregir':r.ai_score}</strong></span><span>Docente: <strong>${r.teacher_score===null?'Pendiente':r.teacher_score}</strong></span>
 ${r.needs_review?'<span class="badge orange">Revisión recomendada</span>':''}</div>
 <p class="small">Páginas asignadas: ${r.page_numbers.length?r.page_numbers.map(n=>`<button class="btn smallbtn mutedbtn" data-action="select-page" data-index="${n-1}">${n}</button>`).join(' '):'No identificadas'}</p>
 <form class="edit-transcription" data-cid="${r.id}"><div class="field"><label>Transcripción (editable)</label><textarea name="transcription" rows="4">${E(r.transcription)}</textarea></div>
 <div class="actions"><button type="submit" class="btn mutedbtn smallbtn">Guardar transcripción corregida</button></div></form>
 ${(r.source_refs||[]).length?`<div class="small">Fuente del enunciado: ${r.source_refs.map(s=>`${E(s.filename)} · ${E(s.location_kind)} ${E(s.location_number)}`).join(' · ')}</div>`:''}
 ${r.ai_feedback?`<p><strong>Justificación de IA:</strong> ${E(r.ai_feedback)}</p>`:''}
 ${r.rubric_result.length?`<div class="section-title">Aplicación de rúbrica</div>${r.rubric_result.map(a=>`<div class="rubric-item"><strong>${E(a.criterion||'Indicador')}: ${E(a.points)} / ${E(a.max_points)}</strong><p>${E(a.justification||'')}</p>${a.evidence?`<span class="small">Evidencia: «${E(a.evidence)}»</span>`:''}${a.evidence_warning?`<p class="small">⚠ ${E(a.evidence_warning)}</p>`:''}</div>`).join('')}`:''}
 <form class="validate" data-cid="${r.id}"><div class="formrow"><div class="field"><label>Nota validada (máx. ${r.points})</label><input class="score-input" type="number" name="score" min="0" max="${r.points}" step=".01" required value="${r.teacher_score??r.ai_score??''}"></div>
 <div class="field grow"><label>Justificación o comentario docente</label><input name="comment" value="${E(r.teacher_comment)}" placeholder="Obligatoria si modifica la nota de IA"></div><button type="submit" class="btn secondary">Validar nota</button></div></form>
 ${r.status==='validated'?'<p class="badge green">✓ Pregunta validada</p>':''}</article>`).join('')||empty('Primero transcriba las páginas con IA para identificar las respuestas.')}
 ${unassigned.length?`<div class="hint warning"><b>Fragmentos sin asignar — revisión obligatoria</b>${unassigned.map(u=>`<p>Pág. ${u.page_number}: ${E(u.text)}</p>`).join('')}</div>`:''}
 <div class="actions"><a class="btn" href="/print/report/${s.id}" target="_blank">Generar informe justificativo</a></div></section></div>`;
}
async function viewEvaluation(){
 const [modules]=await Promise.all([listModules(),listExams()]);
 if(!modules.length){$('#main').innerHTML=empty('Primero cree un módulo desde Programaciones.');return;}
 S.evaluationModuleId=S.evaluationModuleId||S.moduleId||modules[0].id;
 const x=await API('/api/evaluation?module_id='+encodeURIComponent(S.evaluationModuleId));S.evalData=x;
 const students=x.students||[],criteria=x.criteria||[],units=x.units||[],instruments=x.instruments||[],policy=x.settings;
 const cefmt=c=>`${c.ra_code} · ${c.code} — ${c.description.slice(0,80)}`;
 const rowsCE=criteria.map(c=>`<label class="checkbox-card"><input type="checkbox" name="criteria_ids" value="${c.id}"><span><strong>${E(c.ra_code)} · ${E(c.code)}</strong><span class="small">${E(c.description)}</span></span></label>`).join('');
 const options=criteria.map(c=>`<div class="eval-target"><label><input type="checkbox" name="target_${c.id}"> ${E(c.ra_code)} / ${E(c.code)}</label><label>Peso instrumento en este CE (%) <input type="number" name="weight_${c.id}" min=".01" max="100" step=".01" value="100"></label></div>`).join('');
 const examChoices=(S.exams||[]).filter(e=>Number(e.module_id)===Number(S.evaluationModuleId));
 $('#main').innerHTML=`${intro('Cuaderno de evaluación por unidades, trimestres, RA y CE. Integra correcciones validadas de exámenes, calificaciones manuales y notas importadas desde CSV. Ninguna nota final se publica si las ponderaciones o evidencias son incompletas.')}
 <section class="panel"><div class="formrow"><div class="field grow"><label>Módulo profesional</label><select id="evaluation-module">${opt(modules,S.evaluationModuleId,m=>m.name+' · '+m.academic_year)}</select></div><span class="badge">${students.length} alumnos · ${units.length} unidades · ${instruments.length} instrumentos</span></div></section>
 ${x.warnings.length?`<section class="hint warning"><strong>Incidencias que impiden calcular una calificación definitiva</strong><ul>${x.warnings.map(w=>`<li>${E(w)}</li>`).join('')}</ul></section>`:''}
 <section class="panel"><h2>1. Criterios de calificación y tratamiento de la formación en empresa</h2>
 <p class="small">La programación de ejemplo indica cinco RA al 20 % y un 25 % adicional de empresa: esto suma 125 %. Debe validarse una interpretación o corregirse formalmente la programación. Esta pantalla nunca modifica automáticamente los pesos originales.</p>
 <form id="eval-policy"><div class="formgrid"><div class="field"><label>Tratamiento de empresa</label><select name="enterprise_mode">
 <option value="unresolved" ${policy.enterprise_mode==='unresolved'?'selected':''}>Pendiente de aclarar</option>
 <option value="integrated" ${policy.enterprise_mode==='integrated'?'selected':''}>Evidencias de empresa integradas en RA</option>
 <option value="separate" ${policy.enterprise_mode==='separate'?'selected':''}>Empresa con porcentaje final independiente</option></select></div>
 <div class="field"><label>Peso FE independiente (%)</label><input name="enterprise_weight" type="number" min="0" max="100" step=".01" value="${E(policy.enterprise_weight)}"></div>
 <div class="field"><label>Nota mínima CE superado</label><input name="criterion_pass_mark" type="number" min="0" max="10" step=".1" value="${E(policy.criterion_pass_mark)}"></div>
 <div class="field"><label>% mínimo de CE superados para RA</label><input name="ra_min_criteria_pct" type="number" min="0" max="100" step="1" value="${E(policy.ra_min_criteria_pct)}"></div></div>
 <div class="field"><label>Justificación de la interpretación adoptada</label><textarea name="teacher_note" placeholder="Acuerdo o modificación de programación revisada por el equipo docente">${E(policy.teacher_note)}</textarea></div>
 <label><input name="validated" type="checkbox" ${policy.validated?'checked':''}> Confirmo, como docente, esta política de cálculo</label>
 <div class="actions"><button class="btn" type="submit">Guardar política</button></div></form></section>
 <div class="grid2"><section class="panel"><h2>2. Unidades de evaluación</h2>
 <form id="eval-unit"><div class="formgrid"><div class="field"><label>Código</label><input name="code" required placeholder="UD01"></div>
 <div class="field"><label>Unidad / situación de aprendizaje</label><input name="title" required placeholder="Diario y mayor"></div>
 <div class="field"><label>Trimestre</label><select name="term"><option value="1">1.ª evaluación</option><option value="2">2.ª evaluación</option><option value="3">3.ª evaluación</option></select></div></div>
 <div class="section-title">CE trabajados (pueden estar en varias unidades)</div><div class="eval-scroll">${rowsCE||empty('Primero añada RA y CE.')}</div>
 <button class="btn secondary" type="submit">Crear unidad</button></form>
 ${units.length?`<div class="itemlist" style="margin-top:12px">${units.map(u=>`<div class="item"><b>${E(u.code)} · ${E(u.title)}</b><span class="badge">${u.term}.ª eval. · ${u.criteria_ids.length} CE</span></div>`).join('')}</div>`:''}</section>
 <section class="panel"><h2>3. Instrumentos de calificación</h2>
 <form id="eval-instrument"><div class="formgrid"><div class="field"><label>Nombre del instrumento</label><input required name="title" placeholder="Práctica de asientos"></div>
 <div class="field"><label>Tipo</label><select name="kind">${['examen','practica','problemas','portfolio','proyecto','observacion','empresa','externo'].map(k=>`<option value="${k}">${E(k)}</option>`).join('')}</select></div>
 <div class="field"><label>Evaluación</label><select name="term"><option value="1">1.ª</option><option value="2">2.ª</option><option value="3">3.ª</option></select></div>
 <div class="field"><label>Unidad (opcional)</label><select name="unit_id"><option value="">Sin vincular</option>${opt(units,'',u=>u.code+' · '+u.title)}</select></div>
 <div class="field"><label>Examen generado (si existe)</label><select name="exam_id"><option value="">Sin vincular</option>${opt(examChoices,'',e=>e.title+' · '+e.variant_label)}</select></div></div>
 <div class="section-title">CE evaluados y peso de este instrumento dentro de cada CE</div>
 <div class="eval-scroll">${options||empty('Primero configure los criterios.')}</div>
 <p class="small">Los porcentajes de todos los instrumentos de un mismo CE deben sumar 100 %. P. ej., prueba escrita 60 %, portfolio 40 %.</p>
 <button class="btn secondary" type="submit">Crear instrumento</button></form></section></div>
 <section class="panel"><h2>4. Libro de notas e importaciones</h2>
 ${instruments.length?`<div class="field" style="max-width:600px"><label>Instrumento a calificar</label><select id="eval-instrument-select">${opt(instruments,S.evalInstrumentId||instruments[0].id,i=>i.term+'ª · '+i.title+' ('+i.kind+')')}</select></div>`:empty('Cree un instrumento para introducir calificaciones.')}
 <div id="eval-scores"></div></section>
 <section class="panel"><h2>5. Resultados por evaluación, RA y CE</h2>
 <p class="small">Las notas trimestrales son instantáneas provisionales de los instrumentos de cada período; las notas finales requieren evidencias completas, pesos correctos y validación de la política.</p>
 <div class="table-wrap"><table><thead><tr><th>Alumno/a</th><th>1.ª</th><th>2.ª</th><th>3.ª</th><th>RA</th><th>Nota final calculable</th></tr></thead><tbody>${students.map(st=>`<tr><td><b>${E(st.name)}</b><div class="small">${E(st.code)}</div></td>
 ${st.terms.map(t=>`<td>${t.score??'—'} <small>${t.completed}/${t.expected}</small></td>`).join('')}
 <td>${st.outcomes.map(ra=>`<div class="small">${E(ra.code)}: ${ra.score??'—'} ${ra.passed?'✓':''}</div>`).join('')}</td>
 <td>${st.closure?.current?`<span class="badge green">Validada: ${st.closure.score}/10</span>`:
 st.closure?'<span class="badge orange">Cierre desactualizado</span>':
 st.final_score===null?'<span class="badge orange">Pendiente</span>':`<strong>${st.final_score} / 10</strong><div class="small">Antes del cierre docente</div>`}
 <div class="actions"><a class="btn smallbtn secondary" href="/api/evaluation/${S.evaluationModuleId}/student/${st.student_id}.pdf">Informe PDF</a>
 ${st.final_score!==null?`<button type="button" class="btn smallbtn" data-action="eval-close" data-id="${st.student_id}">Validar cierre</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>
 <div class="actions" style="flex-wrap:wrap"><button class="btn secondary" data-action="export-evaluation" type="button">Resultados CSV</button>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/xlsx">Excel completo (.xlsx)</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/xls">Excel clásico (.xls)</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-alumnos.xlsx">Additio: importar grupo Excel</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-alumnos.csv">Grupo CSV</a>
 <a class="btn" href="/api/evaluation/${S.evaluationModuleId}/export/additio-configuracion.zip">Additio: configurar RA y CE (ZIP)</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-ra.xlsx">RA: hoja de configuración</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-ce.xlsx">CE: importar desde Excel</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-ce-detalle.xlsx">RA/CE: ponderaciones y relaciones</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-notas.xlsx">Additio: notas RA/CE Excel</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-notas.csv">Additio: notas RA/CE CSV</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-seguimiento.csv">RA/CE seguimiento provisional CSV</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-estado.csv">Estado de validación (separado)</a>
 <a class="btn secondary" href="/api/evaluation/${S.evaluationModuleId}/export/additio-pegar.tsv">Additio: copiar/pegar TSV</a></div>
 <p class="small">Para Additio se exportan exclusivamente las calificaciones curriculares RA/CE, sin columnas de exámenes, portfolios ni instrumentos. El paquete de configuración contiene el listado de RA (alta revisada por docente), los CE en el formato de una columna y una tabla de ponderaciones. Las notas definitivas solo se exportan con cierre docente vigente; el archivo de seguimiento provisional está identificado por separado. Compruebe el orden de alumnos y los códigos en Additio antes de trasladar las calificaciones.</p></section>`;
 S.evalInstrumentId=S.evalInstrumentId||instruments[0]?.id||null;
 renderEvalScores();
}
function renderEvalScores(){
 const x=S.evalData, iid=Number(S.evalInstrumentId);if(!x)return;
 const instrument=x.instruments.find(i=>i.id===iid),area=$('#eval-scores');if(!area)return;
 if(!instrument){area.innerHTML=empty('Seleccione un instrumento.');return;}
 const ces=instrument.targets.map(t=>x.criteria.find(c=>c.id===t.criterion_id)).filter(Boolean);
 area.innerHTML=`<div class="actions"><button class="btn secondary" type="button" data-action="download-eval-template">Descargar plantilla CSV</button>
 ${instrument.exam_id?`<button class="btn secondary" type="button" data-action="sync-eval-exam" data-id="${instrument.id}">Importar notas validadas del examen</button>`:''}</div>
 <form id="eval-import" class="formrow" style="margin:15px 0"><input type="hidden" name="instrument_id" value="${iid}"><div class="field grow"><label>Importar notas CSV (codigo_alumno;criterio;nota;comentario)</label><input type="file" name="csv" accept=".csv,text/csv" required></div><button type="submit" class="btn secondary">Importar CSV</button></form>
 <div class="table-wrap"><table><thead><tr><th>Alumno</th>${ces.map(c=>`<th>${E(c.ra_code)} · ${E(c.code)}</th>`).join('')}</tr></thead><tbody>
 ${x.students.map(st=>`<tr><td><strong>${E(st.name)}</strong><div class="small">${E(st.code)}</div></td>${ces.map(c=>{
 const rec=x.scores.find(r=>r.student_id===st.student_id&&r.instrument_id===iid&&r.criterion_id===c.id);
 return `<td><div class="formrow"><input class="eval-score-input" type="number" min="0" max="10" step=".01" data-student="${st.student_id}" data-criterion="${c.id}" value="${rec?E(rec.score):''}" placeholder="—"><button type="button" class="btn smallbtn secondary" data-action="eval-save-score" data-student="${st.student_id}" data-criterion="${c.id}" data-instrument="${iid}">Guardar</button></div><div class="small">${rec?E(rec.origin)+' · '+E(rec.comment||''):''}</div></td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;
}
async function viewSettings(){
 const a=await API('/api/settings');S.aiSettings=a;
 $('#main').innerHTML=`${intro('OpenAI o API compatible. Datos, SQLite y originales guardados localmente; en modo USB todas las rutas se guardan relativas al dispositivo.')}
 <section class="panel"><h2>Proveedor de IA</h2><form id="save-settings"><div class="formgrid">
 ${[['provider','Proveedor (etiqueta)'],['base_url','URL base de API'],['model_analysis','Modelo: análisis de programación'],['model_generation','Modelo: generación'],['model_vision','Modelo: visión manuscrita'],['model_correction','Modelo: corrección']].map(([key,label])=>`<div class="field"><label>${label}</label><input name="${key}" required value="${E(a[key])}"></div>`).join('')}</div>
 <div class="field" style="margin-top:12px;max-width:650px"><label>Nueva clave API (dejar en blanco para conservarla)</label><input type="password" name="api_key" autocomplete="new-password" placeholder="${a.api_key_saved?'Clave previamente guardada':'Introduzca su clave'}"></div>
 ${a.portable?`<div class="field" style="max-width:650px"><label>Contraseña maestra para cifrar una NUEVA clave API (mín. 12 caracteres)</label><input type="password" name="master_password" autocomplete="new-password" placeholder="No se conserva en el dispositivo"></div>`:''}
 <div class="actions"><button class="btn" type="submit">Guardar configuración</button><span class="badge ${a.api_key_unlocked?'green':'orange'}">${a.api_key_unlocked?'API desbloqueada':a.api_key_saved?'API cifrada: bloqueada':'Clave no configurada'}</span></div></form>
 ${a.portable?`<div class="hint">La clave se conserva cifrada con AES-256-GCM y una contraseña maestra mediante scrypt, no mediante hash. Introduzca la contraseña cada vez que inicie el programa en otro equipo. No se guarda ni en HTML ni en SQLite.</div>
 <form id="unlock-api" class="formrow"><div class="field grow"><label>Desbloquear clave guardada en este pendrive</label><input type="password" name="master_password" autocomplete="off" required></div><button class="btn secondary" type="submit">Desbloquear</button><button class="btn mutedbtn" type="button" data-action="lock-api">Bloquear</button></form>`:
 `<p class="hint">En una instalación fija, la clave se conserva en el gestor de credenciales de Windows (cuando esté disponible); no se copia automáticamente al USB.</p>`}</section>
 <div class="grid2"><section class="panel"><h2>Almacenamiento ${a.portable?'PORTÁTIL (USB)':'local'}</h2>
 <p><strong>Ejecutable / proyecto</strong></p><pre class="path">${E(a.app_dir)}</pre>
 <p><strong>SQLite</strong></p><pre class="path">${E(a.data_dir)}${E('/datos/evaluafp.sqlite3')}</pre>
 <p><strong>Originales</strong></p><pre class="path">${E(a.data_dir)}${E('/almacen')}</pre>
 <p><strong>Copias de seguridad</strong></p><pre class="path">${E(a.backup_dir)}</pre>
 <form id="change-storage"><div class="field"><label>Carpeta de datos (en USB, ruta relativa al EXE)</label><input required name="data_dir" value="${E(a.data_dir_edit)}"></div>
 <div class="field"><label>Carpeta de copias de seguridad</label><input required name="backup_dir" value="${E(a.backup_dir_edit)}"></div>
 <div class="actions"><button class="btn secondary" type="submit">Migrar datos y cambiar carpetas</button></div></form>
 <p class="small">El cambio copia documentos y SQLite, actualiza las rutas guardadas y exige reiniciar EvalúaFP. Los archivos antiguos se conservan como medida de seguridad.</p>
 <div class="actions"><a class="btn secondary" href="/api/backup">Crear copia ZIP en la carpeta elegida y descargarla</a></div>
 <p class="small">En modo USB, la copia incluye la clave API solo en su formato cifrado, nunca la contraseña maestra.</p></section>
 <section class="panel"><h2>Seguridad de los datos del alumnado</h2>
 <p>El programa no requiere Internet para consultar las notas, exámenes o SQLite. Las solicitudes de IA sí transmitirán los textos o imágenes necesarios al proveedor elegido.</p>
 <div class="hint warning">Un pendrive convencional no protege la base SQLite ni los PDF ante robo o extravío. Utilice un dispositivo USB con cifrado de unidad (por ejemplo, BitLocker To Go) y realice copias en otra ubicación segura.</div>
 <p>Evite desconectar el pendrive mientras EvalúaFP esté abierto. Las notas propuestas por IA exigen siempre validación humana.</p></section></div>`;
}
function downloadText(value,name,mime){const url=URL.createObjectURL(new Blob([value],{type:mime}));
 const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function formObject(form){return Object.fromEntries(new FormData(form).entries());}
async function doSubmit(form){
 const id=form.id;
 if(id==='change-storage'){
   if(!confirm('Se copiarán SQLite y los originales a la nueva carpeta. Es necesario cerrar y volver a abrir la aplicación después. ¿Continuar?'))return;
   const result=await busy(()=>API('/api/storage/change','POST',formObject(form)),'Carpetas migradas; reinicie EvalúaFP.');
   if(result?.restart_required)alert('La migración ha finalizado. Cierre EvalúaFP y vuelva a abrirlo. No borre los datos antiguos hasta comprobar todo.');
   return;
 }
 if(id==='unlock-api'){
   const result=await busy(()=>API('/api/settings/unlock','POST',formObject(form)),'Clave API desbloqueada.');
   if(result)await page('ajustes');return;
 }
 if(id==='eval-policy'){
   const body=formObject(form);body.module_id=S.evaluationModuleId;body.validated=form.elements.validated.checked;
   const result=await busy(()=>API('/api/evaluation/policy','POST',body),'Política de evaluación guardada.');
   if(result)await page('evaluacion');return;
 }
 if(id==='eval-unit'){
   const body=formObject(form);body.module_id=S.evaluationModuleId;
   body.criteria_ids=[...form.querySelectorAll('input[name=criteria_ids]:checked')].map(e=>Number(e.value));
   const result=await busy(()=>API('/api/evaluation/unit','POST',body),'Unidad creada.');
   if(result)await page('evaluacion');return;
 }
 if(id==='eval-instrument'){
   const body=formObject(form);body.module_id=S.evaluationModuleId;
   body.targets=S.evalData.criteria.filter(c=>form.elements['target_'+c.id]?.checked).map(c=>({criterion_id:c.id,weight:Number(form.elements['weight_'+c.id].value)}));
   if(!body.unit_id)delete body.unit_id;if(!body.exam_id)delete body.exam_id;
   const result=await busy(()=>API('/api/evaluation/instrument','POST',body),'Instrumento creado.');
   if(result){S.evalInstrumentId=result.id;await page('evaluacion');}return;
 }
 if(id==='eval-import'){
   const result=await busy(()=>API('/api/evaluation/import','POST',new FormData(form)),'Calificaciones importadas y registradas.');
   if(result)await page('evaluacion');return;
 }
 if(id==='create-module'){
 const result=await busy(()=>API('/api/modules','POST',formObject(form)),'Módulo creado.');
 if(result){S.moduleId=result.id;S.proposal=null;await page('programaciones');}return;}
 if(id==='create-student'){
 const result=await busy(()=>API('/api/students','POST',formObject(form)),'Alumno registrado.');
 if(result)await page('programaciones');return;}
 if(id==='create-outcome'||id==='create-criterion'){
 let b=formObject(form);if(id==='create-outcome')b.module_id=S.moduleId;
 const result=await busy(()=>API('/api/'+(id==='create-outcome'?'outcomes':'criteria'),'POST',b),'Criterio actualizado.');
 if(result)await page('programaciones');return;}
   if(id==='upload-material'){
    const result=await busy(()=>API('/api/materials/upload','POST',new FormData(form)),'Material documental incorporado.');
    if(result){toast(result.created.length+' archivos y '+result.created.reduce((n,x)=>n+x.passages,0)+' pasajes registrados.');await page('programaciones');}return;}
 if(id==='upload-program'){
 const result=await busy(()=>API('/api/programmings/upload','POST',new FormData(form)),'Programación original guardada.');
 if(result){toast('Texto extraído: '+result.characters+' caracteres.');await page('programaciones');}return;}
 if(id==='apply-proposal'){
 let parsed;
 try{parsed=JSON.parse(form.querySelector('[name=outcomes_json]').value)}catch(e){toast('JSON no válido: '+e.message,true);return;}
 const result=await busy(()=>API('/api/programmings/apply','POST',{module_id:S.moduleId,outcomes:parsed}),'RA y CE confirmados.');
 if(result){S.proposal=null;await page('programaciones');}return;}
 if(id==='manual-exam'){
   let q;
   try{q=JSON.parse(form.elements.questions_json.value);}catch(ex){toast('Preguntas JSON no válidas: '+ex.message,true);return;}
   const result=await busy(()=>API('/api/exams/manual','POST',{
      module_id:Number(form.elements.module_id.value),title:form.elements.title.value,questions:q,
      center_name:form.elements.center_name.value,duration_minutes:Number(form.elements.duration_minutes.value)
   }),'Examen manual archivado.');
   if(result){S.examId=result.id;await page('examenes');}return;
 }
 if(id==='generate-exam'){
 const f=formObject(form);
 f.criteria_ids=[...form.querySelectorAll('[name=criteria_ids]:checked')].map(i=>Number(i.value));
 if(!f.criteria_ids.length){toast('Seleccione al menos un criterio de evaluación.',true);return;}
   if(S.modules.length){
     const detail=await API('/api/modules/'+Number(f.module_id));
     if((detail.materials||[]).some(m=>m.active)){
       if(!confirm('Se enviarán PASAJES de los materiales didácticos del módulo al proveedor de IA seleccionado. Confirme que dispone de los permisos y condiciones de uso adecuados. ¿Autoriza el envío?'))return;
       f.authorize_external_transfer=true;
     }
   }
   toast('Generando el banco ampliado y los modelos de examen. Puede requerir varias solicitudes a la IA.');
 const result=await busy(()=>API('/api/exams/generate','POST',f), 'Generados '+f.model_count+' modelo(s) y banco de preguntas.');
 if(result){S.examId=result.id;await page('examenes');}return;}
 if(id==='upload-submission'){
 const f=new FormData();const d=formObject(form);
 f.append('exam_id',d.exam_id);f.append('student_id',d.student_id);
 S.queue.forEach(file=>f.append('pages',file,file.name));
 toast('Importando originales y creando páginas de lectura.');
 const result=await busy(()=>API('/api/submissions/upload','POST',f),'Entrega archivada con originales.');
 if(result){S.queue=[];S.subId=result.id;S.pageIndex=0;await page('correcciones');}return;}
 if(id==='upload-batch'){
 const f=new FormData(form);
 toast('Comprobando códigos del ZIP e importando exámenes...');
 let result;
 try{result=await API('/api/submissions/batch','POST',f);}
 catch(e){
   if(e.code!=='MISSING_STUDENTS'){toast(e.message,true);return;}
   const missing=e.missing_students||[];
   const created=await promptNewStudents(e.module_id,missing);
   if(!created){toast('Importación cancelada. No se ha importado ningún examen.',true);return;}
   // El File del ZIP permanece en FormData: no exige volver a seleccionarlo.
   try{result=await API('/api/submissions/batch','POST',f);}
   catch(retryError){toast(retryError.message,true);return;}
 }
 if(result){toast(result.created.length+' alumnos y '+result.created.reduce((n,x)=>n+x.pages,0)+' páginas registradas.');await page('entregas');}return;}
 if(id==='save-settings'){
 const body=formObject(form);if(!body.api_key)delete body.api_key;
 const result=await busy(()=>API('/api/settings','POST',body),'Configuración guardada.');
 if(result){if(result.api_key_persistent===false)toast('La clave solo permanecerá en memoria durante esta sesión.');await page('ajustes');}return;}
 if(form.classList.contains('edit-transcription')){
 const result=await busy(()=>API('/api/corrections/transcription','POST',{
 correction_id:Number(form.dataset.cid),transcription:form.elements.transcription.value}),'Transcripción corregida; deberá repetirse la evaluación IA.');
 if(result)await page('correcciones');return;}
 if(form.classList.contains('validate')){
 const result=await busy(()=>API('/api/corrections/validate','POST',{
 correction_id:Number(form.dataset.cid),score:Number(form.elements.score.value),comment:form.elements.comment.value}), 'Calificación validada por el docente.');
 if(result)await page('correcciones');return;}
}
document.addEventListener('submit',event=>{
 if(event.target.matches('form')){event.preventDefault();doSubmit(event.target).catch(e=>toast(e.message,true));}
});
document.addEventListener('change',async event=>{
 const el=event.target;
 if(el.id==='module-select'){S.moduleId=el.value;S.proposal=null;await page('programaciones');}
 if(el.id==='evaluation-module'){S.evaluationModuleId=Number(el.value);S.evalInstrumentId=null;await page('evaluacion');}
 if(el.id==='eval-instrument-select'){S.evalInstrumentId=Number(el.value);renderEvalScores();}
 if(el.id==='exam-module'){S.examModuleId=el.value;await page('examenes');}
 if(el.id==='upload-exam'){S.uploadExamId=el.value;S.uploadStudentId=null;S.queue=[];await page('entregas');}
 if(el.id==='review-select'){S.subId=el.value;S.pageIndex=0;await page('correcciones');}
 if(el.id==='upload-pages'||el.id==='upload-camera'){
  S.queue.push(...[...el.files]);await page('entregas');
 }
 if(el.classList.contains('ra-checkbox')){
  $all(`[name=criteria_ids][data-parent="${el.dataset.ra}"]`).forEach(x=>x.checked=el.checked);
 }
});
document.addEventListener('click',async event=>{
 const tab=event.target.closest('[data-page]');if(tab){await page(tab.dataset.page);return;}
 if(event.target.id==='large-page'){event.target.classList.toggle('zoom');return;}
 const el=event.target.closest('[data-action]');if(!el)return;
 const action=el.dataset.action;const id=Number(el.dataset.id);const index=Number(el.dataset.index);
 if(action==='lock-api'){
  const result=await busy(()=>API('/api/settings/lock','POST',{}),'Clave API bloqueada.');if(result)await page('ajustes');return;
 }
 if(action==='eval-close'){
   const reason=prompt('Escriba la justificación docente del cierre de esta nota final (mínimo 10 caracteres):',
                       'Calificación final revisada de acuerdo con las evidencias, RA, CE y ponderaciones validadas.');
   if(reason===null)return;
   const result=await busy(()=>API('/api/evaluation/close','POST',{module_id:S.evaluationModuleId,
                         student_id:id,justification:reason}),'Calificación final cerrada y registrada.');
   if(result)await page('evaluacion');return;
 }
 if(action==='eval-save-score'){
   const student=Number(el.dataset.student),criterion=Number(el.dataset.criterion),instrument=Number(el.dataset.instrument);
   const field=document.querySelector(`input.eval-score-input[data-student="${student}"][data-criterion="${criterion}"]`);
   if(!field||field.value===''){toast('Introduzca una nota entre 0 y 10.',true);return;}
   const comment=prompt('Comentario justificativo de la calificación (opcional):','');if(comment===null)return;
   const result=await busy(()=>API('/api/evaluation/score','POST',{student_id:student,criterion_id:criterion,
                      instrument_id:instrument,score:Number(field.value),comment}),'Nota registrada.');
   if(result)await page('evaluacion');return;
 }
 if(action==='sync-eval-exam'){
  if(!confirm('Se incorporarán únicamente las correcciones ya validadas por el docente. ¿Continuar?'))return;
  const result=await busy(()=>API('/api/evaluation/sync-exam','POST',{instrument_id:id}),'Notas de examen sincronizadas.');
  if(result){toast('Importadas '+result.imported+' evidencias, omitidas '+result.skipped+'.');await page('evaluacion');}return;
 }
 if(action==='download-eval-template'){
  const ins=S.evalData.instruments.find(i=>i.id===Number(S.evalInstrumentId));
  if(!ins)return;
  const csv='\ufeffcodigo_alumno;criterio;nota;comentario\r\n'+S.evalData.students.flatMap(st=>ins.targets.map(t=>{
    const c=S.evalData.criteria.find(c=>c.id===t.criterion_id);return `${st.code};${c.code};;`;
  })).join('\r\n');
  downloadText(csv,'plantilla_notas_'+ins.id+'.csv','text/csv;charset=utf-8');return;
 }
 if(action==='export-evaluation'){
  const rows=[['Código','Alumno/a','1ª evaluación','2ª evaluación','3ª evaluación','Calificación global calculable','Estado']];
  for(const st of S.evalData.students)rows.push([st.code,st.name,...st.terms.map(t=>t.score??''),st.final_score??'',st.status]);
  downloadText('\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n'),
     'evaluacion_modulo_'+S.evaluationModuleId+'.csv','text/csv;charset=utf-8');return;
 }
 if(action==='view-bank'){
   const info=await API('/api/exam-batches/'+id);
   const content=info.questions.map((q,i)=>`${i+1}. [${q.criterion_code} · ${q.kind}${q.assigned_variant?' · Modelo '+q.assigned_variant:' · Reserva'}] ${q.prompt}`).join('\n\n');
   const blob=new Blob([`BANCO DE PREGUNTAS · ${info.batch.title}\nDificultad: ${info.batch.difficulty}\nModelos: ${info.batch.model_count}\nTotal: ${info.batch.bank_size}\n\n`+content],{type:'text/plain;charset=utf-8'});
   const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Banco_EvaluaFP_${id}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
   toast('Banco exportado con preguntas asignadas y de reserva.');return;
 }
 if(action==='export-gradebook'){
   const rows=[['Curso','Módulo','Código','Alumno/a','Examen','Estado','Nota 0-10']];
   for(const r of (S.gradebook?.exams||[]))rows.push([r.academic_year,r.module_name,r.student_code,r.student_name,r.exam_title,r.status,r.out_of_ten??'']);
   rows.push([]);rows.push(['Desglose por criterios']);rows.push(['Módulo','Código','Alumno/a','RA','CE','Puntos logrados','Puntos máximos']);
   for(const r of (S.gradebook?.criteria||[]))rows.push([r.module_name,r.student_code,r.student_name,r.outcome_code,r.criterion_code,r.scored,r.maximum]);
   const csv='\ufeff'+rows.map(row=>row.map(cell=>'"'+String(cell??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');
   const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=url;a.download='evaluafp_registro_evaluaciones.csv';a.click();URL.revokeObjectURL(url);return;
 }
 if(action==='create-upload-student'){
   const created=await promptNewStudents(Number(el.dataset.moduleId));
   if(created?.length){S.uploadStudentId=created[0].id;toast('Alumno registrado correctamente.');await page('entregas');}
   return;
 }
 if(action==='open-sub'){S.subId=id;S.pageIndex=0;await page('correcciones');return;}
 if(action==='open-exam'){S.examId=id;await page('examenes');return;}
 if(action==='select-page'){S.pageIndex=index;await page('correcciones');return;}
 if(action==='queue-up'||action==='queue-down'||action==='queue-remove'){
   if(action==='queue-remove')S.queue.splice(index,1);
   else{const j=index+(action==='queue-up'?-1:1);[S.queue[index],S.queue[j]]=[S.queue[j],S.queue[index]];}
   await page('entregas');return;}
 if(action==='toggle-material'){
   const active=event.target.dataset.active==='1';
   if(active&&!confirm('Desactivar este material permitirá generar exámenes sin utilizarlo. ¿Confirmar?'))return;
   const result=await busy(()=>API('/api/materials/active','POST',{module_id:S.moduleId,material_id:id,active:!active}),'Estado del material actualizado.');
   if(result)await page('programaciones');return;}
 if(action==='discard-proposal'){S.proposal=null;await page('programaciones');return;}
 if(action==='analyze-program'){
  toast('Analizando la programación. Verifique después los pesos propuestos.');
  const result=await busy(()=>API('/api/programmings/analyze','POST',{programming_id:id}),'RA y CE extraídos: pendiente de confirmación.');
  if(result){S.proposal=result;await page('programaciones');}return;}
 if(action==='edit-outcome'||action==='edit-criterion'){
   const isRa=action==='edit-outcome';
   const r=(isRa?S.moduleDetails.outcomes:S.moduleDetails.criteria).find(x=>x.id===id);
   const code=prompt('Código:',r.code);if(code===null)return;
   const description=prompt('Descripción:',r.description);if(description===null)return;
   const weight=prompt('Ponderación (%) — dejar en blanco si no consta:',r.weight??'');if(weight===null)return;
   const body={id,code,description,weight};
   if(isRa)body.module_id=S.moduleId;else body.outcome_id=r.outcome_id;
   const result=await busy(()=>API('/api/'+(isRa?'outcomes':'criteria'),'POST',body),'Ponderación y criterio guardados.');
   if(result)await page('programaciones');return;}
 if(action==='transcribe'||action==='grade'){
    if(!confirm('Se enviarán '+(action==='transcribe'?'las páginas escaneadas':'las respuestas transcritas')+' al proveedor de IA configurado. Confirme que el centro ha autorizado este tratamiento y que el proveedor es adecuado. ¿Continuar?'))return;
    if(action==='transcribe' && S.subDetails?.submission?.current_run_id && !confirm('Se creará una nueva transcripción y se invalidará la revisión actual. ¿Continuar?'))return;
    if(action==='grade' && S.subDetails?.submission?.status==='validated' && !confirm('Se perderán las validaciones actuales y se generarán nuevas propuestas. ¿Continuar?'))return;
    toast(action==='transcribe'?'Analizando imágenes en orden, con continuidad de respuestas.':'Corrigiendo cada pregunta con la rúbrica.');
    const result=await busy(()=>API('/api/submissions/'+(action==='transcribe'?'transcribe':'correct'),'POST',
      {submission_id:id,authorize_external_transfer:true}),action==='transcribe'?'Transcripción completa.':'Propuestas de calificación generadas.');
    if(result)await page('correcciones');return;}
 if(action==='show-audit'){
   const list=await busy(()=>API('/api/audit/'+id));
   if(!list)return;
   const holder=$('#audit-info');
   holder.innerHTML=`<h3>Historial de operaciones</h3><div class="itemlist">${list.map(a=>`<div class="item"><div><b>${E(a.action)}</b><div class="small">${E(a.at)} · ${E(a.entity)} #${E(a.entity_id)}</div><details><summary class="small">Detalles</summary><pre class="small">${E(a.details_json)}</pre></details></div></div>`).join('')}</div>`;
   return;}
});
startIntro();
page('inicio');
