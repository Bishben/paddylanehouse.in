document.querySelectorAll('.apartment-gallery').forEach(gallery=>{
  const main=gallery.querySelector('.gallery-main');
  const images=gallery.dataset.images ? JSON.parse(gallery.dataset.images) : [];
  const captions=gallery.dataset.captions ? JSON.parse(gallery.dataset.captions) : [];
  if(!images.length) return;
  let i=0;
  const dots=gallery.querySelector('.dots');
  const caption=gallery.querySelector('.gallery-caption');
  images.forEach((src,n)=>{const b=document.createElement('button');b.setAttribute('aria-label',`Image ${n+1}`);b.addEventListener('click',()=>show(n));dots.appendChild(b)});
  function show(n){i=(n+images.length)%images.length;main.style.backgroundImage=`url("${images[i]}")`;if(caption) caption.textContent=captions[i]||'';[...dots.children].forEach((d,j)=>d.classList.toggle('active',j===i));}
  gallery.querySelector('.gallery-prev').addEventListener('click',()=>show(i-1));
  gallery.querySelector('.gallery-next').addEventListener('click',()=>show(i+1));
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
