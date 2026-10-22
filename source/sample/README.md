# Sample data for tests

`tx.csv` is a made-up year of transactions (no real person's data) in the same columns as a bank export:
Date, Amount, Description, Category, Account, Status.

The browser tests in `sprout/` read `../csvin/tx.csv`. To run them, copy this file there:

    mkdir -p csvin && cp sample/tx.csv csvin/tx.csv

Never commit a real export to GitHub.
