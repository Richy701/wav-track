import{r as s,u as N,a as z,b as L,j as e,L as g,s as _,c as S}from"./index-7r94SV5T.js";import{c as l,L as f,I as v,B as o}from"./createLucideIcon-Bbx3HuoF.js";import{C,a as F}from"./card-Cmb2-fdh.js";import{T as A,F as E}from"./ThemeSwitcher-PkijkLn-.js";import{L as M,M as I}from"./mail-DBceN70-.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=l("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=l("AtSign",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8",key:"7n84p3"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=l("Github",[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",key:"tonef"}],["path",{d:"M9 18c-4.51 2-5-2-7-2",key:"9comsn"}]]),O=()=>{var b;const[c,y]=s.useState(""),[d,j]=s.useState(""),[m,x]=s.useState(!1),[r,p]=s.useState(""),{login:w,isAuthenticated:h}=N(),i=z(),n=((b=L().state)==null?void 0:b.from)||"/";s.useEffect(()=>{h&&i(n)},[h,i,n]);const k=async a=>{a.preventDefault(),x(!0);try{await w(c,d)&&i(n)}finally{x(!1)}},u=async a=>{try{p(a);const{error:t}=await _.auth.signInWithOAuth({provider:a,options:{redirectTo:`${window.location.origin}/auth/callback`}});if(t)throw t}catch(t){console.error(`${a} login error:`,t),S.error(`Failed to sign in with ${a}`),p("")}};return e.jsxs("div",{className:"min-h-screen bg-background flex flex-col",children:[e.jsx("div",{className:"absolute top-4 right-4 sm:top-6 sm:right-6 z-50",children:e.jsx(A,{})}),e.jsxs("main",{className:"flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden",children:[e.jsxs("div",{className:"absolute inset-0 overflow-hidden",children:[e.jsx("div",{className:"absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/10 via-primary/[0.02] to-transparent blur-3xl dark:from-primary/10 dark:via-primary/[0.02]"}),e.jsx("div",{className:"absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-primary/10 via-primary/[0.02] to-transparent blur-3xl dark:from-primary/10 dark:via-primary/[0.02]"})]}),e.jsxs("div",{className:"w-full max-w-[380px] sm:max-w-md relative",children:[e.jsxs("div",{className:"text-center mb-8 sm:mb-12",children:[e.jsx("h1",{className:"text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2 sm:mb-3 bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent",children:"WavTrack"}),e.jsxs("div",{className:"mt-4 sm:mt-6 space-y-1.5 sm:space-y-2",children:[e.jsx("p",{className:"text-xl sm:text-2xl text-zinc-800 dark:text-zinc-200 font-medium animate-fade-in",children:"Welcome"}),e.jsx("p",{className:"text-base sm:text-lg text-zinc-600 dark:text-zinc-400 animate-fade-in delay-100",children:"Sign in to continue your music journey"})]})]}),e.jsx(C,{className:"border-black/5 dark:border-white/5 shadow-xl dark:shadow-primary/10 bg-white/70 dark:bg-black/20 backdrop-blur-sm relative overflow-hidden",children:e.jsx("form",{onSubmit:k,className:"relative",children:e.jsxs(F,{className:"space-y-4 p-4 sm:p-6",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{htmlFor:"email",className:"text-sm font-medium inline-flex items-center text-zinc-800 dark:text-zinc-200",children:"Email address"}),e.jsxs("div",{className:"relative group",children:[e.jsx(T,{className:"absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-primary"}),e.jsx(v,{id:"email",type:"email",placeholder:"name@example.com",value:c,onChange:a=>y(a.target.value),className:"pl-10 bg-white dark:bg-black/40 border-zinc-200/50 dark:border-white/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 transition-all focus:bg-white dark:focus:bg-black/60 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(var(--primary),0.15)]",required:!0})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(f,{htmlFor:"password",className:"text-sm font-medium inline-flex items-center text-zinc-800 dark:text-zinc-200",children:"Password"}),e.jsx(g,{to:"/forgot-password",className:"text-xs text-primary hover:text-primary/90 transition-colors hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1.5 py-0.5",children:"Forgot password?"})]}),e.jsxs("div",{className:"relative group",children:[e.jsx(M,{className:"absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-primary"}),e.jsx(v,{id:"password",type:"password",placeholder:"••••••••",value:d,onChange:a=>j(a.target.value),className:"pl-10 bg-white dark:bg-black/40 border-zinc-200/50 dark:border-white/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 transition-all focus:bg-white dark:focus:bg-black/60 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(var(--primary),0.15)]",required:!0,minLength:6})]})]}),e.jsxs("div",{className:"relative my-6",children:[e.jsx("div",{className:"absolute inset-0 flex items-center",children:e.jsx("div",{className:"w-full border-t border-zinc-200/50 dark:border-white/10"})}),e.jsx("div",{className:"relative flex justify-center text-xs",children:e.jsx("span",{className:"bg-white/70 dark:bg-black/20 px-4 text-zinc-500 dark:text-zinc-400",children:"Or continue with"})})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsx(o,{type:"button",variant:"outline",onClick:()=>u("github"),disabled:!!r,className:"bg-background hover:bg-accent text-foreground hover:text-accent-foreground border border-input hover:border-accent transition-all focus:shadow-[0_0_0_3px_rgba(var(--primary),0.15)] active:scale-[0.98]",children:r==="github"?e.jsx("span",{className:"h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"}):e.jsxs(e.Fragment,{children:[e.jsx(W,{className:"h-4 w-4 mr-2"}),e.jsx("span",{children:"Github"})]})}),e.jsx(o,{type:"button",variant:"outline",onClick:()=>u("google"),disabled:!!r,className:"bg-background hover:bg-accent text-foreground hover:text-accent-foreground border border-input hover:border-accent transition-all focus:shadow-[0_0_0_3px_rgba(var(--primary),0.15)] active:scale-[0.98]",children:r==="google"?e.jsx("span",{className:"h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"}):e.jsxs(e.Fragment,{children:[e.jsx(I,{className:"h-4 w-4 mr-2"}),e.jsx("span",{children:"Google"})]})})]}),e.jsx(o,{type:"submit",className:"w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20",disabled:m||!!r,children:m?e.jsxs("span",{className:"flex items-center justify-center",children:[e.jsx("span",{className:"h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"}),e.jsx("span",{children:"Signing in..."})]}):e.jsxs("span",{className:"flex items-center justify-center group",children:[e.jsx("span",{children:"Sign in"}),e.jsx(G,{className:"ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"})]})})]})})}),e.jsx("div",{className:"mt-4 sm:mt-6 text-center",children:e.jsxs("p",{className:"text-sm sm:text-base text-zinc-600 dark:text-zinc-400",children:["Don't have an account?"," ",e.jsx(g,{to:"/register",className:"text-primary hover:text-primary/90 transition-colors hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1.5 py-0.5",children:"Create one"})]})})]})]}),e.jsx("div",{className:"relative",children:e.jsx("div",{className:"max-w-[380px] sm:max-w-md mx-auto px-4 pb-6 sm:pb-8",children:e.jsxs("div",{className:"relative bg-white/80 dark:bg-black/20 backdrop-blur-md border border-zinc-200/50 dark:border-white/5 rounded-xl p-6 sm:p-8 overflow-hidden text-center shadow-lg hover:shadow-xl transition-shadow duration-300",children:[e.jsx("div",{className:"absolute inset-0 bg-gradient-to-tr from-zinc-50/50 via-white/50 to-zinc-50/50 dark:from-primary/10 dark:via-transparent dark:to-primary/5"}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-transparent dark:via-background/50 opacity-50"}),e.jsx("div",{className:"absolute -left-32 -top-32 w-64 h-64 bg-primary/[0.03] dark:bg-primary/10 rounded-full blur-3xl animate-pulse"}),e.jsx("div",{className:"absolute -right-32 -bottom-32 w-64 h-64 bg-primary/[0.03] dark:bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{className:"mb-4 sm:mb-6",children:[e.jsx("div",{className:"text-xs sm:text-sm uppercase tracking-wider text-primary/90 font-semibold mb-2",children:"Coming Soon"}),e.jsx("h3",{className:"text-lg sm:text-xl font-semibold text-zinc-800 dark:bg-gradient-to-r dark:from-primary/90 dark:via-primary dark:to-primary/90 dark:bg-clip-text dark:text-transparent",children:"Level Up Your Workflow"})]}),e.jsx("div",{className:"h-px w-12 sm:w-16 mx-auto bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-primary/30 mb-4 sm:mb-6"}),e.jsxs("p",{className:"text-sm text-zinc-600 dark:text-muted-foreground/80 max-w-sm mx-auto font-medium",children:["Advanced analytics, collaboration tools, and deeper insights into your production journey.",e.jsx("span",{className:"block mt-1 text-primary/90 dark:text-primary/80",children:"Premium features in development."})]})]})]})})}),e.jsx(E,{})]})};export{O as default};
//# sourceMappingURL=Login-caW3rDli.js.map
