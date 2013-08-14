create database if not exists sharedWindows;
use sharedWindows;

/*drop table lists;*/
create table if not exists lists (
	id int not null auto_increment,
	createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	createdBy varchar(2083),
	currentPostId int,
	name varchar(2083),
	PRIMARY KEY (id)
);
create table if not exists items (
	id int not null auto_increment,
    createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	createdBy varchar(2083),
    latitude int,
    longitude int,
    url VARCHAR(2083),
    title VARCHAR(2083),
    thumbnail blob,
	pageId int,
	PRIMARY KEY (id)
);

insert into lists(createdBy, name) values ("King Willabee", "global");
insert into items(createdBy, latitude, longitude, url, title) values (
	"127.0.0.1",
	0, 0,
	"Sample!",
	"Sample"
);
update posts set pageId = (select id from pages where name = "global") where title = "global";

