import { defineMiddleware } from "astro:middleware";

const API_URL = import.meta.env.DEV
  ? "http://localhost:2012/graphql"
  : import.meta.env.PUBLIC_API_URL || "https://api.graphqlweekly.com/graphql";

interface MeResponse {
  data: {
    me: {
      isCollaborator: boolean;
    } | null;
  };
}

export const onRequest = defineMiddleware(async (context, next) => {
  const isProtectedRoute = context.url.pathname.startsWith("/issue/");

  if (!isProtectedRoute) {
    return next();
  }

  const response = await fetch(API_URL, {
    body: JSON.stringify({
      query: "{ me { isCollaborator } }",
    }),
    headers: {
      "Content-Type": "application/json",
      Cookie: context.request.headers.get("Cookie") || "",
    },
    method: "POST",
  });

  const result = (await response.json()) as MeResponse;
  const me = result.data?.me;

  if (!me) {
    return context.redirect("/login");
  }

  if (!me.isCollaborator) {
    return context.redirect("/access-denied");
  }

  return next();
});
