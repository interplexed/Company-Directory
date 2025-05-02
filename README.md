# Company Directory - Who's Who In Your Org

>[!NOTE]
>This was submitted for a project in 2024, and has only had minor enhancements since

## Description
Set the scene - 18 months ago the project was commissioned, but the developer's left and now there's a partially completed application to be fixed and finished *as expected*.  
Interact with the [Company Directory](https://lewiscooper.dev/companydirectory) of personnel, department and location data to keep on top of the most up to date information, and enhance collaboration by finding out who is who, where they are, and what they do.  

## Project Objectives
### Build A Company Directory App
* Pick up on what's been started and work within layout, feature and schema constraints
* Ensure create, read, update and delete functionality from the dashboard
* Create filterable views of the tables
* Implement a search feature
* Restrict delete operations where dependent records exist

### User Experience
* Ensure the app functions well on small portable devices like mobile phones
* Retain the existing layout and demonstrate features of the frontend framework
* Provide full control over records in each table
* Straightforward interaction with data via helpful features
* Find people more easily using search or filters

### Skills, Languages, Libraries
* SQL (MariaDB 10+)
* PHP 8.2+
* Bootstrap 5+
* FontAwesome 6.5+
* JQuery 3.7+
* HTML / CSS / JavaScript ES6+

## How To Use
* Download or clone this repository to, for example a container or server running XAMPP, and replicate into the /opt/lampp/htdocs directory
* Create a database in MariaDB, along with the tables in the SQL script, and ensure a user with permissions
* Recreate a .env file, containing the database authentication details
* Optionally, pre-populate the database tables with some records, e.g. via a command line database client
* Navigate to the appropriate `http://<server>:<port>` endpoint in a web browser
