# Add Project Model

This migration adds the Project table to the database. The Project model was added to the Prisma schema but never actually created in the database. This migration creates the table with all the necessary fields, constraints, and indexes.

## Changes

1. Create the Project table with the following fields:
   - id (SERIAL, PRIMARY KEY)
   - createdAt (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   - updatedAt (TIMESTAMP)
   - name (TEXT, NOT NULL)
   - code (TEXT, NOT NULL, UNIQUE)
   - description (TEXT)
   - createdById (TEXT, NOT NULL, FOREIGN KEY to User.id)

2. Create a unique index on the code field

3. Add a foreign key constraint linking createdById to User.id