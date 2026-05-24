import { defineMiddleware } from "void";

export default defineMiddleware(async (c, next) => {
  c.set("headDefaults", {
    script: [
      {
        innerHTML: `(function(){var c=localStorage.getItem("color-mode"),d=c?c==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")})()`,
      },
    ],
  });
  await next();
});
