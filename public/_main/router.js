function _0xabe0(){const _0x4434d5=['signIn','forEach','436429caZXMi','innerHTML','\x20/>','87215ZdanFa','join','ERROR','/404.html','loadComponent','keys','push','10934oQDrKF','split','href','41WXqSxF','getElementsByTagName','489ZuSTLU','notification','main','5074718tbaNIh','component','navigation','validate','REDIRECT','1117944DqRUdX','NOTIFICATION','title','onAuthStateChanged','INFO','pathname','location','3433160XjopBG','TOAST','6788zxSivI','SEVERITY','map','Error\x20getting\x20query\x20params','180kvNpJo','TYPE','LOAD_COMPONENT','18YILMzm','currentUser','page','find','host'];_0xabe0=function(){return _0x4434d5;};return _0xabe0();}const _0x3a4449=_0xf9fb;(function(_0x18f547,_0x1ab0f0){const _0x577589=_0xf9fb,_0x3922c9=_0x18f547();while(!![]){try{const _0x3c38ef=parseInt(_0x577589(0x1ec))/0x1*(-parseInt(_0x577589(0x1e9))/0x2)+parseInt(_0x577589(0x1ee))/0x3*(parseInt(_0x577589(0x1ff))/0x4)+parseInt(_0x577589(0x1e2))/0x5*(parseInt(_0x577589(0x203))/0x6)+-parseInt(_0x577589(0x20d))/0x7+parseInt(_0x577589(0x1f6))/0x8*(-parseInt(_0x577589(0x206))/0x9)+-parseInt(_0x577589(0x1fd))/0xa+parseInt(_0x577589(0x1f1))/0xb;if(_0x3c38ef===_0x1ab0f0)break;else _0x3922c9['push'](_0x3922c9['shift']());}catch(_0xb60aed){_0x3922c9['push'](_0x3922c9['shift']());}}}(_0xabe0,0x55ec7));import{userSession,userSignIn}from'./auth.js';import{CONSTANT}from'./constants.js';import{getI18nContent}from'./i18n.js';import{bapNotify}from'./util.js';const NAVIGATION_TYPES={'REDIRECT':'redirect','LOAD_COMPONENT':_0x3a4449(0x1e6)},routerI18n=getI18nContent(_0x3a4449(0x208),'cross');function _0xf9fb(_0x200842,_0x28d238){const _0xabe057=_0xabe0();return _0xf9fb=function(_0xf9fbaf,_0x43ed0c){_0xf9fbaf=_0xf9fbaf-0x1e0;let _0x16c67f=_0xabe057[_0xf9fbaf];return _0x16c67f;},_0xf9fb(_0x200842,_0x28d238);}export const routes=[{'pathname':'/','component':null,'navigation':NAVIGATION_TYPES[_0x3a4449(0x1f5)],'validate':{'signIn':![]}},{'pathname':_0x3a4449(0x1e5),'component':null,'navigation':NAVIGATION_TYPES[_0x3a4449(0x1f5)],'validate':{'signIn':![]}}];const isAValidRoute=_0x21028c=>{const _0x24ec17=_0x3a4449;for(const _0x122656 of routes){if(_0x122656[_0x24ec17(0x1fb)]==_0x21028c)return!![];}return![];},paramsToQueryParams=_0x50f780=>{const _0x25b20a=_0x3a4449;let _0x2c2e96=[];for(const _0xfde885 of Object[_0x25b20a(0x1e7)](_0x50f780)){_0x2c2e96[_0x25b20a(0x1e8)](_0xfde885+'='+_0x50f780[_0xfde885]);}return _0x2c2e96['join']('&');},isAccessAllowed=async _0x47617e=>{const _0x4b430e=_0x3a4449;if(_0x47617e[_0x4b430e(0x1f4)][_0x4b430e(0x20b)]){if(!userSession[_0x4b430e(0x207)])return![];}return!![];},navigateTo=(_0x587fd2,_0x22c5a5)=>{const _0x3d0b61=_0x3a4449,_0x2631da=''+_0x587fd2[_0x3d0b61(0x1fb)]+(_0x22c5a5?'?'+paramsToQueryParams(_0x22c5a5):'');switch(_0x587fd2[_0x3d0b61(0x1f3)]){case NAVIGATION_TYPES['REDIRECT']:window[_0x3d0b61(0x1fc)]['href']=_0x2631da;break;case NAVIGATION_TYPES[_0x3d0b61(0x205)]:history['pushState']({'state':'ok'},_0x587fd2['title'],_0x2631da),document[_0x3d0b61(0x1f8)]=_0x587fd2[_0x3d0b61(0x1f8)];break;}},loadContent=_0x2cbcf7=>{const _0x7462d2=_0x3a4449,_0x23acd7=window[_0x7462d2(0x1fc)][_0x7462d2(0x1eb)]['split']('?')[0x1]['split']('&'),_0x2067c5=[..._0x23acd7[_0x7462d2(0x201)](_0x1c8592=>_0x1c8592[_0x7462d2(0x1ea)]('=')[0x0]+'='+_0x1c8592[_0x7462d2(0x1ea)]('=')[0x1])];document[_0x7462d2(0x1ed)](_0x7462d2(0x1f0))[0x0][_0x7462d2(0x1e0)]='<'+_0x2cbcf7[_0x7462d2(0x1f2)]+'\x20'+_0x2067c5[_0x7462d2(0x1e3)]('\x20')+_0x7462d2(0x1e1);};export async function goTo(_0x396b43,_0x1ff6f4){const _0x5624b0=_0x3a4449;if(!isAValidRoute(_0x396b43)){window[_0x5624b0(0x1fc)][_0x5624b0(0x1eb)](window[_0x5624b0(0x1fc)][_0x5624b0(0x20a)]+_0x5624b0(0x1e5));return;}const _0x3c265e=routes[_0x5624b0(0x209)](_0x3bb146=>_0x3bb146[_0x5624b0(0x1fb)]==_0x396b43);await isAccessAllowed(_0x3c265e)?(navigateTo(_0x3c265e,_0x1ff6f4),loadContent(_0x3c265e)):bapNotify(CONSTANT[_0x5624b0(0x1f7)][_0x5624b0(0x204)][_0x5624b0(0x1fe)],CONSTANT[_0x5624b0(0x1f7)][_0x5624b0(0x200)][_0x5624b0(0x1fa)],routerI18n[_0x5624b0(0x1ef)]['notAllowedEnteringPage']);}export function getQueryParams(){const _0xd20d79=_0x3a4449;let _0x365a74={};try{const _0x158e2d=window[_0xd20d79(0x1fc)][_0xd20d79(0x1eb)][_0xd20d79(0x1ea)]('?')[0x1][_0xd20d79(0x1ea)]('&');_0x158e2d[_0xd20d79(0x20c)](_0x5ec6be=>{const _0x55b278=_0xd20d79;let _0x55afd6=_0x5ec6be[_0x55b278(0x1ea)]('=');_0x365a74[_0x55afd6[0x0]]=_0x55afd6[0x1];});}catch(_0x577b40){bapNotify(CONSTANT['NOTIFICATION'][_0xd20d79(0x204)]['TOAST'],CONSTANT[_0xd20d79(0x1f7)][_0xd20d79(0x200)][_0xd20d79(0x1e4)],routerI18n[_0xd20d79(0x1ef)]['errorGettingQueryParams']),console['log'](_0xd20d79(0x202),_0x577b40);}return _0x365a74;}export function sessionStartedControl(_0x25d18e,_0x1e5e70,_0x144a0c){const _0x3c0118=_0x3a4449,_0x163acd=routes[_0x3c0118(0x209)](_0x8e9935=>_0x8e9935[_0x3c0118(0x1fb)]==_0x25d18e);_0x163acd[_0x3c0118(0x1f4)][_0x3c0118(0x20b)]&&userSession[_0x3c0118(0x1f9)](()=>{const _0x2d44fe=_0x3c0118;if(!userSession[_0x2d44fe(0x207)]){const _0x461b24=!_0x144a0c?()=>goTo(routes[0x0][_0x2d44fe(0x1fb)]):_0x144a0c;!_0x1e5e70?_0x461b24():userSignIn();}});}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvdXJjZU1hcCJdLCJuYW1lcyI6WyJOQVZJR0FUSU9OX1RZUEVTIiwicm91dGVySTE4biIsImdldEkxOG5Db250ZW50Iiwicm91dGVzIiwiaXNBVmFsaWRSb3V0ZSIsIl8weDIxMDI4YyIsIl8weDEyMjY1NiIsInBhcmFtc1RvUXVlcnlQYXJhbXMiLCJfMHg1MGY3ODAiLCJfMHgyYzJlOTYiLCJfMHhmZGU4ODUiLCJPYmplY3QiLCJpc0FjY2Vzc0FsbG93ZWQiLCJfMHg0NzYxN2UiLCJ1c2VyU2Vzc2lvbiIsIm5hdmlnYXRlVG8iLCJfMHg1ODdmZDIiLCJfMHgyMmM1YTUiLCJfMHgyNjMxZGEiLCJ3aW5kb3ciLCJoaXN0b3J5IiwiZG9jdW1lbnQiLCJsb2FkQ29udGVudCIsIl8weDJjYmNmNyIsIl8weDIzYWNkNyIsIl8weDIwNjdjNSIsIl8weDFjODU5MiIsImdvVG8iLCJfMHgzOTZiNDMiLCJfMHgxZmY2ZjQiLCJfMHgzYzI2NWUiLCJfMHgzYmIxNDYiLCJiYXBOb3RpZnkiLCJDT05TVEFOVCIsImdldFF1ZXJ5UGFyYW1zIiwiXzB4MzY1YTc0IiwiXzB4MTU4ZTJkIiwiXzB4NWVjNmJlIiwiXzB4NTVhZmQ2IiwiXzB4NTc3YjQwIiwiY29uc29sZSIsInNlc3Npb25TdGFydGVkQ29udHJvbCIsIl8weDI1ZDE4ZSIsIl8weDFlNWU3MCIsIl8weDE0NGEwYyIsIl8weDE2M2FjZCIsIl8weDhlOTkzNSIsIl8weDQ2MWIyNCIsInVzZXJTaWduSW4iXSwibWFwcGluZ3MiOiJvd0NBQUEsT0FBUyxXQUFULENBQXNCLFVBQXRCLEssV0FBQSxDQUNBLE9BQVMsUUFBVCxLLGdCQUFBLENBQ0EsT0FBUyxjQUFULEssV0FBQSxDQUNBLE9BQVMsU0FBVCxLLFdBQUEsQ0FFQSxNQUFNQSxnQkFBQSxDQUFtQixDLFVBQ3ZCLEMsVUFEdUIsQyxnQkFFdkIsQyxnQkFGdUIsQ0FBekIsQ0FLTUMsVUFBQSxDQUFhQyxjQUFBLEMsZ0JBQUEsQyxPQUFBLENBTG5CLEMsMk5BVUEs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QUFBLEUsR0FMaEMsQyIsImZpbGUiOiJfbWFpbi9yb3V0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VyU2Vzc2lvbiwgdXNlclNpZ25JbiB9IGZyb20gXCIuL2F1dGguanNcIjtcbmltcG9ydCB7IENPTlNUQU5UIH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5pbXBvcnQgeyBnZXRJMThuQ29udGVudCB9IGZyb20gXCIuL2kxOG4uanNcIjtcbmltcG9ydCB7IGJhcE5vdGlmeSB9IGZyb20gXCIuL3V0aWwuanNcIjtcblxuY29uc3QgTkFWSUdBVElPTl9UWVBFUyA9IHtcbiAgUkVESVJFQ1Q6IFwicmVkaXJlY3RcIixcbiAgTE9BRF9DT01QT05FTlQ6IFwibG9hZENvbXBvbmVudFwiLFxufTtcblxuY29uc3Qgcm91dGVySTE4biA9IGdldEkxOG5Db250ZW50KCdwYWdlJywgJ2Nyb3NzJyk7XG5cbi8qKlxuICogQ29udHJvbGVkIHJvdXRlc1xuICovXG5leHBvcnQgY29uc3Qgcm91dGVzID0gW1xuICB7XG4gICAgcGF0aG5hbWU6IFwiL1wiLFxuICAgIGNvbXBvbmVudDogbnVsbCxcbiAgICBuYXZpZ2F0aW9uOiBOQVZJR0FUSU9OX1RZUEVTLlJFRElSRUNULFxuICAgIHZhbGlkYXRlOiB7XG4gICAgICBzaWduSW46IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBwYXRobmFtZTogXCIvNDA0Lmh0bWxcIixcbiAgICBjb21wb25lbnQ6IG51bGwsXG4gICAgbmF2aWdhdGlvbjogTkFWSUdBVElPTl9UWVBFUy5SRURJUkVDVCxcbiAgICB2YWxpZGF0ZToge1xuICAgICAgc2lnbkluOiBmYWxzZSxcbiAgICB9LFxuICB9LFxuXTtcblxuY29uc3QgaXNBVmFsaWRSb3V0ZSA9IChwYXRobmFtZSkgPT4ge1xuICBmb3IgKGNvbnN0IHJvdXRlIG9mIHJvdXRlcykge1xuICAgIGlmIChyb3V0ZS5wYXRobmFtZSA9PSBwYXRobmFtZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgcGFyYW1zVG9RdWVyeVBhcmFtcyA9IChwYXJhbXMpID0+IHtcbiAgbGV0IGFycmF5UXVlcnlQYXJhbXMgPSBbXTtcbiAgZm9yIChjb25zdCBuYW1lIG9mIE9iamVjdC5rZXlzKHBhcmFtcykpIHtcbiAgICBhcnJheVF1ZXJ5UGFyYW1zLnB1c2goYCR7bmFtZX09JHtwYXJhbXNbbmFtZV19YCk7XG4gIH1cbiAgcmV0dXJuIGFycmF5UXVlcnlQYXJhbXMuam9pbihcIiZcIik7XG59O1xuXG5jb25zdCBpc0FjY2Vzc0FsbG93ZWQgPSBhc3luYyAocm91dGUpID0+IHtcbiAgaWYgKHJvdXRlLnZhbGlkYXRlLnNpZ25Jbikge1xuICAgIGlmICghdXNlclNlc3Npb24uY3VycmVudFVzZXIpIHtcbiAgICAgIC8vIE5vdGlmaWNhdGlvblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgbmF2aWdhdGVUbyA9IChyb3V0ZSwgcGFyYW1zKSA9PiB7XG4gIGNvbnN0IHVybCA9IGAke3JvdXRlLnBhdGhuYW1lfSR7cGFyYW1zID8gXCI/XCIgKyBwYXJhbXNUb1F1ZXJ5UGFyYW1zKHBhcmFtcykgOiBcIlwifWA7XG5cbiAgc3dpdGNoIChyb3V0ZS5uYXZpZ2F0aW9uKSB7XG4gICAgY2FzZSBOQVZJR0FUSU9OX1RZUEVTLlJFRElSRUNUOlxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE5BVklHQVRJT05fVFlQRVMuTE9BRF9DT01QT05FTlQ6XG4gICAgICBoaXN0b3J5LnB1c2hTdGF0ZShcbiAgICAgICAge1xuICAgICAgICAgIHN0YXRlOiBcIm9rXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHJvdXRlLnRpdGxlLFxuICAgICAgICB1cmxcbiAgICAgICk7XG5cbiAgICAgIGRvY3VtZW50LnRpdGxlID0gcm91dGUudGl0bGU7XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuY29uc3QgbG9hZENvbnRlbnQgPSAocm91dGUpID0+IHtcbiAgY29uc3QgcXVlcnlQYXJhbXMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdChcIj9cIilbMV0uc3BsaXQoXCImXCIpO1xuICBjb25zdCBwYXJhbXMgPSBbLi4ucXVlcnlQYXJhbXMubWFwKChwYXJhbSkgPT4gYCR7cGFyYW0uc3BsaXQoXCI9XCIpWzBdfT0ke3BhcmFtLnNwbGl0KFwiPVwiKVsxXX1gKV07XG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwibWFpblwiKVswXS5pbm5lckhUTUwgPSBgPCR7cm91dGUuY29tcG9uZW50fSAke3BhcmFtcy5qb2luKFwiIFwiKX0gLz5gO1xufTtcblxuLyoqXG4gKiBjaGFuZ2UgcGF0aCByb3V0ZSBmb3IgbmF2aWdhdGlvbiBjb250cm9sXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aG5hbWUuIEVnLiAvYXJyZW5kYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMuIEVnLiB7aWQ6IDEsIE90aGVyOiBcImhvbGFcIn1cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdvVG8ocGF0aG5hbWUsIHBhcmFtcykge1xuICBpZiAoIWlzQVZhbGlkUm91dGUocGF0aG5hbWUpKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYoYCR7d2luZG93LmxvY2F0aW9uLmhvc3R9LzQwNC5odG1sYCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qgcm91dGVUb05hdmlnYXRlID0gcm91dGVzLmZpbmQoKHJvdXRlKSA9PiByb3V0ZS5wYXRobmFtZSA9PSBwYXRobmFtZSk7XG4gIGlmIChhd2FpdCBpc0FjY2Vzc0FsbG93ZWQocm91dGVUb05hdmlnYXRlKSkge1xuICAgIG5hdmlnYXRlVG8ocm91dGVUb05hdmlnYXRlLCBwYXJhbXMpO1xuICAgIGxvYWRDb250ZW50KHJvdXRlVG9OYXZpZ2F0ZSk7XG4gIH0gZWxzZSB7XG4gICAgYmFwTm90aWZ5KFxuICAgICAgQ09OU1RBTlQuTk9USUZJQ0FUSU9OLlRZUEUuVE9BU1QsXG4gICAgICBDT05TVEFOVC5OT1RJRklDQVRJT04uU0VWRVJJVFkuSU5GTyxcbiAgICAgIHJvdXRlckkxOG4ubm90aWZpY2F0aW9uLm5vdEFsbG93ZWRFbnRlcmluZ1BhZ2VcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIHN0cmluZyBxdWVyeXBhcmFtcyBpbnRvIGFuIG9iamVjdFxuICogQHJldHVybnMgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRRdWVyeVBhcmFtcygpIHtcbiAgbGV0IHBhcmFtcyA9IHt9O1xuICB0cnkge1xuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoXCI/XCIpWzFdLnNwbGl0KFwiJlwiKTtcbiAgICBxdWVyeVBhcmFtcy5mb3JFYWNoKChwYXJhbSkgPT4ge1xuICAgICAgbGV0IHBhcmFtVmFsdWUgPSBwYXJhbS5zcGxpdChcIj1cIik7XG4gICAgICBwYXJhbXNbcGFyYW1WYWx1ZVswXV0gPSBwYXJhbVZhbHVlWzFdO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJhcE5vdGlmeShcbiAgICAgIENPTlNUQU5ULk5PVElGSUNBVElPTi5UWVBFLlRPQVNULFxuICAgICAgQ09OU1RBTlQuTk9USUZJQ0FUSU9OLlNFVkVSSVRZLkVSUk9SLFxuICAgICAgcm91dGVySTE4bi5ub3RpZmljYXRpb24uZXJyb3JHZXR0aW5nUXVlcnlQYXJhbXNcbiAgICApO1xuICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgZ2V0dGluZyBxdWVyeSBwYXJhbXNcIiwgZXJyb3IpO1xuICB9XG5cbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuLyoqXG4gKiBJbiBjYXNlIG9mIGFjY2VzcyB0byBhIHNlc3Npb24gc3RhcnRlZCB2YWxpZGF0ZWQgcGFnZSwgdGhpcyB3aWxsIHJlZGlyZWN0IHRvIGxhbmRpbmcgb25lXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlc3Npb25TdGFydGVkQ29udHJvbChwYXRobmFtZSwgaW5pdFNlc3Npb24sIHJlZGlyZWN0aW9uQ2FsbGJhY2tPbk5vU2Vzc2lvbikge1xuICBjb25zdCByb3V0ZVRvTmF2aWdhdGUgPSByb3V0ZXMuZmluZCgocm91dGUpID0+IHJvdXRlLnBhdGhuYW1lID09IHBhdGhuYW1lKTtcbiAgaWYgKHJvdXRlVG9OYXZpZ2F0ZS52YWxpZGF0ZS5zaWduSW4pIHtcbiAgICB1c2VyU2Vzc2lvbi5vbkF1dGhTdGF0ZUNoYW5nZWQoKCkgPT4ge1xuICAgICAgaWYgKCF1c2VyU2Vzc2lvbi5jdXJyZW50VXNlcikge1xuICAgICAgICBjb25zdCByZWRpcmVjdCA9ICFyZWRpcmVjdGlvbkNhbGxiYWNrT25Ob1Nlc3Npb25cbiAgICAgICAgICA/ICgpID0+IGdvVG8ocm91dGVzWzBdLnBhdGhuYW1lKVxuICAgICAgICAgIDogcmVkaXJlY3Rpb25DYWxsYmFja09uTm9TZXNzaW9uO1xuICAgICAgICAhaW5pdFNlc3Npb24gPyByZWRpcmVjdCgpIDogdXNlclNpZ25JbigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59Il19