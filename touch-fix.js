/* Un toucher bref déclenche immédiatement les boutons et liens sur iOS/iPadOS. */
(()=>{'use strict';if(!('ontouchstart'in window)||window.__dicoPetsFastTap)return;window.__dicoPetsFastTap=true;let startX=0,startY=0,moved=false;
  document.addEventListener('touchstart',event=>{const touch=event.changedTouches[0];if(!touch)return;startX=touch.clientX;startY=touch.clientY;moved=false},{passive:true});
  document.addEventListener('touchmove',event=>{const touch=event.changedTouches[0];if(!touch)return;if(Math.abs(touch.clientX-startX)>12||Math.abs(touch.clientY-startY)>12)moved=true},{passive:true});
  document.addEventListener('touchend',event=>{if(moved||event.defaultPrevented)return;const target=event.target.closest('button,a,[role="button"]');if(!target||target.disabled||target.getAttribute('aria-disabled')==='true'||target.closest('[data-native-touch]'))return;event.preventDefault();target.click()},{passive:false});
})();
