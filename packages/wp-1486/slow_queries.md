
### Slow Queries
- Finding Transaction Requests
    - Client disconnect
    - bad index resulting in large scans `"docsExamined": 1596991`
        - Filter by walletId, enterpriseId, sequenceId, sort by _id

    - cached plan was less efficient
- Find Transfers
    - finding transfer by walletId and date range with limit 100, projected on value 
    majority of the time is spent reading the actual bytes from storage

