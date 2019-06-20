//required libraries
const AWS = require('aws-sdk');
const uuid = require('uuid');
const database_connector =  require('database_connector');
const s3 = new AWS.S3();

exports.transformS3Upload = function(event){
    console.log(event);
    var path = event.Records[0].s3.object.key.split('/');
    var srcBucket = event.Records[0].s3.object.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  

    if(path[0] == "private"){
        var user = findUserFromUUID(path[-2]);
        var newKey = "secure_store/" + uuid.uuid4();
        var size = s3.Object(event.bucket, event.key).content_length;
        s3.Object(event.bucket, newKey).copy_from(event.bucket + '/' + event.key);
        s3.Object(event.bucket, event.key).delete();

        return database_connector.insertDocument(user, path[-1], newKey, size);
    } else {
        return false;
    }
};