(() => {
 const positions={Mela:0,Occhiali:1,Telefono:2,Chiave:3,Scarpa:4,Sedia:5,Auto:6,Fiore:7,Gatto:8,Casa:9,Palla:10,Gelato:11,Palloncino:12,Cane:13,Razzo:14,Pizza:15,Elefante:16};
 function markup(name){const index=positions[name];if(index===undefined)return '';const column=index%6,row=Math.floor(index/6);return `<span class="cl-object-photo" role="img" aria-label="${name}" style="background-position:${column*20}% ${row*50}%"></span>`;}
 window.CogniLabObjects={markup,positions};
})();
