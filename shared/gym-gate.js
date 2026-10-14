import {requireGymAccess} from './gym-access.js';
try{
 await requireGymAccess();window.CogniLabGymAuthorized=true;
 document.documentElement.classList.remove('gym-access-pending');
}catch{
 window.CogniLabGymAuthorized=false;
 const href=new URL('../accesso.html',import.meta.url);href.search='?invitation=1';
 location.replace(href.href);
}
