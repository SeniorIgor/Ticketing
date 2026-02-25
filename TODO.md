# What to implement:

1. Ensure that library support tree-shaking and each service doesn't import the whole library.
2. Add pagination in tickets and orders service similarly to payment service
3. Filter only available tickets (do not show complete or reserved tickets on the main page)
4. Fix concurrency issue when order created twice
5. Create production build and test