document.querySelectorAll('.apartment-gallery').forEach(gallery=>{
  const main=gallery.querySelector('.gallery-main');
  const images=gallery.dataset.images ? JSON.parse(gallery.dataset.images) : [];
  const captions=gallery.dataset.captions ? JSON.parse(gallery.dataset.captions) : [];
  if(!images.length) return;
  let i=0;
  let imageEl=null;
  let offsetX=0, offsetY=0;
  let startX=null, startY=null, startOffsetX=0, startOffsetY=0;
  const dots=gallery.querySelector('.dots');
  const caption=gallery.querySelector('.gallery-caption');

  images.forEach((src,n)=>{
    const b=document.createElement('button');
    b.setAttribute('aria-label',`Image ${n+1}`);
    b.addEventListener('click',()=>show(n));
    dots.appendChild(b);
  });

  function layoutImage(center=true){
    if(!imageEl || !imageEl.naturalWidth || !imageEl.naturalHeight) return;
    const cw=main.clientWidth, ch=main.clientHeight;
    const scale=Math.max(cw/imageEl.naturalWidth, ch/imageEl.naturalHeight);
    const iw=imageEl.naturalWidth*scale, ih=imageEl.naturalHeight*scale;
    const maxX=Math.max(0,(iw-cw)/2), maxY=Math.max(0,(ih-ch)/2);
    if(center){
      offsetX=0;
      offsetY=0;
    }else{
      offsetX=Math.max(-maxX,Math.min(maxX,offsetX));
      offsetY=Math.max(-maxY,Math.min(maxY,offsetY));
    }
    imageEl.style.width=`${iw}px`;
    imageEl.style.height=`${ih}px`;
    imageEl.style.transform=`translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    imageEl.style.left='50%';
    imageEl.style.top='50%';
    gallery.classList.toggle('can-pan', maxX>0 || maxY>0);
  }

  function show(n){
    i=(n+images.length)%images.length;
    offsetX=0;
    offsetY=0;
    main.innerHTML='';
    imageEl=document.createElement('img');
    imageEl.src=images[i];
    imageEl.alt=captions[i]||`Apartment image ${i+1}`;
    imageEl.addEventListener('load',()=>layoutImage(true));
    main.appendChild(imageEl);
    if(caption) caption.textContent=captions[i]||'';
    [...dots.children].forEach((d,j)=>d.classList.toggle('active',j===i));
  }

  gallery.querySelector('.gallery-prev').addEventListener('click',()=>show(i-1));
  gallery.querySelector('.gallery-next').addEventListener('click',()=>show(i+1));

  // Drag the currently displayed photo itself. This pans the cropped image;
  // it does not change which photo is displayed.
  main.addEventListener('pointerdown',e=>{
    if(!imageEl) return;
    startX=e.clientX;
    startY=e.clientY;
    startOffsetX=offsetX;
    startOffsetY=offsetY;
    gallery.classList.add('dragging');
    main.setPointerCapture?.(e.pointerId);
  });

  main.addEventListener('pointermove',e=>{
    if(startX===null || !imageEl) return;
    offsetX=startOffsetX+(e.clientX-startX);
    offsetY=startOffsetY+(e.clientY-startY);
    layoutImage(false);
  });

  function endDrag(){
    if(startX===null) return;
    startX=null;
    startY=null;
    gallery.classList.remove('dragging');
  }
  main.addEventListener('pointerup',endDrag);
  main.addEventListener('pointercancel',endDrag);
  main.addEventListener('lostpointercapture',endDrag);

  window.addEventListener('resize',()=>layoutImage(false));
  show(0);
});
const form=document.querySelector('#enquiry-form');
if(form){
  const select=document.querySelector('#apartment-select');
  const status=document.querySelector('#form-status');
  const params=new URLSearchParams(window.location.search);
  const requested=params.get('apartment');
  if(requested && select && [...select.options].some(o=>o.value===requested)) select.value=requested;
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const button=form.querySelector('button[type="submit"]');
    button.disabled=true;
    button.textContent='Sending…';
    status.textContent='Sending your enquiry…';
    try{
      const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}});
      if(!response.ok) throw new Error('Submission failed');
      form.reset();
      status.textContent='Thanks — your enquiry has been sent. We will get back to you soon.';
    }catch(error){
      status.textContent='We could not send the enquiry. Please try again or contact us by phone/email.';
    }finally{
      button.disabled=false;
      button.textContent='Send Enquiry';
    }
  });
}
