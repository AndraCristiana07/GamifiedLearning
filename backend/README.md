## Backend

To recreate the database from scratch run:
```
./create_db.sh    
```
Failing to do so before starting the server will result in crashes during requests.


To populate the database with challenges run:
```
./BulkChallenges/upload_challenges.sh    
```
This needs to run while the backend is running