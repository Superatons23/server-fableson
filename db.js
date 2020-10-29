//create a new pool with configuration:
const Pool = require('pg').Pool;

const pool = new Pool({
'user':'scenathon_dev_db',
'password':'Bbq4q5ccHN3V09VK8laJ9uMXBh',
'host':'scenathon-db.cloud.geo-wiki.org',
'port': '3456',
'database':'scenathon_dev_db'

});



module.exports=pool;
