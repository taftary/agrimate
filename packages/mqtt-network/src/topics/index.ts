export const Topics = {
  node: "node",
  user: "user",
  core: "core",
} as const;

export const Topic_Node_Actions = {
  state: "state",
  infos: "infos",
} as const;

export type AvailableTopicNodeActions =
  (typeof Topic_Node_Actions)[keyof typeof Topic_Node_Actions];

export const Topic_User_Actions = {
  plan: "plan",
  rule: "rule",
} as const;

export type AvailableTopicUserActions =
  (typeof Topic_User_Actions)[keyof typeof Topic_User_Actions];

export type TopicParams = Record<string, string> | null;

export function extractTopicParams(pattern: string, path: string): TopicParams {
  const keys: string[] = [];
  const regex = new RegExp(
    pattern.replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    })
  );

  const match = path.match(regex);
  if (!match) return null;

  return keys.reduce((acc, key, i) => {
    acc[key] = match[i + 1];
    return acc;
  }, {} as Record<string, string>);
}

// console.log(extractRoute("/users/:userId/books/:bookId", "/users/42/books/7"));
// { userId: "42", bookId: "7" }
