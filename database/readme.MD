Everything there is to know about the server:
=============================================


dbscheme.sql, hostedFiles, and old-db.sqlite are all "junk". They don't touch or effect the program in any way. Hosted files was going to hold photos users could upload, the scheme is for mySQL which was thrown away, and old-db is just a notworthy old database. Its very well populated, but may be broken these days.


dbClean.sqlite and db.sqlite are IMPORTANT.

The server will read and write from db.sqlite. If that every gets corropted, you can delete it, copy dbclean.sqlite, and rename it db.sqlite.

These are perfectly ordinary sqlite files. Use any sqlite browser to view them. 

Take a look in dbclean to see the starting scheme of the database. Its basically lists, items, their properties, and two starting lists (recent and global).