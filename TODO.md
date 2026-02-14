# What to implement:

1. Ensure that library available as modules and each service doesn't import the whole library.
2. Update the status or the order
3. Restrict ticket if order exist
4. Add different currency support
5. Add pagination in tickets and orders service similarly to payment service


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