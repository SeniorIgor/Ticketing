# What to implement:

1. Ensure that library available as modules and each service doesn't import the whole library.


// Best folder structure for api
src/features/user/
  server/
    getCurrentUser.ts
  api/
    signOut.ts
  hooks/
    useCurrentUserQuery.ts
    useSignOutMutation.ts
  types.ts