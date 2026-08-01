/*
    Раньше здесь лежал resetOutputSession() — дубликат сброса,
    с несуществующими ссылками (sbs, resetState и т.д. без импортов).

    Все функции сброса собраны в одном месте: ../core/resetManager.js
    Этот файл оставлен только как точка-перенаправление.
*/
export { resetSession, resetOutputOnly, resetState, resetSBS } from "./resetManager.js";
