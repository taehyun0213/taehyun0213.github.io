(() => {
  const original = window.SITE_CONTENT;
  if (!original) return;
  const storageKey = 'taehyun-homepage-content-draft-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  let data = clone(original), active = 'profile', dirty = false;
  const form = document.querySelector('#content-form'), status = document.querySelector('#status');
  const sections = {profile:'소개 · 연락처',research:'연구 관심 분야',featured_project:'ChromosoME',projects:'연구 프로젝트',publications:'논문 목록',appointments:'경력',education:'학력',service:'학술 봉사',recruitment:'학생 모집',labels:'메뉴 · 공통 문구'};
  const labels = {name:'이름 / 프로젝트명',korean_name:'한글 이름',email:'이메일',scholar:'Google Scholar 주소',faculty:'성균관대 교수 소개 주소',portrait:'프로필 사진 경로',role:'직책 / 프로젝트 역할',department:'학과',university:'대학교',location:'지역',headline:'큰 제목',intro:'소개 문구',bio:'소개 본문',title:'제목',text:'설명',eyebrow:'짧은 분류',extension:'진행 중인 확장 연구',image:'이미지 경로',image_alt:'이미지 대체 설명',credit:'이미지 출처',url:'논문 / 프로젝트 주소',tags:'키워드',category:'분류',year:'출판 연도',type:'논문 유형',authors:'저자',venue:'학술지 / 학회 · 권호 · 페이지',note:'비고',date:'기간 / 연도',place:'기관 / 소속',open:'학생 모집 표시',interests:'관심 분야 안내',skills:'배경 / 경험 안내',steps:'연락할 때 포함할 내용',subject:'문의 이메일 제목',en:'English',ko:'한국어'};
  const helps = {profile:'영문 홈페이지에 표시할 내용을 수정하세요. 사진은 assets/taehyun-kim.png 파일을 교체하면 됩니다.',publications:'논문 유형은 journal(학술지) 또는 conference(학회)입니다. 저자명과 논문 제목은 원문 표기를 유지하세요.',recruitment:'학생 모집 표시를 끄면 모집 배지가 사라집니다. 본문에서 연구 참여 안내는 계속 표시됩니다.',labels:'방문자 화면의 메뉴, 버튼, 공통 문구를 수정할 수 있습니다.'};
  const bilingualSample={en:'',ko:''};
  const timelineSample={date:'',title:bilingualSample,place:bilingualSample};
  const arraySamples={research:{title:bilingualSample,text:bilingualSample},projects:{name:bilingualSample,category:bilingualSample,text:bilingualSample,tags:[''],url:''},publications:{year:new Date().getFullYear(),type:'conference',title:'',authors:'',venue:'',url:'',note:''},appointments:timelineSample,education:timelineSample,service:bilingualSample,bio:bilingualSample,steps:bilingualSample,tags:''};
  function arraySample(sample,path) {return sample.length?sample[0]:arraySamples[path.at(-1)];}
  function fieldName(path) {return path.length ? path.map(key => typeof key==='number' ? `${key+1}번째 항목` : sections[key]||labels[key]||key).join(' → ') : 'content.json';}
  function fail(path,message) {const error=new Error(`${fieldName(path)}: ${message}`);error.path=path;throw error;}
  function validate(value,sample=original,path=[]) {
    if(Array.isArray(sample)) {
      if(!Array.isArray(value))fail(path,'목록 형식이어야 합니다.');
      value.forEach((item,index)=>validate(item,arraySample(sample,path),[...path,index]));return;
    }
    if(sample&&typeof sample==='object') {
      if(!value||typeof value!=='object'||Array.isArray(value))fail(path,'필요한 항목들이 포함된 객체 형식이어야 합니다.');
      for(const key of Object.keys(sample))if(!Object.hasOwn(value,key))fail([...path,key],'항목이 없습니다. 현재 홈페이지에서 다운로드한 파일을 사용하세요.');
      for(const key of Object.keys(value)) {
        if(!Object.hasOwn(sample,key))fail([...path,key],'알 수 없는 항목입니다. 현재 홈페이지의 파일 구조를 유지하세요.');
        validate(value[key],sample[key],[...path,key]);
      }
      return;
    }
    if(typeof value!==typeof sample)fail(path,typeof sample==='boolean'?'true 또는 false 값이어야 합니다.':typeof sample==='number'?'숫자 형식이어야 합니다.':'텍스트 형식이어야 합니다.');
    const key=path.at(-1);
    if(typeof value==='number') {
      if(!Number.isFinite(value)||!Number.isInteger(value))fail(path,'빈칸이나 소수 대신 정수를 입력하세요.');
      if(key==='year'&&(value<1900||value>new Date().getFullYear()+10))fail(path,`1900년부터 ${new Date().getFullYear()+10}년 사이의 연도를 입력하세요.`);
    }
    if(typeof value!=='string')return;
    const optional=key==='ko'||(path[0]==='publications'&&key==='note')||(path[0]==='projects'&&key==='url');
    if(!optional&&!value.trim())fail(path,'영문 홈페이지에 표시할 내용을 입력하세요.');
    if(key==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))fail(path,'예: name@university.edu 형식으로 이메일을 입력하세요.');
    if(['url','scholar','faculty'].includes(key)&&value) {
      let url;try{url=new URL(value);}catch{fail(path,'https://로 시작하는 전체 주소를 입력하세요.');}
      if(url.protocol!=='https:'||!url.hostname||url.username||url.password)fail(path,'로그인 정보가 없는 https:// 주소를 입력하세요.');
    }
    if(key==='portrait'||key==='image') {
      const parts=value.split('/');
      if(parts[0]!=='assets'||parts.length<2||parts.some(part=>!part||part==='.'||part==='..')||/[\\?#]/.test(value))fail(path,'assets/사진파일.png처럼 assets 폴더 안의 파일 경로를 입력하세요.');
    }
    if(key==='type'&&path[0]==='publications'&&!['journal','conference'].includes(value))fail(path,'journal 또는 conference를 선택하세요.');
  }
  function report(text, error=false) {status.textContent=text;status.classList.toggle('error',error);}
  function markInvalid(error) {form.querySelectorAll('[aria-invalid]').forEach(control=>control.removeAttribute('aria-invalid'));const control=[...form.querySelectorAll('[data-path]')].find(item=>item.dataset.path===error?.path?.join('.'));control?.setAttribute('aria-invalid','true');return control;}
  function focusControl(control) {if(!control)return;for(let parent=control.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;control.focus();}
  function focusPath(path) {focusControl([...form.querySelectorAll('[data-path]')].find(control=>control.dataset.path===path.join('.')||control.dataset.path.startsWith(path.join('.')+'.')));}
  function saveDraft() {dirty=true;try{validate(data);}catch(error){markInvalid(error);report(`수정 중 · ${error.message} 마지막 정상 임시 파일은 유지됩니다.`,true);return false;}markInvalid();try {localStorage.setItem(storageKey, JSON.stringify(data));report('브라우저에 임시 보관됨 · 공개 홈페이지 반영 전');}catch {report('수정 중 · 브라우저 임시 보관을 사용할 수 없습니다. 파일을 다운로드하여 보관하세요.');}return true;}
  function setAt(path, value) {let obj=data;for(const key of path.slice(0,-1)) obj=obj[key];obj[path.at(-1)]=value;saveDraft();}
  function getAt(path) {return path.reduce((obj,key)=>obj[key],data);}
  function templateAt(path) {let sample=original;path.forEach((key,index)=>{sample=Array.isArray(sample)?arraySample(sample,path.slice(0,index)):sample[key];});return sample;}
  function element(tag, text, className) {const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;}
  function cleanSample(value, key='') {
    if(Array.isArray(value)) return [];
    if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,cleanSample(v,k)]));
    if(typeof value==='number') return new Date().getFullYear();
    if(typeof value==='boolean') return false;
    return key==='type' ? 'conference' : '';
  }
  function inputField(value, path, key) {
    const wrapper=element('label',null,'field');wrapper.append(element('span',labels[key]||key));
    let control;
    if(key==='type' && path.includes('publications')) {control=element('select');[['journal','학술지 / Journal article'],['conference','학회 / Conference paper']].forEach(([v,t])=>{const option=element('option',t);option.value=v;control.append(option);});control.value=value;}
    else if(typeof value==='boolean') {control=element('input');control.type='checkbox';control.checked=value;}
    else if(typeof value==='number') {control=element('input');control.type='number';control.value=value;control.step='1';if(key==='year'){control.min='1900';control.max=String(new Date().getFullYear()+10);}}
    else if(key==='email'||['url','scholar','faculty'].includes(key)) {control=element('input');control.type=key==='email'?'email':'url';control.value=value;}
    else if(typeof value==='string' && (value.length>95 || ['text','intro','headline','interests','skills','note','en','ko'].includes(key))) {control=element('textarea');control.value=value;control.rows=value.length>220 ? 5 : 3;}
    else {control=element('input');control.type='text';control.value=value??'';}
    control.dataset.path=path.join('.');
    control.setAttribute('aria-describedby','section-help status');if(key==='en'||key==='ko')control.lang=key;
    control.addEventListener('input',()=>setAt(path,control.type==='checkbox'?control.checked:control.type==='number'?(control.value===''?NaN:Number(control.value)):control.value));
    wrapper.append(control);return wrapper;
  }
  function renderValue(value, path, key) {
    if(Array.isArray(value)) {
      const wrap=element('div',null,'array-field'),header=element('div',null,'array-header');header.append(element('h3',labels[key]||sections[key]||key));
      const add=element('button','항목 추가');add.type='button';add.dataset.arrayAction='add';add.dataset.listPath=path.join('.');add.setAttribute('aria-label',`${fieldName(path)}에 항목 추가`);add.addEventListener('click',()=>{const template=templateAt(path);const current=getAt(path);current.push(cleanSample(arraySample(template,path)));saveDraft();renderSection();focusPath([...path,current.length-1]);});header.append(add);wrap.append(header);
      value.forEach((item,index)=>{
        const details=element('details',null,'array-item');details.open=value.length<5;
        const desc=typeof item==='object' ? item.title || item.name || item.place || '' : item;
        details.append(element('summary',`${index+1}. ${typeof desc==='object' ? desc.en||desc.ko||'새 항목' : desc||'새 항목'}`));
        details.append(renderValue(item,[...path,index],String(index+1)));
        const actions=element('div',null,'item-actions');
        for(const [caption,delta] of [['위로',-1],['아래로',1]]) {const move=element('button',caption);move.type='button';move.disabled=index+delta<0||index+delta>=value.length;move.setAttribute('aria-label',`${fieldName([...path,index])} ${caption} 이동`);move.addEventListener('click',()=>{const list=getAt(path);[list[index],list[index+delta]]=[list[index+delta],list[index]];saveDraft();renderSection();focusPath([...path,index+delta]);});actions.append(move);}
        const remove=element('button','삭제','remove');remove.type='button';remove.dataset.arrayAction='remove';remove.dataset.listPath=path.join('.');remove.dataset.index=String(index);remove.setAttribute('aria-label',`${fieldName([...path,index])} 삭제`);remove.addEventListener('click',()=>{const list=getAt(path);list.splice(index,1);saveDraft();renderSection();const buttons=[...form.querySelectorAll('[data-array-action]')];focusControl(buttons.find(button=>button.dataset.listPath===path.join('.')&&button.dataset.arrayAction==='remove'&&button.dataset.index===String(Math.min(index,list.length-1)))||buttons.find(button=>button.dataset.listPath===path.join('.')&&button.dataset.arrayAction==='add'));});actions.append(remove);details.append(actions);wrap.append(details);
      });return wrap;
    }
    if(value && typeof value==='object') {
      const wrap=element('fieldset',null,'object-field');
      if(!/^\d+$/.test(key))wrap.append(element('legend',labels[key]||sections[key]||key));
      Object.entries(value).filter(([k])=>k!=='ko').forEach(([k,v])=>wrap.append(renderValue(v,[...path,k],k)));return wrap;
    }
    return inputField(value,path,key);
  }
  function renderSection() {document.querySelector('#section-title').textContent=sections[active];document.querySelector('#section-help').textContent=helps[active]||'각 항목의 영문 내용을 수정하고, 수정 파일을 다운로드하세요.';form.replaceChildren(renderValue(data[active],[active],active));document.querySelectorAll('#tabs button').forEach(button=>{if(button.dataset.section===active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});try{validate(data);}catch(error){markInvalid(error);}}
  try {const draft=localStorage.getItem(storageKey);if(draft){const parsed=JSON.parse(draft);validate(parsed);data=parsed;dirty=true;report('이 브라우저의 임시 수정 내용을 불러왔습니다.');}}catch(error){report(`임시 파일을 불러오지 못해 현재 공개 내용으로 시작합니다. ${error instanceof SyntaxError?'JSON 형식을 확인하세요.':error.message}`,true);}
  Object.entries(sections).forEach(([key,label])=>{const button=element('button',label);button.type='button';button.dataset.section=key;button.addEventListener('click',()=>{active=key;renderSection();});document.querySelector('#tabs').append(button);});
  form.addEventListener('submit',e=>e.preventDefault());
  document.querySelector('#download').addEventListener('click',()=>{
    try{validate(data);}catch(error){if(Object.hasOwn(sections,error.path?.[0])){active=error.path[0];renderSection();}report(`다운로드할 수 없습니다. ${error.message}`,true);focusControl(markInvalid(error));return;}
    const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=element('a');a.href=url;a.download='content.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);dirty=false;report('content.json 다운로드 완료 · GitHub의 같은 파일을 교체하거나 이 대화에 첨부하여 반영을 요청하세요.');
  });
  document.querySelector('#import-file').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>5*1024*1024)throw new Error('5MB 이하의 content.json 파일을 선택하세요.');const value=JSON.parse(await file.text());validate(value);data=value;saveDraft();renderSection();report('파일을 불러왔습니다. 수정 후 다운로드하세요.');}catch(error){report(`파일을 불러오지 못했습니다. ${error instanceof SyntaxError?'JSON 문법과 쉼표를 확인하세요.':error.message} 현재 수정 내용은 유지됩니다.`,true);}finally{e.target.value='';}});
  document.querySelector('#reset').addEventListener('click',()=>{if(!confirm('이 브라우저의 수정 내용을 지우고 현재 공개 내용으로 되돌릴까요?'))return;data=clone(original);dirty=false;try{localStorage.removeItem(storageKey);}catch{}renderSection();report('현재 공개 내용으로 되돌렸습니다.');});
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  renderSection();
})();
