import { type RouteConfig, index, route } from "@react-router/dev/routes";


export default [
  // Layout principale per il recupero della sessione (/users/me)
  route("/", "routes/layout/recoveryAuthLayout.tsx", [
    index("routes/home.tsx"),

    route("/clubs/:id", "routes/club.tsx"),

    // Rotte riservate SOLTANTO ai visitatori (se loggato ti reindirizza altrove)
    route("/", "routes/layout/guestOnlyLayout.tsx", [
      route("/auth", "routes/auth.tsx"),
    ]),

    // Rotte PROTETTE: richiedono autenticazione (auth === true)
    route("/", "routes/layout/protectedLayout.tsx", [
      // route("/padel/:_id", "routes/padel.tsx"),
    ]),

  ]),
] satisfies RouteConfig;

