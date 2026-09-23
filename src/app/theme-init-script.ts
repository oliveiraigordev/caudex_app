/** Inline no layout — evita flash antes do React hidratar. */
export const themeInitScript = `(function(){try{var k="caudexia-theme";var t=localStorage.getItem(k);if(t==="dark")document.documentElement.classList.add("dark");else if(t==="light")document.documentElement.classList.remove("dark");}catch(e){}})();`;
